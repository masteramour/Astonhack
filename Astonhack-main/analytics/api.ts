/**
 * api.ts
 * 
 * This file provides API-like functions to bridge the frontend and backend.
 * It includes methods for fetching and updating analytics data.
 */

import {
  analyzeLocationStats,
  identifyLocationGaps,
  analyzeTrends,
  buildCulturalProfile,
  calculateParticipationMetrics
} from './analyticsService';

import {
  predictLocationDemand,
  predictEventParticipation,
  predictEmergingTrends,
  generatePredictiveReport
} from './predictiveModel';

import {
  findCulturalMatches,
  getAIEnhancedMatching,
  analyzeCommunityDiversity
} from './culturalMatcher';

import {
  getUserRecommendations,
  getEventRecommendations,
  createSmartPairings,
  getRecommendations
} from './recommendationEngine';

import type {
  LocationStats,
  LocationPrediction,
  CulturalProfile,
  CulturalSimilarity,
  UserRecommendation,
  EventRecommendation,
  TrendAnalysis,
  AnalyticsResponse,
  RecommendationConfig
} from './types';

// ==================== ANALYTICS APIs ====================

/**
 * Fetches location statistics and performance metrics
 */
export async function fetchLocationStats(): Promise<AnalyticsResponse<LocationStats[]>> {
  return await analyzeLocationStats();
}

/**
 * Identifies underserved and oversaturated locations
 */
export async function fetchLocationGaps(): Promise<AnalyticsResponse<{
  underservedAreas: string[];
  oversaturatedAreas: string[];
  balancedAreas: string[];
}>> {
  return await identifyLocationGaps();
}

/**
 * Analyzes trends over a time period
 */
export async function fetchTrends(
  startDate?: string,
  endDate?: string
): Promise<AnalyticsResponse<TrendAnalysis>> {
  return await analyzeTrends(startDate, endDate);
}

/**
 * Gets overall participation metrics
 */
export async function fetchParticipationMetrics(): Promise<AnalyticsResponse<any>> {
  return await calculateParticipationMetrics();
}

/**
 * Builds cultural profile for a user
 */
export async function fetchCulturalProfile(
  userId: number,
  userType: 'volunteer' | 'attendee'
): Promise<CulturalProfile | null> {
  return await buildCulturalProfile(userId, userType);
}

/**
 * Analyzes community diversity
 */
export async function fetchCommunityDiversity(): Promise<AnalyticsResponse<any>> {
  return await analyzeCommunityDiversity();
}

// ==================== PREDICTIVE APIs ====================

/**
 * Predicts optimal event distribution across locations
 */
export async function fetchLocationPredictions(): Promise<AnalyticsResponse<LocationPrediction[]>> {
  try {
    return await predictLocationDemand();
  } catch (error) {
    console.error('Location prediction API error:', error);
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
 * Predicts participant numbers for a specific event
 */
export async function fetchEventParticipationPrediction(
  location: string,
  eventCategory: string,
  date: string
): Promise<AnalyticsResponse<any>> {
  try {
    return await predictEventParticipation(location, eventCategory, date);
  } catch (error) {
    console.error('Participation prediction API error:', error);
    return {
      success: false,
      data: null,
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
 * Predicts emerging trends and opportunities
 */
export async function fetchEmergingTrends(): Promise<AnalyticsResponse<any>> {
  try {
    return await predictEmergingTrends();
  } catch (error) {
    console.error('Trend prediction API error:', error);
    return {
      success: false,
      data: null,
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
 * Generates comprehensive predictive report
 */
export async function fetchPredictiveReport(): Promise<AnalyticsResponse<any>> {
  try {
    return await generatePredictiveReport();
  } catch (error) {
    console.error('Report generation API error:', error);
    return {
      success: false,
      data: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== MATCHING APIs ====================

/**
 * Finds culturally similar users
 */
export async function fetchCulturalMatches(
  userId: number,
  userType: 'volunteer' | 'attendee',
  maxResults: number = 10,
  prioritizeCrossCultural: boolean = true
): Promise<AnalyticsResponse<CulturalSimilarity[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(findCulturalMatches(userId, userType, maxResults, prioritizeCrossCultural));
    }, 0);
  });
}

/**
 * Gets AI-enhanced matching insights
 */
export async function fetchAIMatchingInsights(
  profile1: CulturalProfile,
  profile2: CulturalProfile
): Promise<AnalyticsResponse<any>> {
  try {
    return await getAIEnhancedMatching(profile1, profile2);
  } catch (error) {
    console.error('AI matching API error:', error);
    return {
      success: false,
      data: null,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== RECOMMENDATION APIs ====================

/**
 * Gets user connection recommendations
 */
export async function fetchUserRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  config?: Partial<RecommendationConfig>
): Promise<AnalyticsResponse<UserRecommendation[]>> {
  try {
    return await getUserRecommendations(userId, userType, config);
  } catch (error) {
    console.error('User recommendation API error:', error);
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
 * Gets event recommendations for a user
 */
export async function fetchEventRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  config?: Partial<RecommendationConfig>
): Promise<AnalyticsResponse<EventRecommendation[]>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(getEventRecommendations(userId, userType, config));
    }, 0);
  });
}

/**
 * Gets all recommendations (users and events)
 */
export async function fetchAllRecommendations(
  userId: number,
  userType: 'volunteer' | 'attendee',
  config?: Partial<RecommendationConfig>
): Promise<{
  users: AnalyticsResponse<UserRecommendation[]>;
  events: AnalyticsResponse<EventRecommendation[]>;
}> {
  try {
    const results = await getRecommendations(userId, userType, 'both', config);
    return {
      users: results.users!,
      events: results.events!
    };
  } catch (error) {
    console.error('All recommendations API error:', error);
    return {
      users: {
        success: false,
        data: [],
        metadata: { generatedAt: new Date().toISOString(), dataPoints: 0, confidence: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      events: {
        success: false,
        data: [],
        metadata: { generatedAt: new Date().toISOString(), dataPoints: 0, confidence: 0 },
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

/**
 * Creates smart pairings for an event
 */
export async function fetchSmartPairings(eventId: number): Promise<AnalyticsResponse<any>> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(createSmartPairings(eventId));
    }, 0);
  });
}

// ==================== DASHBOARD APIs ====================

/**
 * Gets comprehensive dashboard data
 * Combines multiple analytics for a complete overview
 */
export async function fetchDashboardData(): Promise<{
  metrics: AnalyticsResponse<any>;
  locationStats: AnalyticsResponse<LocationStats[]>;
  trends: AnalyticsResponse<TrendAnalysis>;
  diversity: AnalyticsResponse<any>;
}> {
  try {
    const [metrics, locationStats, trends, diversity] = await Promise.all([
      fetchParticipationMetrics(),
      fetchLocationStats(),
      fetchTrends(),
      fetchCommunityDiversity()
    ]);
    
    return {
      metrics,
      locationStats,
      trends,
      diversity
    };
  } catch (error) {
    console.error('Dashboard data API error:', error);
    throw error;
  }
}

/**
 * Gets insights dashboard for organizers
 */
export async function fetchOrganizerInsights(): Promise<{
  locationPredictions: AnalyticsResponse<LocationPrediction[]>;
  emergingTrends: AnalyticsResponse<any>;
  locationGaps: AnalyticsResponse<any>;
}> {
  try {
    const [locationPredictions, emergingTrends, locationGaps] = await Promise.all([
      fetchLocationPredictions(),
      fetchEmergingTrends(),
      fetchLocationGaps()
    ]);
    
    return {
      locationPredictions,
      emergingTrends,
      locationGaps
    };
  } catch (error) {
    console.error('Organizer insights API error:', error);
    throw error;
  }
}

// ==================== UTILITY APIs ====================

/**
 * Health check for analytics system
 */
export async function checkAnalyticsHealth(): Promise<{
  status: 'healthy' | 'degraded' | 'unavailable';
  services: {
    database: boolean;
    analytics: boolean;
    ai: boolean;
    recommendations: boolean;
  };
  message: string;
}> {
  try {
    const dbCheck = await analyzeLocationStats();
    const aiCheck = await fetchEmergingTrends();
    
    const services = {
      database: dbCheck.success,
      analytics: dbCheck.success,
      ai: aiCheck.success,
      recommendations: true
    };
    
    const allHealthy = Object.values(services).every(s => s);
    const someHealthy = Object.values(services).some(s => s);
    
    return {
      status: allHealthy ? 'healthy' : (someHealthy ? 'degraded' : 'unavailable'),
      services,
      message: allHealthy 
        ? 'All systems operational' 
        : (someHealthy ? 'Some services unavailable' : 'System unavailable')
    };
  } catch (error) {
    return {
      status: 'unavailable',
      services: {
        database: false,
        analytics: false,
        ai: false,
        recommendations: false
      },
      message: 'Health check failed'
    };
  }
}

// ==================== EXPORT ALL ====================

export default {
  // Analytics
  fetchLocationStats,
  fetchLocationGaps,
  fetchTrends,
  fetchParticipationMetrics,
  fetchCulturalProfile,
  fetchCommunityDiversity,
  
  // Predictions
  fetchLocationPredictions,
  fetchEventParticipationPrediction,
  fetchEmergingTrends,
  fetchPredictiveReport,
  
  // Matching
  fetchCulturalMatches,
  fetchAIMatchingInsights,
  
  // Recommendations
  fetchUserRecommendations,
  fetchEventRecommendations,
  fetchAllRecommendations,
  fetchSmartPairings,
  
  // Dashboards
  fetchDashboardData,
  fetchOrganizerInsights,
  
  // Utilities
  checkAnalyticsHealth
};
