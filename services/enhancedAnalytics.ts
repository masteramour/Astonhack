/**
 * Enhanced Analytics Service with Points Integration
 * Uses user points data and interests to provide better recommendations
 */

import { getUserPoints, getRecommendations, getAnalyticsSummary } from './pointsDataService';

export interface UserPreferenceProfile {
  userId: string;
  preferredCategories: string[];
  preferredLocations: string[];
  urgencyPreference: 'high' | 'medium' | 'low';
  engagementLevel: 'high' | 'medium' | 'low';
  totalPoints: number;
  level: number;
  currentStreak: number;
  averagePointsPerActivity: number;
}

/**
 * Build a comprehensive user profile from points data
 */
export async function buildUserPreferenceProfile(userId: string): Promise<UserPreferenceProfile | null> {
  try {
    const userData = await getUserPoints(userId);
    if (!userData) {
      return null;
    }

    // Get top 3 categories by engagement
    const preferredCategories = Object.entries(userData.categoryPreferences)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 3)
      .map(([category]) => category);

    // Get recent locations (last 5)
    const preferredLocations = userData.locationPreferences.slice(-5);

    // Determine urgency preference
    const urgencyPreference = (Object.entries(userData.urgencyResponse)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([urgency]) => urgency)[0] || 'medium') as 'high' | 'medium' | 'low';

    // Calculate engagement level based on streak
    let engagementLevel: 'high' | 'medium' | 'low' = 'low';
    if (userData.currentStreak >= 7) {
      engagementLevel = 'high';
    } else if (userData.currentStreak >= 3) {
      engagementLevel = 'medium';
    }

    // Calculate average points per activity
    const averagePointsPerActivity =
      userData.interestedRequests.length > 0
        ? userData.totalPoints / userData.interestedRequests.length
        : 0;

    return {
      userId: userData.userId,
      preferredCategories,
      preferredLocations,
      urgencyPreference,
      engagementLevel,
      totalPoints: userData.totalPoints,
      level: userData.level,
      currentStreak: userData.currentStreak,
      averagePointsPerActivity,
    };
  } catch (error) {
    console.error('Error building user preference profile:', error);
    return null;
  }
}

/**
 * Get personalized request recommendations based on user's history
 */
export async function getPersonalizedRequestRecommendations(
  userId: string,
  availableRequests: any[]
): Promise<any[]> {
  try {
    const profile = await buildUserPreferenceProfile(userId);
    if (!profile) {
      // No profile data, return requests sorted by points
      return availableRequests
        .sort((a, b) => b.pointsReward - a.pointsReward)
        .slice(0, 10);
    }

    // Score each request based on user preferences
    const scoredRequests = availableRequests.map((request) => {
      let score = 0;

      // Category match (highest weight - 40%)
      if (profile.preferredCategories.includes(request.category)) {
        const categoryIndex = profile.preferredCategories.indexOf(request.category);
        score += 40 - categoryIndex * 10; // First preference gets 40, second 30, third 20
      }

      // Location match (30%)
      if (profile.preferredLocations.some((loc) => request.location.includes(loc) || loc.includes(request.location))) {
        score += 30;
      }

      // Urgency match (20%)
      if (request.urgency === profile.urgencyPreference) {
        score += 20;
      }

      // Points reward match (10%)
      if (
        profile.averagePointsPerActivity > 0 &&
        Math.abs(request.pointsReward - profile.averagePointsPerActivity) <
          profile.averagePointsPerActivity * 0.3
      ) {
        score += 10;
      }

      // Engagement level boost
      if (profile.engagementLevel === 'high' && request.urgency === 'high') {
        score += 15; // Highly engaged users get high-urgency boost
      }

      return {
        ...request,
        recommendationScore: score,
        matchReasons: getMatchReasons(request, profile),
      };
    });

    // Sort by score and return top recommendations
    return scoredRequests
      .sort((a, b) => b.recommendationScore - a.recommendationScore)
      .slice(0, 10);
  } catch (error) {
    console.error('Error getting personalized recommendations:', error);
    return availableRequests.slice(0, 10);
  }
}

/**
 * Generate match reasons for UI display
 */
function getMatchReasons(request: any, profile: UserPreferenceProfile): string[] {
  const reasons: string[] = [];

  if (profile.preferredCategories.includes(request.category)) {
    reasons.push(`Matches your interest in ${request.category}`);
  }

  if (profile.preferredLocations.some((loc) => request.location.includes(loc) || loc.includes(request.location))) {
    reasons.push('In your preferred area');
  }

  if (request.urgency === profile.urgencyPreference) {
    reasons.push(`${request.urgency} urgency matches your preference`);
  }

  if (profile.currentStreak >= 7) {
    reasons.push(`🔥 Keep your ${profile.currentStreak}-day streak going!`);
  }

  if (request.pointsReward >= 150) {
    reasons.push(`⭐ High reward: ${request.pointsReward} points`);
  }

  return reasons;
}

/**
 * Get analytics insights for the user
 */
export async function getUserAnalyticsInsights(userId: string): Promise<any> {
  try {
    const [userData, recommendations, globalAnalytics] = await Promise.all([
      getUserPoints(userId),
      getRecommendations(userId),
      getAnalyticsSummary(),
    ]);

    if (!userData) {
      return null;
    }

    // Calculate user rank (percentile)
    const userRank = calculateUserRank(userData.totalPoints, globalAnalytics);

    // Identify growth opportunities
    const growthOpportunities = identifyGrowthOpportunities(userData, globalAnalytics);

    // Calculate engagement metrics
    const engagementMetrics = calculateEngagementMetrics(userData);

    return {
      userStats: {
        totalPoints: userData.totalPoints,
        level: userData.level,
        currentStreak: userData.currentStreak,
        bestStreak: userData.bestStreak,
        totalActivities: userData.activities.length,
      },
      ranking: userRank,
      recommendations,
      growthOpportunities,
      engagementMetrics,
      topCategories: Object.entries(userData.categoryPreferences)
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([category, count]) => ({ category, count })),
    };
  } catch (error) {
    console.error('Error getting user analytics insights:', error);
    return null;
  }
}

/**
 * Calculate user's rank percentile
 */
function calculateUserRank(userPoints: number, globalAnalytics: any): any {
  // This is a simplified version - in production, you'd compare against all users
  const averagePoints = globalAnalytics?.averagePointsPerInterest || 100;
  const percentile = Math.min(100, Math.round((userPoints / (averagePoints * 10)) * 100));

  let tier = 'Bronze';
  if (percentile >= 90) tier = 'Diamond';
  else if (percentile >= 75) tier = 'Platinum';
  else if (percentile >= 50) tier = 'Gold';
  else if (percentile >= 25) tier = 'Silver';

  return {
    percentile,
    tier,
    pointsUntilNextTier: calculatePointsToNextTier(userPoints),
  };
}

/**
 * Calculate points needed for next tier
 */
function calculatePointsToNextTier(currentPoints: number): number {
  const tiers = [100, 250, 500, 1000, 2000, 5000, 10000];
  for (const threshold of tiers) {
    if (currentPoints < threshold) {
      return threshold - currentPoints;
    }
  }
  return 0;
}

/**
 * Identify growth opportunities
 */
function identifyGrowthOpportunities(userData: any, globalAnalytics: any): string[] {
  const opportunities: string[] = [];

  // Check unexplored categories
  const unexploredCategories = Object.entries(userData.categoryPreferences)
    .filter(([, count]) => count === 0)
    .map(([category]) => category);

  if (unexploredCategories.length > 0) {
    opportunities.push(`Try ${unexploredCategories[0]} requests for new experiences`);
  }

  // Check streak potential
  if (userData.currentStreak === 0 || userData.currentStreak === 1) {
    opportunities.push('Start a streak by being active daily!');
  } else if (userData.currentStreak >= 6 && userData.currentStreak < 7) {
    opportunities.push('One more day to earn your 7-day streak bonus!');
  }

  // Check high-value opportunities
  if (globalAnalytics?.mostPopularCategory) {
    const mostPopular = globalAnalytics.mostPopularCategory;
    if (userData.categoryPreferences[mostPopular] === 0) {
      opportunities.push(`${mostPopular} is trending - check it out!`);
    }
  }

  return opportunities;
}

/**
 * Calculate engagement metrics
 */
function calculateEngagementMetrics(userData: any): any {
  const daysSinceJoining = userData.lastActivityDate
    ? Math.floor(
        (new Date().getTime() - new Date(userData.lastActivityDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const activitiesPerDay =
    daysSinceJoining > 0 ? userData.activities.length / daysSinceJoining : 0;

  return {
    activitiesPerDay: activitiesPerDay.toFixed(2),
    diversityScore: calculateDiversityScore(userData.categoryPreferences),
    consistencyScore: calculateConsistencyScore(userData.currentStreak, userData.bestStreak),
  };
}

/**
 * Calculate diversity score (how spread out user interests are)
 */
function calculateDiversityScore(categoryPreferences: Record<string, number>): number {
  const values = Object.values(categoryPreferences);
  const total = values.reduce((sum, val) => sum + val, 0);

  if (total === 0) return 0;

  // Calculate entropy (higher = more diverse)
  const probabilities = values.map((val) => val / total);
  const entropy = -probabilities.reduce(
    (sum, p) => (p > 0 ? sum + p * Math.log2(p) : sum),
    0
  );

  // Normalize to 0-100 scale
  const maxEntropy = Math.log2(values.length);
  return Math.round((entropy / maxEntropy) * 100);
}

/**
 * Calculate consistency score based on streaks
 */
function calculateConsistencyScore(currentStreak: number, bestStreak: number): number {
  if (bestStreak === 0) return 0;

  const streakRatio = currentStreak / bestStreak;
  return Math.round(streakRatio * 100);
}

export default {
  buildUserPreferenceProfile,
  getPersonalizedRequestRecommendations,
  getUserAnalyticsInsights,
};
