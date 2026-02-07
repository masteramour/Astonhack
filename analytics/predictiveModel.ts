/**
 * predictiveModel.ts
 * 
 * This file implements predictive models for analytics.
 * It includes functions for forecasting volunteer performance and event outcomes.
 */

import { GoogleGenAI } from "@google/genai";
import { analyzeLocationStats, identifyLocationGaps, analyzeTrends } from './analyticsService';
import type {
  LocationPrediction,
  AIAnalysisRequest,
  AIAnalysisResponse,
  AnalyticsResponse
} from './types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// ==================== LOCATION PREDICTIONS ====================

/**
 * Predicts optimal event distribution across locations
 * Uses historical data and AI analysis to recommend where events should be held
 */
export async function predictLocationDemand(): Promise<AnalyticsResponse<LocationPrediction[]>> {
  try {
    // Gather analytics data
    const locationStats = await analyzeLocationStats();
    const locationGaps = await identifyLocationGaps();
    const trends = await analyzeTrends();
    
    if (!locationStats.success) {
      throw new Error('Failed to gather location statistics');
    }
    
    // Prepare context for AI analysis
    const context = {
      locationStats: locationStats.data,
      gaps: locationGaps.data,
      trends: trends.data,
      currentDate: new Date().toISOString()
    };
    
    const prompt = `
You are an expert data analyst specializing in community event planning and volunteer coordination.

Analyze the following data about community events across different locations:

LOCATION STATISTICS:
${JSON.stringify(locationStats.data, null, 2)}

LOCATION GAPS:
Underserved Areas: ${locationGaps.data?.underservedAreas.join(', ') || 'None identified'}
Oversaturated Areas: ${locationGaps.data?.oversaturatedAreas.join(', ') || 'None identified'}

CURRENT TRENDS:
${JSON.stringify(trends.data?.emergingTrends.slice(0, 5), null, 2)}

Based on this data, provide predictions for each location:

1. **Predicted Event Demand**: How many events per month should be held in each location?
2. **Confidence Level**: How confident are you in this prediction (0-1)?
3. **Reasoning**: Why is this location well-suited or not suited for events?
4. **Suggested Categories**: What types of events would work best here?
5. **Best Time Slots**: When should events be scheduled?

For underserved areas, suggest how to increase participation.
For oversaturated areas, suggest how to balance event distribution.

Return your analysis as a JSON array with this structure:
[
  {
    "location": "location name",
    "predictedEventDemand": number (0-100 scale),
    "recommendedEventsPerMonth": number,
    "confidence": number (0-1),
    "reasoning": "detailed explanation",
    "suggestedCategories": ["category1", "category2"],
    "bestTimeSlots": ["weekday evenings", "weekend mornings", etc.]
  }
]

Focus on actionable insights and practical recommendations.
`;
    
    const aiResponse = await analyzeWithGemini({
      prompt,
      context,
      analysisType: 'prediction'
    });
    
    // Parse AI response
    let predictions: LocationPrediction[] = [];
    
    try {
      // Try to extract JSON from response
      const jsonMatch = aiResponse.analysis.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        predictions = JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn('Could not parse AI response as JSON, generating fallback predictions');
      predictions = generateFallbackPredictions(locationStats.data, locationGaps.data);
    }
    
    // Ensure we have predictions for all locations
    if (predictions.length === 0) {
      predictions = generateFallbackPredictions(locationStats.data, locationGaps.data);
    }
    
    return {
      success: true,
      data: predictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: predictions.length,
        confidence: aiResponse.confidence
      }
    };
  } catch (error) {
    console.error('Location prediction error:', error);
    
    // Fallback to rule-based predictions
    const locationStats = await analyzeLocationStats();
    const locationGaps = await identifyLocationGaps();
    const fallbackPredictions = generateFallbackPredictions(
      locationStats.data,
      locationGaps.data
    );
    
    return {
      success: true,
      data: fallbackPredictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: fallbackPredictions.length,
        confidence: 0.60
      },
      error: 'Using fallback predictions due to AI service error'
    };
  }
}

/**
 * Generates rule-based predictions when AI is unavailable
 */
function generateFallbackPredictions(
  locationStats: any[],
  locationGaps: any
): LocationPrediction[] {
  return locationStats.map(stat => {
    const isUnderserved = locationGaps?.underservedAreas?.includes(stat.location);
    const isOversaturated = locationGaps?.oversaturatedAreas?.includes(stat.location);
    
    let predictedDemand = 50; // baseline
    let recommendedEvents = 2; // baseline
    let reasoning = 'Balanced event distribution recommended';
    
    if (isUnderserved) {
      predictedDemand = 75;
      recommendedEvents = 4;
      reasoning = 'This area is underserved and could benefit from more community events to increase engagement';
    } else if (isOversaturated) {
      predictedDemand = 30;
      recommendedEvents = 1;
      reasoning = 'This area has high event density. Consider diversifying locations to reach new communities';
    } else {
      predictedDemand = Math.min(100, (stat.averageParticipantsPerEvent / 50) * 100);
      recommendedEvents = Math.ceil(stat.totalEvents / 12); // monthly average
    }
    
    return {
      location: stat.location,
      predictedEventDemand: Math.round(predictedDemand),
      recommendedEventsPerMonth: recommendedEvents,
      confidence: 0.65,
      reasoning,
      suggestedCategories: ['Community', 'Education', 'Health'],
      bestTimeSlots: ['Weekend mornings', 'Weekday evenings']
    };
  });
}

// ==================== PARTICIPANT PREDICTIONS ====================

/**
 * Predicts expected participant numbers for an event
 * based on location, time, and category
 */
export async function predictEventParticipation(
  location: string,
  eventCategory: string,
  date: string
): Promise<AnalyticsResponse<{
  expectedVolunteers: number;
  expectedAttendees: number;
  confidence: number;
  factors: string[];
}>> {
  try {
    const locationStats = await analyzeLocationStats();
    const trends = await analyzeTrends();
    
    const locationData = locationStats.data.find(
      l => l.location.toLowerCase() === location.toLowerCase()
    );
    
    const prompt = `
Predict participant numbers for an upcoming community event:

Location: ${location}
Category: ${eventCategory}
Date: ${date}

Historical data for this location:
${locationData ? JSON.stringify(locationData, null, 2) : 'No historical data available'}

Current trends:
${JSON.stringify(trends.data?.emergingTrends.slice(0, 3), null, 2)}

Provide:
1. Expected number of volunteers (realistic estimate)
2. Expected number of attendees
3. Confidence level (0-1)
4. Key factors influencing these numbers

Return as JSON:
{
  "expectedVolunteers": number,
  "expectedAttendees": number,
  "confidence": number,
  "factors": ["factor1", "factor2", "factor3"]
}
`;
    
    const aiResponse = await analyzeWithGemini({
      prompt,
      context: { location, eventCategory, date },
      analysisType: 'prediction'
    });
    
    let prediction;
    try {
      const jsonMatch = aiResponse.analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        prediction = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      // Fallback calculation
      const baseVolunteers = locationData?.averageParticipantsPerEvent || 10;
      prediction = {
        expectedVolunteers: Math.round(baseVolunteers * 0.3),
        expectedAttendees: Math.round(baseVolunteers * 0.7),
        confidence: 0.60,
        factors: ['Historical average', 'Location performance', 'Seasonal trends']
      };
    }
    
    return {
      success: true,
      data: prediction,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: 1,
        confidence: prediction.confidence
      }
    };
  } catch (error) {
    console.error('Participation prediction error:', error);
    return {
      success: false,
      data: {
        expectedVolunteers: 5,
        expectedAttendees: 15,
        confidence: 0.50,
        factors: ['Default estimate']
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

// ==================== TREND PREDICTIONS ====================

/**
 * Predicts emerging trends and opportunities
 */
export async function predictEmergingTrends(): Promise<AnalyticsResponse<{
  trends: string[];
  opportunities: string[];
  recommendations: string[];
}>> {
  try {
    const trends = await analyzeTrends();
    const locationStats = await analyzeLocationStats();
    
    const prompt = `
As a community engagement strategist, analyze these trends and statistics:

CURRENT TRENDS:
${JSON.stringify(trends.data, null, 2)}

LOCATION PERFORMANCE:
${JSON.stringify(locationStats.data.slice(0, 5), null, 2)}

Identify:
1. **Emerging Trends**: What new patterns or interests are developing?
2. **Opportunities**: Where can we expand or improve our impact?
3. **Strategic Recommendations**: What actions should organizers take?

Focus on:
- Cross-cultural engagement opportunities
- Underserved communities
- Innovative event formats
- Partnership possibilities

Return as JSON:
{
  "trends": ["trend1", "trend2", "trend3"],
  "opportunities": ["opportunity1", "opportunity2"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}
`;
    
    const aiResponse = await analyzeWithGemini({
      prompt,
      context: { trends: trends.data, locations: locationStats.data },
      analysisType: 'insights'
    });
    
    let predictions;
    try {
      const jsonMatch = aiResponse.analysis.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        predictions = JSON.parse(jsonMatch[0]);
      }
    } catch (e) {
      predictions = {
        trends: ['Community wellness', 'Environmental sustainability', 'Cultural exchange'],
        opportunities: ['Partner with local schools', 'Expand to rural areas'],
        recommendations: ['Increase multi-lingual support', 'Create recurring events']
      };
    }
    
    return {
      success: true,
      data: predictions,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: trends.data?.emergingTrends?.length || 0,
        confidence: aiResponse.confidence
      }
    };
  } catch (error) {
    console.error('Trend prediction error:', error);
    return {
      success: false,
      data: {
        trends: [],
        opportunities: [],
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

// ==================== AI ANALYSIS HELPER ====================

/**
 * Core function to interact with Gemini AI
 */
async function analyzeWithGemini(request: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          role: 'user',
          parts: [{ text: request.prompt }]
        }
      ],
      config: {
        systemInstruction: "You are an expert data analyst specializing in community engagement, event planning, and predictive analytics. Provide data-driven insights and actionable recommendations. When possible, return structured JSON responses that can be parsed programmatically.",
        temperature: 0.7,
        topP: 0.9
      }
    });
    
    const analysis = response.text || '';
    
    return {
      analysis,
      confidence: 0.80,
      suggestions: []
    };
  } catch (error) {
    console.error('Gemini AI error:', error);
    throw error;
  }
}

// ==================== EXPORT UTILITIES ====================

/**
 * Generates a comprehensive predictive report
 */
export async function generatePredictiveReport(): Promise<AnalyticsResponse<{
  locationPredictions: LocationPrediction[];
  emergingTrends: any;
  summary: string;
}>> {
  try {
    const [locationPredictions, emergingTrends] = await Promise.all([
      predictLocationDemand(),
      predictEmergingTrends()
    ]);
    
    const summary = `
Predictive Analysis Report - ${new Date().toLocaleDateString()}

LOCATION INSIGHTS:
- Analyzed ${locationPredictions.data.length} locations
- Average confidence: ${Math.round(locationPredictions.metadata.confidence * 100)}%

TREND INSIGHTS:
- ${emergingTrends.data.trends.length} emerging trends identified
- ${emergingTrends.data.opportunities.length} opportunities for growth

Top recommendations:
${emergingTrends.data.recommendations.slice(0, 3).map((r, i) => `${i + 1}. ${r}`).join('\n')}
`;
    
    return {
      success: true,
      data: {
        locationPredictions: locationPredictions.data,
        emergingTrends: emergingTrends.data,
        summary
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: locationPredictions.data.length,
        confidence: Math.min(locationPredictions.metadata.confidence, emergingTrends.metadata.confidence)
      }
    };
  } catch (error) {
    console.error('Report generation error:', error);
    throw error;
  }
}
