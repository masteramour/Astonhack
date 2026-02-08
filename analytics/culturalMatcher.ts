/**
 * culturalMatcher.ts
 * 
 * This file contains logic for matching volunteers and events based on cultural profiles.
 * It includes functions for analyzing language compatibility and shared interests.
 */

import { GoogleGenAI } from "@google/genai";
import { buildCulturalProfile } from './analyticsService';
import { getDatabase } from '../services/database';
import type {
  CulturalProfile,
  CulturalSimilarity,
  AnalyticsResponse
} from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// ==================== SIMILARITY CALCULATION ====================

/**
 * Calculates cultural similarity between two users
 * Considers languages, interests, participation patterns, and cultural bridging potential
 */
export function calculateCulturalSimilarity(
  profile1: CulturalProfile,
  profile2: CulturalProfile
): CulturalSimilarity {
  // Language similarity (0-1 scale)
  const sharedLanguages = profile1.languages.filter(lang =>
    profile2.languages.some(l => l.toLowerCase() === lang.toLowerCase())
  );
  const languageScore = sharedLanguages.length > 0
    ? sharedLanguages.length / Math.max(profile1.languages.length, profile2.languages.length)
    : 0;
  
  // Interest similarity (0-1 scale)
  const sharedInterests = profile1.interests.filter(interest =>
    profile2.interests.some(i => i.toLowerCase() === interest.toLowerCase())
  );
  const interestScore = sharedInterests.length > 0
    ? sharedInterests.length / Math.max(profile1.interests.length, profile2.interests.length)
    : 0;
  
  // Location preference overlap (0-1 scale)
  const sharedLocations = profile1.locationPreferences.filter(loc =>
    profile2.locationPreferences.some(l => l.toLowerCase() === loc.toLowerCase())
  );
  const locationScore = sharedLocations.length > 0
    ? sharedLocations.length / Math.max(profile1.locationPreferences.length, profile2.locationPreferences.length)
    : 0;
  
  // Different cultural backgrounds? (bonus for cross-cultural bridging)
  const differentCultures = !profile1.culturalBackground.some(bg =>
    profile2.culturalBackground.includes(bg)
  );
  
  // Cultural bridge potential: high when users have different backgrounds but shared interests
  let culturalBridgePotential = 0;
  if (differentCultures && sharedInterests.length > 0) {
    culturalBridgePotential = Math.min(1, (sharedInterests.length * 0.3) + (sharedLanguages.length * 0.2));
  } else if (sharedLanguages.length > 1) {
    // Multilingual users have high bridging potential
    culturalBridgePotential = 0.7;
  }
  
  // Overall similarity score (weighted average)
  const similarityScore = (
    languageScore * 0.3 +
    interestScore * 0.4 +
    locationScore * 0.2 +
    culturalBridgePotential * 0.1
  );
  
  // Generate recommendation reason
  let recommendationReason = '';
  if (sharedInterests.length > 0 && differentCultures) {
    recommendationReason = `Despite different cultural backgrounds, you share interests in ${sharedInterests.slice(0, 3).join(', ')}. This is a great opportunity for cross-cultural collaboration!`;
  } else if (sharedLanguages.length > 1) {
    recommendationReason = `You both speak ${sharedLanguages.join(' and ')}, making communication easy and creating opportunities to bridge communities.`;
  } else if (sharedInterests.length > 2) {
    recommendationReason = `You share strong interests in ${sharedInterests.slice(0, 3).join(', ')}, suggesting great collaboration potential.`;
  } else if (sharedLocations.length > 0) {
    recommendationReason = `You both engage in events at ${sharedLocations[0]}, making it easy to connect in person.`;
  } else {
    recommendationReason = 'Complementary skills and backgrounds could lead to unique partnerships.';
  }
  
  return {
    userId1: profile1.userId,
    userId2: profile2.userId,
    similarityScore,
    sharedLanguages,
    sharedInterests,
    culturalBridgePotential,
    recommendationReason
  };
}

// ==================== FIND MATCHES ====================

/**
 * Finds culturally similar users for a given user
 * Prioritizes cross-cultural matches with shared interests
 */
export async function findCulturalMatches(
  userId: number,
  userType: 'volunteer' | 'attendee',
  maxResults: number = 10,
  prioritizeCrossCultural: boolean = true
): Promise<AnalyticsResponse<CulturalSimilarity[]>> {
  try {
    const db = await getDatabase();
    
    // Get target user's profile
    const targetProfile = await buildCulturalProfile(userId, userType);
    if (!targetProfile) {
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
    
    // Get all other users (both volunteers and attendees)
    const [volunteers] = await db.execute('SELECT Volunteer_ID FROM Volunteers WHERE Volunteer_ID != ?', [userType === 'volunteer' ? userId : -1]) as any;
    
    const [attendees] = await db.execute('SELECT Attendee_ID FROM Attendee WHERE Attendee_ID != ?', [userType === 'attendee' ? userId : -1]) as any;
    
    const similarities: CulturalSimilarity[] = [];
    
    // Compare with all volunteers
    for (const vol of volunteers) {
      const otherProfile = await buildCulturalProfile(vol.Volunteer_ID, 'volunteer');
      if (otherProfile) {
        const similarity = calculateCulturalSimilarity(targetProfile, otherProfile);
        similarities.push(similarity);
      }
    }
    
    // Compare with all attendees
    for (const att of attendees) {
      const otherProfile = await buildCulturalProfile(att.Attendee_ID, 'attendee');
      if (otherProfile) {
        const similarity = calculateCulturalSimilarity(targetProfile, otherProfile);
        similarities.push(similarity);
      }
    }
    
    // Sort by similarity score
    similarities.sort((a, b) => {
      if (prioritizeCrossCultural) {
        // Prioritize cross-cultural matches with high bridge potential
        const scoreA = a.similarityScore + (a.culturalBridgePotential * 0.5);
        const scoreB = b.similarityScore + (b.culturalBridgePotential * 0.5);
        return scoreB - scoreA;
      }
      return b.similarityScore - a.similarityScore;
    });
    
    // Return top matches
    const topMatches = similarities.slice(0, maxResults);
    
    return {
      success: true,
      data: topMatches,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: similarities.length,
        confidence: 0.75
      }
    };
  } catch (error) {
    console.error('Cultural matching error:', error);
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

// ==================== AI-ENHANCED MATCHING ====================

/**
 * Uses Gemini AI to provide deeper cultural insights and matching recommendations
 */
export async function getAIEnhancedMatching(
  profile1: CulturalProfile,
  profile2: CulturalProfile
): Promise<AnalyticsResponse<{
  matchQuality: 'excellent' | 'good' | 'moderate' | 'low';
  insights: string[];
  suggestedActivities: string[];
  conversationStarters: string[];
}>> {
  try {
    const basicSimilarity = calculateCulturalSimilarity(profile1, profile2);
    
    const prompt = `
You are a cultural liaison and community engagement expert. Analyze these two user profiles to provide insights for facilitating meaningful cross-cultural connections:

USER 1:
- Languages: ${profile1.languages.join(', ')}
- Cultural Background: ${profile1.culturalBackground.join(', ') || 'Not specified'}
- Interests: ${profile1.interests.join(', ') || 'General community engagement'}
- Participation: ${profile1.participationHistory.length} events

USER 2:
- Languages: ${profile2.languages.join(', ')}
- Cultural Background: ${profile2.culturalBackground.join(', ') || 'Not specified'}
- Interests: ${profile2.interests.join(', ') || 'General community engagement'}
- Participation: ${profile2.participationHistory.length} events

SHARED:
- Languages: ${basicSimilarity.sharedLanguages.join(', ') || 'None'}
- Interests: ${basicSimilarity.sharedInterests.join(', ') || 'None'}

Provide:
1. **Match Quality**: excellent/good/moderate/low
2. **Cultural Insights**: What makes this match valuable? How can they bridge cultural gaps?
3. **Suggested Activities**: What events or activities would they both enjoy?
4. **Conversation Starters**: Ice-breaker topics based on their shared interests

Return as JSON:
{
  "matchQuality": "excellent/good/moderate/low",
  "insights": ["insight1", "insight2", "insight3"],
  "suggestedActivities": ["activity1", "activity2", "activity3"],
  "conversationStarters": ["starter1", "starter2", "starter3"]
}
`;
    
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        systemInstruction: "You are an expert in cross-cultural communication and community building. Provide thoughtful, actionable insights that help people from different backgrounds connect meaningfully.",
        temperature: 0.8
      }
    });
    
    let analysis;
    try {
      const jsonMatch = (response.text || '').match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback analysis
      analysis = {
        matchQuality: basicSimilarity.similarityScore > 0.6 ? 'good' : 'moderate',
        insights: [
          basicSimilarity.recommendationReason,
          'Look for common ground in shared experiences',
          'Cultural diversity strengthens community bonds'
        ],
        suggestedActivities: basicSimilarity.sharedInterests.length > 0
          ? basicSimilarity.sharedInterests.map(i => `${i} events`)
          : ['Cultural exchange events', 'Community potlucks', 'Language exchange meetups'],
        conversationStarters: [
          'What brought you to community volunteering?',
          `Tell me about your experience with ${basicSimilarity.sharedInterests[0] || 'community events'}`,
          'What traditions from your culture do you love sharing?'
        ]
      };
    }
    
    return {
      success: true,
      data: analysis,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 1,
        confidence: 0.85
      }
    };
  } catch (error) {
    console.error('AI-enhanced matching error:', error);
    return {
      success: false,
      data: {
        matchQuality: 'moderate',
        insights: ['Analysis temporarily unavailable'],
        suggestedActivities: ['Community events'],
        conversationStarters: ['What interests you most about volunteering?']
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 0,
        confidence: 0.50
      },
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// ==================== COMMUNITY DIVERSITY ANALYSIS ====================

/**
 * Analyzes the cultural diversity of the entire community
 * Identifies representation gaps and opportunities for bridging
 */
export async function analyzeCommunityDiversity(): Promise<AnalyticsResponse<{
  totalUsers: number;
  languagesRepresented: { language: string; count: number }[];
  culturalGroups: { group: string; count: number }[];
  diversityScore: number; // 0-100, higher is more diverse
  bridgingOpportunities: string[];
}>> {
  try {
    const db = await getDatabase();
    
    // Get all users
    const [volunteers] = await db.execute('SELECT LanguagesSpoken FROM Volunteers WHERE LanguagesSpoken IS NOT NULL', []) as any;
    const [attendees] = await db.execute('SELECT LanguagesSpoken FROM Attendee WHERE LanguagesSpoken IS NOT NULL', []) as any;
    
    const allUsers = [...volunteers, ...attendees];
    const totalUsers = allUsers.length;
    
    // Parse languages
    const languageMap = new Map<string, number>();
    const culturalMap = new Map<string, number>();
    
    allUsers.forEach(user => {
      if (user.LanguagesSpoken) {
        const languages = user.LanguagesSpoken.split(',').map((l: string) => l.trim());
        languages.forEach(lang => {
          languageMap.set(lang, (languageMap.get(lang) || 0) + 1);
          
          // Infer cultural background
          const culturalBackground = inferCulturalGroup(lang);
          if (culturalBackground) {
            culturalMap.set(culturalBackground, (culturalMap.get(culturalBackground) || 0) + 1);
          }
        });
      }
    });
    
    const languagesRepresented = Array.from(languageMap.entries())
      .map(([language, count]) => ({ language, count }))
      .sort((a, b) => b.count - a.count);
    
    const culturalGroups = Array.from(culturalMap.entries())
      .map(([group, count]) => ({ group, count }))
      .sort((a, b) => b.count - a.count);
    
    // Calculate diversity score (Simpson's Diversity Index)
    const culturalGroupCounts = Array.from(culturalMap.values());
    const totalCulturalAssignments = culturalGroupCounts.reduce((sum, count) => sum + count, 0);
    
    let diversityIndex = 0;
    if (totalCulturalAssignments > 0) {
      const sumOfSquares = culturalGroupCounts.reduce((sum, count) => {
        const proportion = count / totalCulturalAssignments;
        return sum + (proportion * proportion);
      }, 0);
      diversityIndex = 1 - sumOfSquares;
    }
    
    const diversityScore = Math.round(diversityIndex * 100);
    
    // Identify bridging opportunities
    const bridgingOpportunities = identifyBridgingOpportunities(
      languagesRepresented,
      culturalGroups
    );
    
    return {
      success: true,
      data: {
        totalUsers,
        languagesRepresented,
        culturalGroups,
        diversityScore,
        bridgingOpportunities
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: totalUsers,
        confidence: 0.80
      }
    };
  } catch (error) {
    console.error('Community diversity analysis error:', error);
    return {
      success: false,
      data: {
        totalUsers: 0,
        languagesRepresented: [],
        culturalGroups: [],
        diversityScore: 0,
        bridgingOpportunities: []
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

/**
 * Helper: Infers cultural group from language
 */
function inferCulturalGroup(language: string): string | null {
  const mapping: Record<string, string> = {
    'Spanish': 'Hispanic/Latino',
    'Chinese': 'East Asian',
    'Mandarin': 'East Asian',
    'Cantonese': 'East Asian',
    'Arabic': 'Middle Eastern',
    'Hindi': 'South Asian',
    'Urdu': 'South Asian',
    'French': 'Francophone',
    'Portuguese': 'Lusophone',
    'Polish': 'Eastern European',
    'Russian': 'Eastern European',
    'Japanese': 'East Asian',
    'Korean': 'East Asian',
    'Vietnamese': 'Southeast Asian',
    'Tagalog': 'Southeast Asian',
    'Italian': 'Mediterranean',
    'Greek': 'Mediterranean',
    'German': 'Germanic European'
  };
  
  return mapping[language] || null;
}

/**
 * Helper: Identifies opportunities for cultural bridging
 */
function identifyBridgingOpportunities(
  languages: { language: string; count: number }[],
  culturalGroups: { group: string; count: number }[]
): string[] {
  const opportunities: string[] = [];
  
  // Large language groups could host cultural exchange events
  const largeGroups = languages.filter(l => l.count >= 5);
  if (largeGroups.length >= 2) {
    opportunities.push(
      `Host multilingual events featuring ${largeGroups[0].language} and ${largeGroups[1].language} to bridge communities`
    );
  }
  
  // Multiple cultural groups suggest partnership opportunities
  if (culturalGroups.length >= 3) {
    opportunities.push(
      `Create cultural exchange programs connecting ${culturalGroups.slice(0, 3).map(g => g.group).join(', ')}`
    );
  }
  
  // Underrepresented groups need targeted outreach
  const smallGroups = culturalGroups.filter(g => g.count < 3);
  if (smallGroups.length > 0) {
    opportunities.push(
      `Increase outreach to underrepresented communities: ${smallGroups.map(g => g.group).join(', ')}`
    );
  }
  
  // Multilingual users can serve as cultural ambassadors
  if (languages.length >= 5) {
    opportunities.push(
      'Recruit multilingual volunteers as cultural ambassadors and translators'
    );
  }
  
  return opportunities;
}
