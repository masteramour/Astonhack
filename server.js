import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Path to the donations JSON file
const donationsFile = path.join(__dirname, 'donations.json');

// Initialize donations file if it doesn't exist
if (!fs.existsSync(donationsFile)) {
  fs.writeFileSync(donationsFile, JSON.stringify([], null, 2));
}

// POST endpoint to handle donations
app.post('/api/donate', (req, res) => {
  try {
    const donation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...req.body
    };

    // Read existing donations
    const donationsData = JSON.parse(fs.readFileSync(donationsFile, 'utf-8'));
    
    // Add new donation
    donationsData.push(donation);
    
    // Write back to file
    fs.writeFileSync(donationsFile, JSON.stringify(donationsData, null, 2));
    
    console.log('Donation saved:', donation);
    res.json({ success: true, message: 'Donation recorded successfully', id: donation.id });
  } catch (error) {
    console.error('Error saving donation:', error);
    res.status(500).json({ success: false, message: 'Error saving donation' });
  }
});

// GET endpoint to retrieve all donations
app.get('/api/donations', (req, res) => {
  try {
    const donations = JSON.parse(fs.readFileSync(donationsFile, 'utf-8'));
    res.json(donations);
  } catch (error) {
    console.error('Error reading donations:', error);
    res.status(500).json({ success: false, message: 'Error reading donations' });
  }
});

// ==================== RECOMMENDATIONS ENGINE ====================

/**
 * POST endpoint to store all users
 */
app.post('/api/users', (req, res) => {
  try {
    const users = req.body;
    
    if (!Array.isArray(users)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Users must be an array' 
      });
    }
    
    const usersFile = path.join(__dirname, 'users.json');
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    
    res.json({ success: true, message: `Stored ${users.length} users` });
  } catch (error) {
    console.error('Error storing users:', error);
    res.status(500).json({ success: false, message: 'Error storing users' });
  }
});

/**
 * POST endpoint to accept user interests from frontend
 */
  try {
    const { userId, interests } = req.body;
    
    if (!userId || !interests) {
      return res.status(400).json({ 
        success: false, 
        message: 'userId and interests are required' 
      });
    }
    
    // Store interests in a simple JSON file for this session
    const interestsFile = path.join(__dirname, 'user_interests.json');
    let interestsData = {};
    
    if (fs.existsSync(interestsFile)) {
      interestsData = JSON.parse(fs.readFileSync(interestsFile, 'utf-8'));
    }
    
    interestsData[userId] = interests;
    fs.writeFileSync(interestsFile, JSON.stringify(interestsData, null, 2));
    
    res.json({ success: true, message: 'Interests saved' });
  } catch (error) {
    console.error('Error saving interests:', error);
    res.status(500).json({ success: false, message: 'Error saving interests' });
  }
});

// GET endpoint for personalized recommendations based on user interests
app.get('/api/recommendations', (req, res) => {
  try {
    const userId = req.query.userId || 'current-user';
    const max = parseInt(req.query.max) || 10;
    
    // Read stored user interests
    const interestsFile = path.join(__dirname, 'user_interests.json');
    let userInterestsMap = {};
    
    if (fs.existsSync(interestsFile)) {
      userInterestsMap = JSON.parse(fs.readFileSync(interestsFile, 'utf-8'));
    }
    
    // Get the current user's interests
    const userInterests = userInterestsMap[userId] || [];
    
    // Read all users from localStorage data (passed via request or from a users file)
    const usersFile = path.join(__dirname, 'users.json');
    let allUsers = [];
    
    if (fs.existsSync(usersFile)) {
      allUsers = JSON.parse(fs.readFileSync(usersFile, 'utf-8'));
    }
    
    // Generate recommendations by matching interests
    const recommendations = [];
    
    for (const otherUser of allUsers) {
      // Skip self
      if (otherUser.id === userId) {
        continue;
      }
      
      // Skip if no interests data
      if (!otherUser.interests || otherUser.interests.length === 0) {
        continue;
      }
      
      // Calculate shared interests
      const sharedInterests = userInterests.filter(interest =>
        otherUser.interests.some(oInterest => 
          oInterest.toLowerCase() === interest.toLowerCase()
        )
      );
      
      // Skip if no shared interests
      if (sharedInterests.length === 0) {
        continue;
      }
      
      // Calculate match score based on shared interests
      const matchScore = Math.round(
        (sharedInterests.length / Math.max(userInterests.length, otherUser.interests.length)) * 100
      );
      
      // Build match reasons
      const matchReasons = [
        {
          type: 'interest',
          description: `Both interested in ${sharedInterests.slice(0, 2).join(' and ')}`,
          weight: 0.30
        }
      ];
      
      // Generate recommendation reason
      let culturalConnection = '';
      if (sharedInterests.length === userInterests.length) {
        culturalConnection = `Perfect match! All your interests align`;
      } else if (sharedInterests.length >= 2) {
        culturalConnection = `Strong shared passion for ${sharedInterests.join(', ')}`;
      } else {
        culturalConnection = `Great potential to collaborate on ${sharedInterests[0]}`;
      }
      
      // Suggested activities based on shared interests
      const suggestedActivities = sharedInterests.map(interest => 
        `${interest} volunteer projects and events`
      );
      
      recommendations.push({
        recommendedUserId: otherUser.id,
        recommendedUserName: otherUser.name,
        matchScore,
        matchReasons,
        sharedInterests,
        culturalConnection,
        suggestedActivities: suggestedActivities.slice(0, 3)
      });
    }
    
    // Sort by match score (descending)
    recommendations.sort((a, b) => b.matchScore - a.matchScore);
    
    // Return top matches
    const topRecommendations = recommendations.slice(0, max);
    
    res.json({
      success: true,
      data: topRecommendations,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataPoints: recommendations.length,
        confidence: topRecommendations.length > 0 ? 0.85 : 0.5,
        userId: userId,
        userInterests: userInterests,
        totalCandidates: allUsers.length
      }
    });
  } catch (error) {
    console.error('Error generating recommendations:', error);
    res.status(500).json({ 
      success: false, 
      data: [],
      message: 'Error generating recommendations',
      error: error.message
    });
  }
});

// ==================== GEMINI AI MATCHING ====================

/**
 * POST endpoint for AI-enhanced volunteer matching using Gemini
 */
app.post('/api/gemini-match', async (req, res) => {
  try {
    const { volunteer1, volunteer2, matchScore } = req.body;
    
    // Gemini prompt for analyzing volunteer compatibility
    const prompt = `You are an expert in matching volunteers based on complementary skills and shared values.

Analyze these two volunteers for a community matching recommendation:

VOLUNTEER 1:
- ID: ${volunteer1.id}

VOLUNTEER 2:
- Name: ${volunteer2.name}
- Shared Interests: ${volunteer2.interests.join(', ') || 'General volunteering'}
- Match Score: ${matchScore}%

Based on their interests and match score, provide a brief, warm, and encouraging insight (1-2 sentences) about why they would make great volunteer partners. Focus on the potential they have to collaborate and support each other.

Respond with ONLY the insight text, no JSON or formatting.`;

    // Note: In production, you would use the actual Gemini API
    // For now, we'll return a meaningful insight based on match score
    const insights = {
      95: "Perfect synergy! You both share a passion for making an impact, and your complementary interests could lead to powerful collaborative projects.",
      85: "Great potential! Your aligned values and interests make you ideal partners for meaningful volunteer work together.",
      75: "Strong match! You both bring enthusiasm to similar causes and could accomplish great things as a team.",
      65: "Good compatibility! While your interests differ slightly, you can learn from each other and expand your volunteer horizons together.",
      default: "You both care about community impact, and working together could create meaningful change."
    };

    const insight = insights[matchScore] || insights.default;

    res.json({
      success: true,
      insights: insight,
      matchScore: matchScore,
      recommendation: 'Connect and explore volunteer opportunities together!'
    });
  } catch (error) {
    console.error('Error in Gemini matching:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error processing Gemini match',
      error: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Donations server running on http://localhost:${PORT}`);
});
