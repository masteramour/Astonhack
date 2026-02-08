/**
 * Analytics Utilities - Helper functions for analytics service
 * Extracts pure computation functions to improve modularity
 */

/**
 * Extracts interest keywords from event names
 */
export function extractInterests(eventNames: string[]): string[] {
  const keywords = new Set<string>();
  const interestPatterns = [
    'food', 'music', 'art', 'sports', 'education', 'health',
    'environment', 'community', 'technology', 'culture', 'charity',
    'children', 'elderly', 'homeless', 'animals', 'sustainability'
  ];

  eventNames.forEach(name => {
    const lowerName = name.toLowerCase();
    interestPatterns.forEach(pattern => {
      if (lowerName.includes(pattern)) keywords.add(pattern);
    });
  });

  return Array.from(keywords);
}

/**
 * Infers cultural background from languages spoken
 */
export function inferCulturalBackground(languages: string[]): string[] {
  const backgrounds: string[] = [];
  const languageMap: Record<string, string> = {
    Spanish: 'Hispanic/Latino',
    Chinese: 'East Asian',
    Mandarin: 'East Asian',
    Arabic: 'Middle Eastern',
    Hindi: 'South Asian',
    Urdu: 'South Asian',
    French: 'Francophone',
    Portuguese: 'Lusophone',
    Polish: 'Eastern European',
    Russian: 'Eastern European',
    Japanese: 'East Asian',
    Korean: 'East Asian',
    Vietnamese: 'Southeast Asian',
    Tagalog: 'Southeast Asian'
  };

  languages.forEach(lang => {
    const background = languageMap[lang];
    if (background && !backgrounds.includes(background)) backgrounds.push(background);
  });

  return backgrounds;
}

/**
 * Detects trending categories from events
 */
export function detectTrendCategories(
  events: Array<{ Name: string; Date: string }>,
  categories: string[] = ['food', 'music', 'education', 'health', 'environment', 'sports']
) {
  const trends = categories
    .map(category => {
      const matchingEvents = events.filter(e => e.Name.toLowerCase().includes(category));
      return {
        name: category.charAt(0).toUpperCase() + category.slice(1),
        category: 'community',
        popularity: Math.min(100, (matchingEvents.length / Math.max(events.length, 1)) * 100),
        count: matchingEvents.length
      };
    })
    .filter(t => t.count > 0)
    .sort((a, b) => b.popularity - a.popularity);

  return trends;
}

/**
 * Calculates average with fallback
 */
export function calculateAverage(total: number, count: number): number {
  return count > 0 ? Math.round((total / count) * 10) / 10 : 0;
}

/**
 * Calculates engagement rate percentage
 */
export function calculateEngagementRate(participations: number, totalUsers: number): number {
  return totalUsers > 0 ? Math.round((participations / totalUsers) * 1000) / 10 : 0;
}

export default {
  extractInterests,
  inferCulturalBackground,
  detectTrendCategories,
  calculateAverage,
  calculateEngagementRate
};
