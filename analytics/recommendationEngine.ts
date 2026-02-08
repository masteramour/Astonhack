/**
 * recommendationEngine.ts
 * 
 * This file contains the recommendation engine logic.
 * It generates personalized event and task recommendations for volunteers.
 */

import { getDatabase } from '../services/database';
import { buildCulturalProfile } from './analyticsService';
import { findCulturalMatches, getAIEnhancedMatching } from './culturalMatcher';
import type {
  UserRecommendation,
  EventRecommendation,
  RecommendationConfig,
  AnalyticsResponse,
  MatchReason
} from './types';

// Default configuration
const DEFAULT_CONFIG: RecommendationConfig = {
  weights: {
    language: 0.25,
    interest: 0.30,
    location: 0.20,
    history: 0.15,
    cultural: 0.10
  },
  minimumMatchScore: 40,
  maxRecommendations: 10,
  diversityBonus: true,
  locationRadius: 25 // km
};

// ==================== USER RECOMMENDATIONS ====================

/**
 * Gets personalized user recommendations for connection
 * Prioritizes cross-cultural matches with shared interests
 */
export async function getUserRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  config: Partial<RecommendationConfig> = {}
): Promise<AnalyticsResponse<UserRecommendation[]>> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const db = await getDatabase();
    
    // Get user profile
    const userProfile = await buildCulturalProfile(userId, userType);
    if (!userProfile) {
      return {
        success: false,
        data: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: 0,
          confidence: 0
        },
        error: 'User profile not found'
      };
    }
    
    // Find cultural matches
    const culturalMatches = await findCulturalMatches(
      userId,
      userType,
      finalConfig.maxRecommendations * 2, // Get more candidates
      finalConfig.diversityBonus
    );
    
    if (!culturalMatches.success || culturalMatches.data.length === 0) {
      return {
        success: true,
        data: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: 0,
          confidence: 0.50
        }
      };
    }
    
    // Convert to user recommendations
    const recommendations: UserRecommendation[] = [];
    
    for (const match of culturalMatches.data) {
      // Get the other user's details
      const otherUserId = parseInt(match.userId2);
      const otherUserType = match.userId2.startsWith('v') ? 'volunteer' : 'attendee';
      
      // Try to get user info from database
      let userName = 'User';
      try {
        const userQuery = otherUserType === 'volunteer'
          ? 'SELECT First_Name, Last_Name FROM Volunteers WHERE Volunteer_ID = ?'
          : 'SELECT First_Name, Last_Name FROM Attendee WHERE Attendee_ID = ?';
        
        const [userInfo] = await db.execute(userQuery, [otherUserId]) as any;
        if (userInfo && userInfo.length > 0) {
          const user = userInfo[0];
          userName = `${user.First_Name} ${user.Last_Name}`;
        }
      } catch (e) {
        console.warn('Could not fetch user name:', e);
      }
      
      // Calculate match score (0-100)
      const baseScore = match.similarityScore * 100;
      const culturalBonus = finalConfig.diversityBonus ? match.culturalBridgePotential * 20 : 0;
      const matchScore = Math.min(100, Math.round(baseScore + culturalBonus));
      
      // Skip if below minimum threshold
      if (matchScore < finalConfig.minimumMatchScore) {
        continue;
      }
      
      // Build match reasons
      const matchReasons: MatchReason[] = [];
      
      if (match.sharedLanguages.length > 0) {
        matchReasons.push({
          type: 'language',
          description: `Both speak ${match.sharedLanguages.join(', ')}`,
          weight: finalConfig.weights.language
        });
      }
      
      if (match.sharedInterests.length > 0) {
        matchReasons.push({
          type: 'interest',
          description: `Share interests in ${match.sharedInterests.slice(0, 3).join(', ')}`,
          weight: finalConfig.weights.interest
        });
      }
      
      if (match.culturalBridgePotential > 0.5) {
        matchReasons.push({
          type: 'cultural',
          description: 'Strong potential for cross-cultural connection',
          weight: finalConfig.weights.cultural
        });
      }
      
      // Suggest activities based on shared interests
      const suggestedActivities = match.sharedInterests.length > 0
        ? match.sharedInterests.map(interest => `${interest} events or projects`)
        : ['General community volunteering', 'Cultural exchange events'];
      
      recommendations.push({
        recommendedUserId: match.userId2,
        recommendedUserName: userName,
        matchScore,
        matchReasons,
        sharedInterests: match.sharedInterests,
        culturalConnection: match.recommendationReason,
        suggestedActivities: suggestedActivities.slice(0, 3)
      });
    }
    
    // Sort by match score and limit results
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const finalRecommendations = recommendations.slice(0, finalConfig.maxRecommendations);
    
    return {
      success: true,
      data: finalRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: recommendations.length,
        confidence: finalRecommendations.length > 0 ? 0.80 : 0.50
      }
    };
  } catch (error) {
    console.error('User recommendation error:', error);
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

// ==================== EVENT RECOMMENDATIONS ====================

/**
 * Gets personalized event recommendations for a user
 * Based on interests, location, and past participation
 */
export async function getEventRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  config: Partial<RecommendationConfig> = {}
): Promise<AnalyticsResponse<EventRecommendation[]>> {
  try {
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    const db = await getDatabase();
    
    // Get user profile
    const userProfile = await buildCulturalProfile(userId, userType);
    if (!userProfile) {
      return {
        success: false,
        data: [],
        metadata: {
          generatedAt: new Date().toISOString(),
          dataPoints: 0,
          confidence: 0
        },
        error: 'User profile not found'
      };
    }
    
    // Get upcoming events (future events only)
    const today = new Date().toISOString().split('T')[0];
    const [events] = await db.execute(`
      SELECT Events_ID, Name, Date, Location, NumOfVolunteersneeded
      FROM Events
      WHERE Date >= ?
      ORDER BY Date ASC
      LIMIT 50
    `, [today]) as any;
    
    const recommendations: EventRecommendation[] = [];
    
    for (const event of events) {
      let matchScore = 0;
      const relevanceReasons: string[] = [];
      
      // Interest matching
      const eventNameLower = event.Name.toLowerCase();
      const matchingInterests = userProfile.interests.filter(interest =>
        eventNameLower.includes(interest.toLowerCase())
      );
      
      if (matchingInterests.length > 0) {
        matchScore += 40 * finalConfig.weights.interest / 0.3;
        relevanceReasons.push(`Matches your interests in ${matchingInterests.join(', ')}`);
      }
      
      // Location matching
      if (event.Location && userProfile.locationPreferences.includes(event.Location)) {
        matchScore += 30 * finalConfig.weights.location / 0.2;
        relevanceReasons.push(`In your preferred area: ${event.Location}`);
      }
      
      // Historical pattern matching
      const similarPastEvents = userProfile.participationHistory.filter(h =>
        h.eventName.toLowerCase().includes(matchingInterests[0]?.toLowerCase() || '')
      );
      
      if (similarPastEvents.length > 0) {
        matchScore += 20 * finalConfig.weights.history / 0.15;
        relevanceReasons.push('Similar to events you enjoyed before');
      }
      
      // New experience bonus (try something different)
      if (matchingInterests.length === 0 && userProfile.interests.length < 3) {
        matchScore += 10;
        relevanceReasons.push('Opportunity to explore new interests');
      }
      
      // Skip if below minimum threshold
      if (matchScore < finalConfig.minimumMatchScore) {
        continue;
      }
      
      // Get compatible users (others who might be interested)
      const compatibleUsers = await findCompatibleUsersForEvent(event, db);
      
      // Predicted satisfaction (placeholder - could use ML model)
      const predictedSatisfaction = Math.min(5, Math.round((matchScore / 20) * 10) / 10);
      
      recommendations.push({
        eventId: event.Events_ID,
        eventName: event.Name,
        matchScore: Math.round(matchScore),
        relevanceReasons,
        compatibleUsers,
        predictedSatisfaction
      });
    }
    
    // Sort by match score and limit results
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    const finalRecommendations = recommendations.slice(0, finalConfig.maxRecommendations);
    
    return {
      success: true,
      data: finalRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: recommendations.length,
        confidence: finalRecommendations.length > 0 ? 0.75 : 0.50
      }
    };
  } catch (error) {
    console.error('Event recommendation error:', error);
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
 * Helper: Finds users with similar interests who might attend an event
 */
async function findCompatibleUsersForEvent(event: any, db: any): Promise<string[]> {
  try {
    // Simple implementation: find users who attended similar events
    const eventNameKeywords = extractKeywords(event.Name);
    const compatibleUsers: Set<string> = new Set();
    
    // Get volunteers who attended events with similar keywords
    const [volunteers] = await db.execute(`
      SELECT DISTINCT v.Volunteer_ID, v.First_Name
      FROM Volunteers v
      INNER JOIN VolEventsResolver ver ON v.Volunteer_ID = ver.Volunteer_ID
      INNER JOIN Events e ON ver.Events_ID = e.Events_ID
      WHERE e.Name LIKE ?
      LIMIT 5
    `, [`%${eventNameKeywords[0] || ''}%`]) as any;
    
    volunteers.forEach((v: any) => {
      compatibleUsers.add(`${v.First_Name} (Volunteer)`);
    });
    
    return Array.from(compatibleUsers);
  } catch (e) {
    return [];
  }
}

/**
 * Helper: Extracts keywords from event name
 */
function extractKeywords(eventName: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];
  return eventName
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
}

// ==================== SMART PAIRING ====================

/**
 * Creates smart pairings for an event
 * Pairs volunteers/attendees to maximize cross-cultural connections
 */
export async function createSmartPairings(
  eventId: number
): Promise<AnalyticsResponse<{
  pairs: Array<{
    user1: { id: number; name: string; type: 'volunteer' | 'attendee' };
    user2: { id: number; name: string; type: 'volunteer' | 'attendee' };
    matchScore: number;
    reason: string;
  }>;
}>> {
  try {
    const db = await getDatabase();
    
    // Get all participants for this event
    const [volunteers] = await db.execute(`
      SELECT v.Volunteer_ID, v.First_Name, v.Last_Name
      FROM Volunteers v
      INNER JOIN VolEventsResolver ver ON v.Volunteer_ID = ver.Volunteer_ID
      WHERE ver.Events_ID = ?
    `, [eventId]) as any;
    
    const [attendees] = await db.execute(`
      SELECT a.Attendee_ID, a.First_Name, a.Last_Name
      FROM Attendee a
      INNER JOIN AttendeeEventsResolver aer ON a.Attendee_ID = aer.Attendee_ID
      WHERE aer.Events_ID = ?
    `, [eventId]) as any;
    
    const pairs: any[] = [];
    
    // Create cross-type pairings (volunteer with attendee)
    for (const volunteer of volunteers) {
      for (const attendee of attendees) {
        const volProfile = await buildCulturalProfile(volunteer.Volunteer_ID, 'volunteer');
        const attProfile = await buildCulturalProfile(attendee.Attendee_ID, 'attendee');
        
        if (volProfile && attProfile) {
          const { calculateCulturalSimilarity } = require('./culturalMatcher');
          const similarity = calculateCulturalSimilarity(volProfile, attProfile);
          
          pairs.push({
            user1: {
              id: volunteer.Volunteer_ID,
              name: `${volunteer.First_Name} ${volunteer.Last_Name}`,
              type: 'volunteer' as const
            },
            user2: {
              id: attendee.Attendee_ID,
              name: `${attendee.First_Name} ${attendee.Last_Name}`,
              type: 'attendee' as const
            },
            matchScore: Math.round(similarity.similarityScore * 100),
            reason: similarity.recommendationReason
          });
        }
      }
    }
    
    // Sort by match score
    pairs.sort((a, b) => b.matchScore - a.matchScore);
    
    return {
      success: true,
      data: { pairs: pairs.slice(0, 20) },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: pairs.length,
        confidence: 0.70
      }
    };
  } catch (error) {
    console.error('Smart pairing error:', error);
    return {
      success: false,
      data: { pairs: [] },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== EXPORT ALL ====================

export {
  DEFAULT_CONFIG,
  type RecommendationConfig
};

/**
 * Main recommendation function - convenience wrapper
 */
export async function getRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  type: 'users' | 'events' | 'both' = 'both',
  config?: Partial<RecommendationConfig>
): Promise<{
  users?: AnalyticsResponse<UserRecommendation[]>;
  events?: AnalyticsResponse<EventRecommendation[]>;
}> {
  const results: any = {};
  
  if (type === 'users' || type === 'both') {
    results.users = await getUserRecommendations(userId, userType, config);
  }
  
  if (type === 'events' || type === 'both') {
    results.events = await getEventRecommendations(userId, userType, config);
  }
  
  return results;
}
