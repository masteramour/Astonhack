/**
 * Analytics Module - Main Entry Point
 * 
 * Exports all analytics functionality for easy importing
 * Usage: import { analyticsAPI, getUserRecommendations } from './analytics';
 */

// Main API (recommended for most use cases)
export { default as analyticsAPI } from './api';
export { default } from './api';

// Core Services (for advanced usage)
export * from './analyticsService';
export * from './predictiveModel';
export * from './culturalMatcher';
export * from './recommendationEngine';

// Types
export * from './types';

// Re-export commonly used functions
export {
  analyzeLocationStats,
  identifyLocationGaps,
  analyzeTrends,
  buildCulturalProfile,
  calculateParticipationMetrics
} from './analyticsService';

export {
  predictLocationDemand,
  predictEventParticipation,
  predictEmergingTrends,
  generatePredictiveReport
} from './predictiveModel';

export {
  findCulturalMatches,
  getAIEnhancedMatching,
  analyzeCommunityDiversity
} from './culturalMatcher';

export {
  getUserRecommendations,
  getEventRecommendations,
  createSmartPairings,
  getRecommendations,
  DEFAULT_CONFIG
} from './recommendationEngine';
