// Streak Points System
// Tracks points accumulated from various community activities

export interface PointsActivity {
  type: 'event' | 'donation' | 'community_request' | 'streak_bonus';
  points: number;
  timestamp: Date;
  description: string;
  metadata?: {
    eventId?: string;
    requestId?: string;
    donationAmount?: number;
    streakDays?: number;
  };
}

export interface UserStreakData {
  userId: string;
  totalPoints: number;
  currentStreak: number; // consecutive days active
  bestStreak: number;
  activities: PointsActivity[];
  lastActivityDate: Date | null;
  level: number; // badges/levels based on points
}

const POINTS_CONFIG = {
  EVENT_PARTICIPATION: 100,
  COMMUNITY_REQUEST_BASE: 50,
  COMMUNITY_REQUEST_MAX: 500,
  DONATION_PER_POUND: 1,
  STREAK_BONUS_7_DAYS: 50, // 1.5x multiplier
  STREAK_BONUS_30_DAYS: 100, // 2x multiplier
  LEVEL_THRESHOLDS: [0, 100, 250, 500, 1000, 2000, 5000, 10000],
};

export class StreakPointsSystem {
  private static storageKey = 'user_streak_data';

  /**
   * Initialize streak data for a new user
   */
  static initializeUser(userId: string): UserStreakData {
    return {
      userId,
      totalPoints: 0,
      currentStreak: 0,
      bestStreak: 0,
      activities: [],
      lastActivityDate: null,
      level: 0,
    };
  }

  /**
   * Add points from event participation
   */
  static addEventPoints(userId: string, eventId: string): number {
    const activity: PointsActivity = {
      type: 'event',
      points: POINTS_CONFIG.EVENT_PARTICIPATION,
      timestamp: new Date(),
      description: `Participated in event ${eventId}`,
      metadata: { eventId },
    };

    this.addActivity(userId, activity);
    return POINTS_CONFIG.EVENT_PARTICIPATION;
  }

  /**
   * Add points from community request
   */
  static addCommunityRequestPoints(
    userId: string,
    requestId: string,
    customPoints?: number
  ): number {
    const points = customPoints || POINTS_CONFIG.COMMUNITY_REQUEST_BASE;
    const activity: PointsActivity = {
      type: 'community_request',
      points,
      timestamp: new Date(),
      description: `Created community request ${requestId}`,
      metadata: { requestId },
    };

    this.addActivity(userId, activity);
    return points;
  }

  /**
   * Add points from donation
   */
  static addDonationPoints(userId: string, amountInPounds: number): number {
    const points = Math.floor(amountInPounds * POINTS_CONFIG.DONATION_PER_POUND);
    const activity: PointsActivity = {
      type: 'donation',
      points,
      timestamp: new Date(),
      description: `Donated £${amountInPounds}`,
      metadata: { donationAmount: amountInPounds },
    };

    this.addActivity(userId, activity);
    return points;
  }

  /**
   * Update streak and add bonus points if applicable
   */
  static updateStreak(userId: string): void {
    const data = this.getUserData(userId);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (!data.lastActivityDate) {
      data.currentStreak = 1;
      data.lastActivityDate = today;
      return;
    }

    const lastActivity = new Date(
      data.lastActivityDate.getFullYear(),
      data.lastActivityDate.getMonth(),
      data.lastActivityDate.getDate()
    );

    const daysDifference = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDifference === 0) {
      // Same day, no streak increment
      return;
    } else if (daysDifference === 1) {
      // Consecutive day, increment streak
      data.currentStreak++;

      // Award streak bonuses
      if (data.currentStreak === 7) {
        const bonusActivity: PointsActivity = {
          type: 'streak_bonus',
          points: POINTS_CONFIG.STREAK_BONUS_7_DAYS,
          timestamp: now,
          description: '7-day streak bonus! 🔥',
          metadata: { streakDays: 7 },
        };
        this.addActivity(userId, bonusActivity);
      } else if (data.currentStreak === 30) {
        const bonusActivity: PointsActivity = {
          type: 'streak_bonus',
          points: POINTS_CONFIG.STREAK_BONUS_30_DAYS,
          timestamp: now,
          description: '30-day streak bonus! 🏆',
          metadata: { streakDays: 30 },
        };
        this.addActivity(userId, bonusActivity);
      }

      // Update best streak
      if (data.currentStreak > data.bestStreak) {
        data.bestStreak = data.currentStreak;
      }
    } else {
      // Streak broken, reset
      data.currentStreak = 1;
    }

    data.lastActivityDate = today;
    this.saveUserData(userId, data);
  }

  /**
   * Add activity and update streak
   */
  private static addActivity(userId: string, activity: PointsActivity): void {
    const data = this.getUserData(userId);
    data.activities.push(activity);
    data.totalPoints += activity.points;
    data.level = this.calculateLevel(data.totalPoints);
    this.updateStreak(userId);
    this.saveUserData(userId, data);
  }

  /**
   * Calculate level based on total points
   */
  static calculateLevel(totalPoints: number): number {
    const thresholds = POINTS_CONFIG.LEVEL_THRESHOLDS;
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
  static getLevelInfo(level: number): { badge: string; title: string; nextThreshold: number } {
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
    const thresholds = POINTS_CONFIG.LEVEL_THRESHOLDS;

    return {
      badge: badges[level] || '👑',
      title: titles[level] || 'Legend',
      nextThreshold: thresholds[level + 1] || thresholds[thresholds.length - 1],
    };
  }

  /**
   * Get user streak data
   */
  static getUserData(userId: string): UserStreakData {
    const stored = localStorage.getItem(`${this.storageKey}_${userId}`);

    if (!stored) {
      const newData = this.initializeUser(userId);
      this.saveUserData(userId, newData);
      return newData;
    }

    const data = JSON.parse(stored);
    data.activities = data.activities.map((a: any) => ({
      ...a,
      timestamp: new Date(a.timestamp),
    }));
    data.lastActivityDate = data.lastActivityDate ? new Date(data.lastActivityDate) : null;

    return data;
  }

  /**
   * Save user streak data
   */
  private static saveUserData(userId: string, data: UserStreakData): void {
    localStorage.setItem(`${this.storageKey}_${userId}`, JSON.stringify(data));
  }

  /**
   * Get recent activities (last N)
   */
  static getRecentActivities(userId: string, limit: number = 10): PointsActivity[] {
    const data = this.getUserData(userId);
    return data.activities.slice(-limit).reverse();
  }

  /**
   * Get points breakdown by type
   */
  static getPointsBreakdown(userId: string): { [key: string]: number } {
    const data = this.getUserData(userId);
    const breakdown: { [key: string]: number } = {
      event: 0,
      donation: 0,
      community_request: 0,
      streak_bonus: 0,
    };

    data.activities.forEach(activity => {
      breakdown[activity.type] = (breakdown[activity.type] || 0) + activity.points;
    });

    return breakdown;
  }

  /**
   * Get points earned this week
   */
  static getWeeklyPoints(userId: string): number {
    const data = this.getUserData(userId);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    return data.activities
      .filter(activity => activity.timestamp > weekAgo)
      .reduce((sum, activity) => sum + activity.points, 0);
  }

  /**
   * Reset all data (for testing)
   */
  static resetUser(userId: string): void {
    localStorage.removeItem(`${this.storageKey}_${userId}`);
  }

  /**
   * Get leaderboard (top users by total points)
   */
  static getLeaderboard(limit: number = 10): UserStreakData[] {
    const allKeys = Object.keys(localStorage).filter(key => key.startsWith(this.storageKey));

    return allKeys
      .map(key => {
        const stored = localStorage.getItem(key);
        return stored ? JSON.parse(stored) : null;
      })
      .filter((data): data is UserStreakData => data !== null)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, limit);
  }
}

export default StreakPointsSystem;