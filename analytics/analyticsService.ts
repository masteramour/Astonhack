/**
 * analyticsService.ts
 * 
 * This file contains core analytics logic for processing volunteer and event data.
 * It includes functions for calculating scores, generating insights, and analyzing trends.
 */

import { getDatabase } from '../services/database';
import * as qb from '../services/queryBuilder';
import { extractInterests, inferCulturalBackground, detectTrendCategories, calculateAverage, calculateEngagementRate } from './utils';
import type {
  LocationStats,
  CulturalProfile,
  ParticipationRecord,
  TrendAnalysis,
  Trend,
  AnalyticsResponse
} from './types';

// ==================== LOCATION ANALYTICS ====================

/**
 * Analyzes event distribution and performance across locations
 * Identifies high-performing locations and underserved areas
 */
export async function analyzeLocationStats() {
  try {
    const db = await getDatabase();

    // Get aggregated stats per location
    const query = `
      SELECT 
        e.Location as location,
        COUNT(DISTINCT e.Events_ID) as totalEvents,
        COALESCE(SUM(volunteer_count), 0) + COALESCE(SUM(attendee_count), 0) as totalParticipants,
        e.NumOfVolunteersneeded as volunteersNeeded,
        CAST(COALESCE(SUM(volunteer_count), 0) as FLOAT) / 
          NULLIF(CAST(SUM(e.NumOfVolunteersneeded) as FLOAT), 0) as fulfillmentRate
      FROM Events e
      LEFT JOIN (
        SELECT Events_ID, COUNT(*) as volunteer_count
        FROM VolEventsResolver
        GROUP BY Events_ID
      ) v ON e.Events_ID = v.Events_ID
      LEFT JOIN (
        SELECT Events_ID, COUNT(*) as attendee_count
        FROM AttendeeEventsResolver
        GROUP BY Events_ID
      ) a ON e.Events_ID = a.Events_ID
      WHERE e.Location IS NOT NULL
      GROUP BY e.Location
      HAVING totalEvents > 0
      ORDER BY totalParticipants DESC
    `;

    const [rawResults] = await db.execute(query) as any;

    const locationStats = (rawResults as any[]).map((row: any) => ({
      location: row.location || 'Unknown',
      totalEvents: row.totalEvents || 0,
      totalParticipants: row.totalParticipants || 0,
      averageParticipantsPerEvent: row.totalEvents > 0 
        ? Math.round((row.totalParticipants || 0) / row.totalEvents) 
        : 0,
      volunteerDemand: row.volunteersNeeded || 0,
      successRate: Math.min(100, Math.round((row.fulfillmentRate || 0) * 100))
    }));

    return {
      success: true,
      data: locationStats,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: locationStats.length,
        confidence: 0.85
      }
    };
  } catch (error) {
    console.error('Location analytics error:', error);
    return {
      success: false,
      data: [],
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

/**
 * Calculates event density and identifies location gaps
 */
export async function identifyLocationGaps() {
  try {
    const locationStats = await analyzeLocationStats();

    if (!locationStats.success || locationStats.data.length === 0) {
      return {
        success: false,
        data: { underservedAreas: [], oversaturatedAreas: [], balancedAreas: [] },
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: 0,
          confidence: 0
        }
      };
    }

    const avgParticipants = (locationStats.data as any[]).reduce((sum: number, loc: any) => 
      sum + (loc.averageParticipantsPerEvent || 0), 0) / locationStats.data.length;

    const underservedAreas = locationStats.data
      .filter(loc => loc.averageParticipantsPerEvent < avgParticipants * 0.6)
      .map(loc => loc.location);

    const oversaturatedAreas = locationStats.data
      .filter(loc => loc.averageParticipantsPerEvent > avgParticipants * 1.5)
      .map(loc => loc.location);

    const balancedAreas = locationStats.data
      .filter(loc => 
        loc.averageParticipantsPerEvent >= avgParticipants * 0.6 &&
        loc.averageParticipantsPerEvent <= avgParticipants * 1.5
      )
      .map(loc => loc.location);

    return {
      success: true,
      data: { underservedAreas, oversaturatedAreas, balancedAreas },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: locationStats.data.length,
        confidence: 0.75
      }
    };
  } catch (error) {
    console.error('Location gap analysis error:', error);
    return {
      success: false,
      data: { underservedAreas: [], oversaturatedAreas: [], balancedAreas: [] },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== CULTURAL ANALYTICS ====================

/**
 * Builds cultural profiles for users based on their data
 * Extracts language, background, and participation patterns
 */
export async function buildCulturalProfile(userId: number, userType: 'volunteer' | 'attendee'): Promise<CulturalProfile | null> {
  try {
    const db = await getDatabase();

    // Get user basic info
    const userTable = userType === 'volunteer' ? 'Volunteers' : 'Attendee';
    const idColumn = userType === 'volunteer' ? 'Volunteer_ID' : 'Attendee_ID';
    const user = await qb.selectById(db, userTable, idColumn, userId);

    if (!user) return null;

    // Parse languages
    const languages = (user as any).LanguagesSpoken
      ? (user as any).LanguagesSpoken.split(',').map((l: string) => l.trim())
      : ['English'];

    // Get participation history
    const resolverTable = userType === 'volunteer' ? 'VolEventsResolver' : 'AttendeeEventsResolver';
    const userIdColumn = userType === 'volunteer' ? 'Volunteer_ID' : 'Attendee_ID';

    const [history] = await db.execute(
      `SELECT e.Events_ID, e.Name, e.Date, e.Location
       FROM Events e
       INNER JOIN ${resolverTable} r ON e.Events_ID = r.Events_ID
       WHERE r.${userIdColumn} = ?
       ORDER BY e.Date DESC`,
      [userId]
    );

    const participationHistory: ParticipationRecord[] = (history as any[]).map(event => ({
      eventId: event.Events_ID,
      eventName: event.Name,
      date: event.Date,
      role: userType
    }));

    // Extract interests from event names
    const interests = extractInterests((history as any[]).map(e => e.Name));
    const locationPreferences = [...new Set((history as any[]).map(e => e.Location).filter(Boolean))];

    return {
      userId: userId.toString(),
      languages,
      culturalBackground: inferCulturalBackground(languages),
      interests,
      eventPreferences: interests,
      locationPreferences,
      participationHistory
    };
  } catch (error) {
    console.error('Cultural profile building error:', error);
    return null;
  }
}

// ==================== TREND ANALYSIS ====================

/**
 * Analyzes trends over time to identify patterns
 */
export async function analyzeTrends(startDate?: string, endDate?: string): Promise<AnalyticsResponse<TrendAnalysis>> {
  try {
    const db = await getDatabase();

    // Default to last 6 months if no dates provided
    const end = endDate || new Date().toISOString().split('T')[0];
    const start = startDate || new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    // Get popular locations
    const locationStats = await analyzeLocationStats();
    const popularLocations = locationStats.success ? locationStats.data.slice(0, 5) : [];

    // Analyze event types/categories
    const [events] = await db.execute(
      'SELECT Name, Date FROM Events WHERE Date BETWEEN ? AND ? ORDER BY Date ASC',
      [start, end]
    );

    const trends = detectTrendCategories(events as any[]);

    const trendAnalysis: TrendAnalysis = {
      period: { start, end },
      popularLocations,
      emergingTrends: trends as any[],
      culturalInsights: [],
      recommendations: []
    };

    return {
      success: true,
      data: trendAnalysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: (events as any[]).length,
        confidence: 0.70
      }
    };
  } catch (error) {
    console.error('Trend analysis error:', error);
    return {
      success: false,
      data: {
        period: { start: '', end: '' },
        popularLocations: [],
        emergingTrends: [],
        culturalInsights: [],
        recommendations: []
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== PARTICIPATION METRICS ====================

/**
 * Calculates overall participation metrics
 */
export async function calculateParticipationMetrics(): Promise<AnalyticsResponse<{
  totalVolunteers: number;
  totalAttendees: number;
  totalEvents: number;
  averageVolunteersPerEvent: number;
  averageAttendeesPerEvent: number;
  engagementRate: number;
}>> {
  try {
    const db = await getDatabase();

    const totalVolunteers = await qb.count(db, 'Volunteers');
    const totalAttendees = await qb.count(db, 'Attendee');
    const totalEvents = await qb.count(db, 'Events');

    const volunteerAssignments = await qb.count(db, 'VolEventsResolver');
    const attendeeAssignments = await qb.count(db, 'AttendeeEventsResolver');

    const avgVolunteersPerEvent = calculateAverage(volunteerAssignments, totalEvents);
    const avgAttendeesPerEvent = calculateAverage(attendeeAssignments, totalEvents);

    const totalUsers = totalVolunteers + totalAttendees;
    const totalParticipations = volunteerAssignments + attendeeAssignments;
    const engagementRate = calculateEngagementRate(totalParticipations, totalUsers);

    return {
      success: true,
      data: {
        totalVolunteers,
        totalAttendees,
        totalEvents,
        averageVolunteersPerEvent: avgVolunteersPerEvent,
        averageAttendeesPerEvent: avgAttendeesPerEvent,
        engagementRate
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: totalEvents,
        confidence: 0.95
      }
    };
  } catch (error) {
    console.error('Participation metrics error:', error);
    return {
      success: false,
      data: {
        totalVolunteers: 0,
        totalAttendees: 0,
        totalEvents: 0,
        averageVolunteersPerEvent: 0,
        averageAttendeesPerEvent: 0,
        engagementRate: 0
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
