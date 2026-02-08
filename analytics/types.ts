/**
 * Analytics and Recommendation System Types
 * 
 * This module defines TypeScript interfaces for the recommendation system
 * including predictive analytics, cross-cultural matching, and user recommendations
 */

// ==================== LOCATION ANALYTICS ====================

export interface LocationStats {
  location: string;
  totalEvents: number;
  totalParticipants: number;
  averageParticipantsPerEvent: number;
  volunteerDemand: number;
  successRate: number; // percentage of events that met volunteer goals
}

export interface LocationPrediction {
  location: string;
  predictedEventDemand: number;
  recommendedEventsPerMonth: number;
  confidence: number; // 0-1 scale
  reasoning: string;
  suggestedCategories: string[];
  bestTimeSlots: string[];
}

// ==================== CULTURAL ANALYSIS ====================

export interface CulturalProfile {
  userId: string;
  languages: string[];
  culturalBackground: string[];
  interests: string[];
  eventPreferences: string[];
  locationPreferences: string[];
  participationHistory: ParticipationRecord[];
}

export interface ParticipationRecord {
  eventId: number;
  eventName: string;
  date: string;
  role: 'volunteer' | 'attendee' | 'organizer';
  hoursContributed?: number;
  satisfaction?: number; // 1-5 scale
}

export interface CulturalSimilarity {
  userId1: string;
  userId2: string;
  similarityScore: number; // 0-1 scale
  sharedLanguages: string[];
  sharedInterests: string[];
  culturalBridgePotential: number; // How well they can bridge cultural gaps
  recommendationReason: string;
}

// ==================== USER MATCHING ====================

export interface UserRecommendation {
  recommendedUserId: string;
  recommendedUserName: string;
  matchScore: number; // 0-100
  matchReasons: MatchReason[];
  sharedInterests: string[];
  culturalConnection: string;
  suggestedActivities: string[];
}

export interface MatchReason {
  type: 'language' | 'interest' | 'location' | 'history' | 'cultural';
  description: string;
  weight: number; // importance of this factor (0-1)
}

// ==================== EVENT RECOMMENDATIONS ====================

export interface EventRecommendation {
  eventId: number;
  eventName: string;
  matchScore: number; // 0-100
  distance?: number; // in km/miles
  relevanceReasons: string[];
  compatibleUsers: string[]; // Other users who might be interested
  predictedSatisfaction: number; // 1-5 scale
}

// ==================== TREND ANALYSIS ====================

export interface TrendAnalysis {
  period: {
    start: string;
    end: string;
  };
  popularLocations: LocationStats[];
  emergingTrends: Trend[];
  culturalInsights: CulturalInsight[];
  recommendations: SystemRecommendation[];
}

export interface Trend {
  name: string;
  category: string;
  growthRate: number; // percentage
  popularity: number; // 0-100
  affectedDemographics: string[];
  predictedTrajectory: 'rising' | 'stable' | 'declining';
}

export interface CulturalInsight {
  insight: string;
  affectedCommunities: string[];
  opportunity: string;
  actionItems: string[];
}

export interface SystemRecommendation {
  type: 'event' | 'location' | 'partnership' | 'outreach';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  expectedImpact: string;
}

// ==================== ANALYTICS REQUEST/RESPONSE ====================

export interface AnalyticsQuery {
  type: 'location' | 'cultural' | 'user' | 'event' | 'trends';
  userId?: string;
  location?: string;
  timeframe?: {
    start: string;
    end: string;
  };
  filters?: Record<string, any>;
}

export interface AnalyticsResponse<T = any> {
  success: boolean;
  data: T;
  metadata: {
    generatedAt: string;
    dataPoints: number;
    confidence: number;
  };
  error?: string;
}

// ==================== RECOMMENDATION ENGINE CONFIG ====================

export interface RecommendationConfig {
  weights: {
    language: number;
    interest: number;
    location: number;
    history: number;
    cultural: number;
  };
  minimumMatchScore: number;
  maxRecommendations: number;
  diversityBonus: boolean; // Boost cross-cultural matches
  locationRadius: number; // in km
}

// ==================== ML/AI INTEGRATION ====================

export interface AIAnalysisRequest {
  prompt: string;
  context: Record<string, any>;
  analysisType: 'prediction' | 'matching' | 'insights' | 'trends';
}

export interface AIAnalysisResponse {
  analysis: string;
  structuredData?: Record<string, any>;
  confidence: number;
  suggestions: string[];
}
