# Analytics & Recommendation System

## 🎯 Overview

An intelligent recommendation system that uses **predictive analytics**, **cross-cultural matching**, and **AI-powered insights** to connect users and optimize event planning.

### Key Features

- 📊 **Location Analytics** - Identifies trends and gaps in event distribution
- 🔮 **Predictive Modeling** - AI-powered predictions using Gemini API
- 🌍 **Cross-Cultural Matching** - Connects users across cultural boundaries
- 🤝 **Smart Recommendations** - Personalized user and event suggestions
- 📈 **Trend Analysis** - Identifies emerging patterns and opportunities

---

## 📁 Folder Structure

```
analytics/
├── types.ts                 # TypeScript type definitions
├── analyticsService.ts      # Core data analytics and processing
├── predictiveModel.ts       # AI-powered predictive analytics
├── culturalMatcher.ts       # Cross-cultural similarity matching
├── recommendationEngine.ts  # Main recommendation orchestrator
├── api.ts                   # API layer for all analytics functions
└── README.md               # This file
```

---

## 🚀 Quick Start

### 1. Import the API

```typescript
import analyticsAPI from './analytics/api';
```

### 2. Get Recommendations

```typescript
// Get recommendations for a user
const recommendations = await analyticsAPI.fetchAllRecommendations(
  userId: 1,
  userType: 'volunteer'
);

console.log('User matches:', recommendations.users.data);
console.log('Event recommendations:', recommendations.events.data);
```

### 3. Get Predictive Insights

```typescript
// Get location predictions
const predictions = await analyticsAPI.fetchLocationPredictions();
console.log('Location analysis:', predictions.data);

// Get emerging trends
const trends = await analyticsAPI.fetchEmergingTrends();
console.log('Trends:', trends.data);
```

---

## 📖 API Reference

### Analytics APIs

#### `fetchLocationStats()`
Returns performance metrics for all event locations.

```typescript
const stats = await analyticsAPI.fetchLocationStats();
// Returns: LocationStats[] with participation, success rates, etc.
```

#### `fetchLocationGaps()`
Identifies underserved and oversaturated locations.

```typescript
const gaps = await analyticsAPI.fetchLocationGaps();
console.log('Underserved:', gaps.data.underservedAreas);
console.log('Oversaturated:', gaps.data.oversaturatedAreas);
```

#### `fetchTrends(startDate?, endDate?)`
Analyzes trends over a time period.

```typescript
const trends = await analyticsAPI.fetchTrends('2026-01-01', '2026-12-31');
console.log('Emerging trends:', trends.data.emergingTrends);
```

#### `fetchParticipationMetrics()`
Gets overall participation statistics.

```typescript
const metrics = await analyticsAPI.fetchParticipationMetrics();
console.log('Total events:', metrics.data.totalEvents);
console.log('Engagement rate:', metrics.data.engagementRate);
```

#### `fetchCommunityDiversity()`
Analyzes cultural diversity of the community.

```typescript
const diversity = await analyticsAPI.fetchCommunityDiversity();
console.log('Languages:', diversity.data.languagesRepresented);
console.log('Diversity score:', diversity.data.diversityScore);
```

---

### Predictive APIs

#### `fetchLocationPredictions()`
Predicts optimal event distribution using AI.

```typescript
const predictions = await analyticsAPI.fetchLocationPredictions();
predictions.data.forEach(pred => {
  console.log(`${pred.location}: ${pred.recommendedEventsPerMonth} events/month`);
  console.log(`Confidence: ${pred.confidence * 100}%`);
});
```

#### `fetchEventParticipationPrediction(location, category, date)`
Predicts participant numbers for a specific event.

```typescript
const prediction = await analyticsAPI.fetchEventParticipationPrediction(
  'Downtown',
  'Food Drive',
  '2026-03-15'
);
console.log('Expected volunteers:', prediction.data.expectedVolunteers);
console.log('Expected attendees:', prediction.data.expectedAttendees);
```

#### `fetchEmergingTrends()`
Identifies emerging opportunities using AI.

```typescript
const trends = await analyticsAPI.fetchEmergingTrends();
console.log('Trends:', trends.data.trends);
console.log('Opportunities:', trends.data.opportunities);
console.log('Recommendations:', trends.data.recommendations);
```

#### `fetchPredictiveReport()`
Generates comprehensive predictive analysis report.

```typescript
const report = await analyticsAPI.fetchPredictiveReport();
console.log(report.data.summary);
```

---

### Matching APIs

#### `fetchCulturalMatches(userId, userType, maxResults?, prioritizeCrossCultural?)`
Finds culturally similar users.

```typescript
const matches = await analyticsAPI.fetchCulturalMatches(
  1,                    // userId
  'volunteer',          // userType
  10,                   // maxResults
  true                  // prioritizeCrossCultural
);

matches.data.forEach(match => {
  console.log('Similarity:', match.similarityScore);
  console.log('Shared languages:', match.sharedLanguages);
  console.log('Shared interests:', match.sharedInterests);
  console.log('Bridge potential:', match.culturalBridgePotential);
});
```

#### `fetchAIMatchingInsights(profile1, profile2)`
Gets AI-enhanced matching insights for two users.

```typescript
const insights = await analyticsAPI.fetchAIMatchingInsights(profile1, profile2);
console.log('Match quality:', insights.data.matchQuality);
console.log('Insights:', insights.data.insights);
console.log('Suggested activities:', insights.data.suggestedActivities);
```

---

### Recommendation APIs

#### `fetchUserRecommendations(userId, userType, config?)`
Gets personalized user connection recommendations.

```typescript
const recommendations = await analyticsAPI.fetchUserRecommendations(1, 'volunteer', {
  minimumMatchScore: 50,
  maxRecommendations: 5,
  diversityBonus: true
});

recommendations.data.forEach(rec => {
  console.log(`Match with ${rec.recommendedUserName}: ${rec.matchScore}%`);
  console.log('Reasons:', rec.matchReasons);
  console.log('Suggested activities:', rec.suggestedActivities);
});
```

#### `fetchEventRecommendations(userId, userType, config?)`
Gets personalized event recommendations.

```typescript
const events = await analyticsAPI.fetchEventRecommendations(1, 'volunteer');

events.data.forEach(event => {
  console.log(`${event.eventName}: ${event.matchScore}% match`);
  console.log('Why:', event.relevanceReasons);
  console.log('Predicted satisfaction:', event.predictedSatisfaction);
});
```

#### `fetchAllRecommendations(userId, userType, config?)`
Gets both user and event recommendations.

```typescript
const all = await analyticsAPI.fetchAllRecommendations(1, 'volunteer');
console.log('User recommendations:', all.users.data);
console.log('Event recommendations:', all.events.data);
```

#### `fetchSmartPairings(eventId)`
Creates optimal pairings for event participants.

```typescript
const pairings = await analyticsAPI.fetchSmartPairings(5);
pairings.data.pairs.forEach(pair => {
  console.log(`${pair.user1.name} + ${pair.user2.name}: ${pair.matchScore}%`);
  console.log('Reason:', pair.reason);
});
```

---

### Dashboard APIs

#### `fetchDashboardData()`
Gets comprehensive overview data.

```typescript
const dashboard = await analyticsAPI.fetchDashboardData();
console.log('Metrics:', dashboard.metrics.data);
console.log('Locations:', dashboard.locationStats.data);
console.log('Trends:', dashboard.trends.data);
console.log('Diversity:', dashboard.diversity.data);
```

#### `fetchOrganizerInsights()`
Gets insights for event organizers.

```typescript
const insights = await analyticsAPI.fetchOrganizerInsights();
console.log('Location predictions:', insights.locationPredictions.data);
console.log('Emerging trends:', insights.emergingTrends.data);
console.log('Location gaps:', insights.locationGaps.data);
```

---

## 🎨 Configuration

Customize recommendation behavior:

```typescript
import { DEFAULT_CONFIG } from './analytics/recommendationEngine';

const customConfig = {
  ...DEFAULT_CONFIG,
  weights: {
    language: 0.30,    // Increase language importance
    interest: 0.35,
    location: 0.15,
    history: 0.15,
    cultural: 0.05
  },
  minimumMatchScore: 60,  // Higher threshold
  maxRecommendations: 5,  // Fewer results
  diversityBonus: true,   // Boost cross-cultural matches
  locationRadius: 50      // Wider search radius
};

const recommendations = await analyticsAPI.fetchUserRecommendations(
  1,
  'volunteer',
  customConfig
);
```

---

## 🧠 How It Works

### 1. Data Collection
- Extracts user profiles from database (languages, interests, participation history)
- Analyzes event data (locations, attendance, success rates)
- Identifies patterns and trends

### 2. Cultural Analysis
- Parses languages spoken by users
- Infers cultural backgrounds from languages
- Extracts interests from event participation
- Calculates similarity scores between users

### 3. Predictive Modeling
- Uses Gemini AI to analyze historical data
- Predicts event demand by location
- Forecasts participant numbers
- Identifies emerging trends

### 4. Recommendation Generation
- Combines cultural similarity with shared interests
- Prioritizes cross-cultural connections
- Ranks recommendations by match score
- Provides actionable insights

---

## 🌟 Key Algorithms

### Similarity Score Calculation

```
similarity = 
  (languageScore × 0.3) +
  (interestScore × 0.4) +
  (locationScore × 0.2) +
  (culturalBridgePotential × 0.1)

where each component is normalized 0-1
```

### Cultural Bridge Potential

```
bridgePotential = 
  if (differentCultures && sharedInterests > 0):
    min(1, sharedInterests × 0.3 + sharedLanguages × 0.2)
  else if (multilingualUsers):
    0.7
  else:
    0
```

### Diversity Score (Simpson's Index)

```
diversity = 1 - Σ(proportion²)

Higher values indicate more diverse community
```

---

## 🔧 Environment Setup

Ensure your `.env` file contains:

```env
API_KEY=your_gemini_api_key_here
```

The system will use fallback algorithms if Gemini AI is unavailable.

---

## 📊 Example Use Cases

### Use Case 1: Find Cross-Cultural Connections
```typescript
// Find volunteers who can bridge cultural gaps
const matches = await analyticsAPI.fetchCulturalMatches(
  volunteerId,
  'volunteer',
  10,
  true  // Prioritize cross-cultural
);

// Get AI insights for top match
const profile1 = await analyticsAPI.fetchCulturalProfile(volunteerId, 'volunteer');
const profile2 = await analyticsAPI.fetchCulturalProfile(matches.data[0].userId2, 'volunteer');
const insights = await analyticsAPI.fetchAIMatchingInsights(profile1!, profile2!);
```

### Use Case 2: Optimize Event Planning
```typescript
// Get location predictions
const predictions = await analyticsAPI.fetchLocationPredictions();

// Identify gaps
const gaps = await analyticsAPI.fetchLocationGaps();

// Plan events in underserved areas
gaps.data.underservedAreas.forEach(area => {
  const prediction = predictions.data.find(p => p.location === area);
  console.log(`Plan ${prediction?.recommendedEventsPerMonth} events in ${area}`);
});
```

### Use Case 3: Personalized Dashboard
```typescript
// Get all data for user dashboard
const recommendations = await analyticsAPI.fetchAllRecommendations(userId, 'volunteer');
const diversity = await analyticsAPI.fetchCommunityDiversity();
const trends = await analyticsAPI.fetchEmergingTrends();

// Display insights
console.log('Your matches:', recommendations.users.data.slice(0, 5));
console.log('Recommended events:', recommendations.events.data.slice(0, 5));
console.log('Community diversity:', diversity.data.diversityScore);
console.log('Hot trends:', trends.data.trends);
```

---

## ⚡ Performance

- **Caching**: Results are calculated on-demand (consider adding caching for production)
- **Batch Processing**: Use dashboard APIs to fetch multiple datasets efficiently
- **AI Fallbacks**: System works without Gemini AI using rule-based algorithms
- **Database Queries**: Optimized with proper indexes and joins

---

## 🔍 Troubleshooting

### Issue: No recommendations returned
**Solution**: Check if user has participation history and profile data. New users may have limited recommendations.

### Issue: Low confidence scores
**Solution**: Add more historical data. Confidence improves with more events and user participation.

### Issue: AI predictions failing
**Solution**: Verify `API_KEY` environment variable. System will use fallback algorithms automatically.

### Issue: Slow performance
**Solution**: Consider adding database indexes on frequently queried columns (LanguagesSpoken, Location, Date).

---

## 🚀 Future Enhancements

- [ ] Add caching layer for expensive predictions
- [ ] Implement machine learning models for better predictions
- [ ] Add real-time collaboration features
- [ ] Create admin dashboard for insights
- [ ] Add A/B testing for recommendation algorithms
- [ ] Integrate with external data sources
- [ ] Add notification system for new matches

---

## 📝 Best Practices

1. **Check Health First**: Use `checkAnalyticsHealth()` before critical operations
2. **Handle Errors**: All APIs return success/failure indicators
3. **Respect Confidence**: Use metadata.confidence to gauge reliability
4. **Configure Wisely**: Adjust weights based on your use case
5. **Monitor Performance**: Log slow queries and optimize as needed

---

## 📞 Support

For questions or issues with the analytics system, refer to the main project documentation or check individual file comments for detailed implementation notes.

---

**Built with ❤️ for 8VENTS - Bringing communities together through intelligent recommendations**
