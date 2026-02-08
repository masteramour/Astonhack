/**
 * Points Data Service
 * Handles reading and writing user points data to JSON file
 * Integrates with analytics for better recommendations
 */

interface PointsActivity {
  type: 'event' | 'donation' | 'community_request' | 'streak_bonus';
  points: number;
  timestamp: string;
  description: string;
  metadata?: {
    eventId?: string;
    requestId?: string;
    donationAmount?: number;
    streakDays?: number;
  };
}

interface InterestedRequest {
  requestId: string;
  timestamp: string;
  pointsEarned: number;
}

export interface UserPointsData {
  userId: string;
  name: string;
  totalPoints: number;
  currentStreak: number;
  bestStreak: number;
  level: number;
  lastActivityDate: string | null;
  interests: string[];
  interestedRequests: InterestedRequest[];
  activities: PointsActivity[];
  categoryPreferences: {
    help: number;
    food: number;
    items: number;
    skills: number;
    other: number;
  };
  locationPreferences: string[];
  urgencyResponse: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface PointsDataStore {
  users: Record<string, UserPointsData>;
  analytics: {
    totalPointsAwarded: number;
    totalInterests: number;
    mostPopularCategory: string;
    averagePointsPerInterest: number;
    categoryDistribution: Record<string, number>;
    urgencyDistribution: Record<string, number>;
    lastUpdated: string;
  };
}

// API base URL
const API_BASE = 'http://localhost:3001/api';

/**
 * Fetches all points data from the server
 */
export async function fetchPointsData(): Promise<PointsDataStore> {
  try {
    const response = await fetch(`${API_BASE}/points`);
    if (!response.ok) {
      throw new Error('Failed to fetch points data');
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching points data:', error);
    // Return default structure if fetch fails
    return getDefaultPointsData();
  }
}

/**
 * Saves points data to the server
 */
export async function savePointsData(data: PointsDataStore): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/points`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.ok;
  } catch (error) {
    console.error('Error saving points data:', error);
    return false;
  }
}

/**
 * Gets user points data by userId
 */
export async function getUserPoints(userId: string): Promise<UserPointsData | null> {
  try {
    const response = await fetch(`${API_BASE}/points/${userId}`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching user points:', error);
    return null;
  }
}

/**
 * Records a user's interest in a community request
 */
export async function recordInterest(
  userId: string,
  requestId: string,
  requestTitle: string,
  pointsEarned: number,
  category: string,
  urgency: string,
  location: string
): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/points/interest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        requestId,
        requestTitle,
        pointsEarned,
        category,
        urgency,
        location,
      }),
    });
    return response.ok;
  } catch (error) {
    console.error('Error recording interest:', error);
    return false;
  }
}

/**
 * Gets recommendations based on user's interest history
 */
export async function getRecommendations(userId: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_BASE}/points/recommendations/${userId}`);
    if (!response.ok) {
      return [];
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching recommendations:', error);
    return [];
  }
}

/**
 * Gets analytics summary
 */
export async function getAnalyticsSummary(): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/points/analytics`);
    if (!response.ok) {
      return null;
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return null;
  }
}

/**
 * Default points data structure
 */
function getDefaultPointsData(): PointsDataStore {
  return {
    users: {
      'current-user': {
        userId: 'current-user',
        name: 'Current User',
        totalPoints: 0,
        currentStreak: 0,
        bestStreak: 0,
        level: 0,
        lastActivityDate: null,
        interests: [],
        interestedRequests: [],
        activities: [],
        categoryPreferences: {
          help: 0,
          food: 0,
          items: 0,
          skills: 0,
          other: 0,
        },
        locationPreferences: [],
        urgencyResponse: {
          high: 0,
          medium: 0,
          low: 0,
        },
      },
    },
    analytics: {
      totalPointsAwarded: 0,
      totalInterests: 0,
      mostPopularCategory: 'help',
      averagePointsPerInterest: 0,
      categoryDistribution: {
        help: 0,
        food: 0,
        items: 0,
        skills: 0,
        other: 0,
      },
      urgencyDistribution: {
        high: 0,
        medium: 0,
        low: 0,
      },
      lastUpdated: new Date().toISOString(),
    },
  };
}

/**
 * Calculate level based on total points
 */
export function calculateLevel(totalPoints: number): number {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= thresholds[i]) {
      return i;
    }
  }
  return 0;
}

/**
 * Get level badge and title
 */
export function getLevelInfo(level: number): { badge: string; title: string; nextThreshold: number } {
  const titles = [
    'Seed',
    'Sprout',
    'Bloom',
    'Growth',
    'Flourish',
    'Harvest',
    'Champion',
    'Legend',
  ];
  const badges = ['🌱', '🌿', '🌸', '🌳', '🌺', '🌾', '🏆', '👑'];
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];

  return {
    badge: badges[level] || '👑',
    title: titles[level] || 'Legend',
    nextThreshold: thresholds[level + 1] || thresholds[thresholds.length - 1],
  };
}
