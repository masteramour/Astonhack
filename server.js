import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// Enable CORS
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept",
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Path to the donations JSON file
const donationsFile = path.join(__dirname, "donations.json");

// Initialize donations file if it doesn't exist
if (!fs.existsSync(donationsFile)) {
  fs.writeFileSync(donationsFile, JSON.stringify([], null, 2));
}

// Path to the community requests JSON file
const requestsFile = path.join(__dirname, "communityRequests.json");

// Initialize requests file if it doesn't exist
if (!fs.existsSync(requestsFile)) {
  fs.writeFileSync(requestsFile, JSON.stringify([], null, 2));
}

// POST endpoint to handle donations
app.post("/api/donate", (req, res) => {
  try {
    const donation = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...req.body,
    };

    // Read existing donations
    const donationsData = JSON.parse(fs.readFileSync(donationsFile, "utf-8"));

    // Add new donation
    donationsData.push(donation);

    // Write back to file
    fs.writeFileSync(donationsFile, JSON.stringify(donationsData, null, 2));

    console.log("Donation saved:", donation);
    res.json({
      success: true,
      message: "Donation recorded successfully",
      id: donation.id,
    });
  } catch (error) {
    console.error("Error saving donation:", error);
    res.status(500).json({ success: false, message: "Error saving donation" });
  }
});

// GET endpoint to retrieve all donations
app.get("/api/donations", (req, res) => {
  try {
    const donations = JSON.parse(fs.readFileSync(donationsFile, "utf-8"));
    res.json(donations);
  } catch (error) {
    console.error("Error reading donations:", error);
    res
      .status(500)
      .json({ success: false, message: "Error reading donations" });
  }
});

// ==================== COMMUNITY REQUESTS API ====================

// POST endpoint to create a community request
app.post("/api/requests", (req, res) => {
  try {
    const request = {
      id: `req_${Date.now()}`,
      createdAt: new Date().toISOString(),
      status: "open",
      supporters: 0,
      requesterName: "Current User",
      requesterAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop",
      ...req.body,
    };

    // Read existing requests
    const requestsData = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));

    // Add new request
    requestsData.push(request);

    // Write back to file
    fs.writeFileSync(requestsFile, JSON.stringify(requestsData, null, 2));

    console.log("Request created:", request);
    res.json({
      success: true,
      message: "Request created successfully",
      request,
    });
  } catch (error) {
    console.error("Error creating request:", error);
    res.status(500).json({ success: false, message: "Error creating request" });
  }
});

// GET endpoint to retrieve all community requests
app.get("/api/requests", (req, res) => {
  try {
    const requests = JSON.parse(fs.readFileSync(requestsFile, "utf-8"));
    res.json(requests);
  } catch (error) {
    console.error("Error reading requests:", error);
    res.status(500).json({ success: false, message: "Error reading requests" });
  }
});

// ==================== RECOMMENDATIONS ENGINE ====================

/**
 * POST endpoint to store all users
 */
app.post("/api/users", (req, res) => {
  try {
    const users = req.body;

    if (!Array.isArray(users)) {
      return res.status(400).json({
        success: false,
        message: "Users must be an array",
      });
    }

    const usersFile = path.join(__dirname, "users.json");
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));

    res.json({ success: true, message: `Stored ${users.length} users` });
  } catch (error) {
    console.error("Error storing users:", error);
    res.status(500).json({ success: false, message: "Error storing users" });
  }
});

/**
 * POST endpoint to accept user interests from frontend
 */
app.post("/api/interests", (req, res) => {
  try {
    const { userId, interests } = req.body;

    if (!userId || !interests) {
      return res.status(400).json({
        success: false,
        message: "userId and interests are required",
      });
    }

    // Store interests in a simple JSON file for this session
    const interestsFile = path.join(__dirname, "user_interests.json");
    let interestsData = {};

    if (fs.existsSync(interestsFile)) {
      interestsData = JSON.parse(fs.readFileSync(interestsFile, "utf-8"));
    }

    interestsData[userId] = interests;
    fs.writeFileSync(interestsFile, JSON.stringify(interestsData, null, 2));

    res.json({ success: true, message: "Interests saved" });
  } catch (error) {
    console.error("Error saving interests:", error);
    res.status(500).json({ success: false, message: "Error saving interests" });
  }
});

// GET endpoint for personalized recommendations based on user interests
app.get("/api/recommendations", (req, res) => {
  try {
    const userId = req.query.userId || "current-user";
    const max = parseInt(req.query.max) || 10;

    // Read stored user interests
    const interestsFile = path.join(__dirname, "user_interests.json");
    let userInterestsMap = {};

    if (fs.existsSync(interestsFile)) {
      userInterestsMap = JSON.parse(fs.readFileSync(interestsFile, "utf-8"));
    }

    // Get the current user's interests
    const userInterests = userInterestsMap[userId] || [];

    // Read all users from localStorage data (passed via request or from a users file)
    const usersFile = path.join(__dirname, "users.json");
    let allUsers = [];

    if (fs.existsSync(usersFile)) {
      allUsers = JSON.parse(fs.readFileSync(usersFile, "utf-8"));
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
      const sharedInterests = userInterests.filter((interest) =>
        otherUser.interests.some(
          (oInterest) => oInterest.toLowerCase() === interest.toLowerCase(),
        ),
      );

      // Skip if no shared interests
      if (sharedInterests.length === 0) {
        continue;
      }

      // Calculate match score based on shared interests
      const matchScore = Math.round(
        (sharedInterests.length /
          Math.max(userInterests.length, otherUser.interests.length)) *
          100,
      );

      // Build match reasons
      const matchReasons = [
        {
          type: "interest",
          description: `Both interested in ${sharedInterests.slice(0, 2).join(" and ")}`,
          weight: 0.3,
        },
      ];

      // Generate recommendation reason
      let culturalConnection = "";
      if (sharedInterests.length === userInterests.length) {
        culturalConnection = `Perfect match! All your interests align`;
      } else if (sharedInterests.length >= 2) {
        culturalConnection = `Strong shared passion for ${sharedInterests.join(", ")}`;
      } else {
        culturalConnection = `Great potential to collaborate on ${sharedInterests[0]}`;
      }

      // Suggested activities based on shared interests
      const suggestedActivities = sharedInterests.map(
        (interest) => `${interest} volunteer projects and events`,
      );

      recommendations.push({
        recommendedUserId: otherUser.id,
        recommendedUserName: otherUser.name,
        matchScore,
        matchReasons,
        sharedInterests,
        culturalConnection,
        suggestedActivities: suggestedActivities.slice(0, 3),
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
        totalCandidates: allUsers.length,
      },
    });
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res.status(500).json({
      success: false,
      data: [],
      message: "Error generating recommendations",
      error: error.message,
    });
  }
});

// ==================== POINTS SYSTEM API ====================

const pointsFile = path.join(__dirname, "userPoints.json");

// Initialize points file if it doesn't exist
if (!fs.existsSync(pointsFile)) {
  const defaultData = {
    users: {
      "current-user": {
        userId: "current-user",
        name: "Current User",
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
        urgencyResponse: { high: 0, medium: 0, low: 0 },
      },
    },
    analytics: {
      totalPointsAwarded: 0,
      totalInterests: 0,
      mostPopularCategory: "help",
      averagePointsPerInterest: 0,
      categoryDistribution: { help: 0, food: 0, items: 0, skills: 0, other: 0 },
      urgencyDistribution: { high: 0, medium: 0, low: 0 },
      lastUpdated: new Date().toISOString(),
    },
  };
  fs.writeFileSync(pointsFile, JSON.stringify(defaultData, null, 2));
}

/**
 * GET all points data
 */
app.get("/api/points", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(pointsFile, "utf-8"));
    res.json(data);
  } catch (error) {
    console.error("Error reading points data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error reading points data" });
  }
});

/**
 * POST - Save all points data
 */
app.post("/api/points", (req, res) => {
  try {
    fs.writeFileSync(pointsFile, JSON.stringify(req.body, null, 2));
    res.json({ success: true, message: "Points data saved" });
  } catch (error) {
    console.error("Error saving points data:", error);
    res
      .status(500)
      .json({ success: false, message: "Error saving points data" });
  }
});

/**
 * GET specific user points
 */
app.get("/api/points/:userId", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(pointsFile, "utf-8"));
    const userPoints = data.users[req.params.userId];

    if (!userPoints) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res.json(userPoints);
  } catch (error) {
    console.error("Error reading user points:", error);
    res
      .status(500)
      .json({ success: false, message: "Error reading user points" });
  }
});

/**
 * POST - Record user interest in a community request
 */
app.post("/api/points/interest", (req, res) => {
  try {
    const {
      userId,
      requestId,
      requestTitle,
      pointsEarned,
      category,
      urgency,
      location,
    } = req.body;

    if (!userId || !requestId || !pointsEarned) {
      return res.status(400).json({
        success: false,
        message: "userId, requestId, and pointsEarned are required",
      });
    }

    const data = JSON.parse(fs.readFileSync(pointsFile, "utf-8"));

    // Initialize user if doesn't exist
    if (!data.users[userId]) {
      data.users[userId] = {
        userId,
        name: `User ${userId}`,
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
        urgencyResponse: { high: 0, medium: 0, low: 0 },
      };
    }

    const user = data.users[userId];

    // Check if already interested in this request
    if (user.interests.includes(`community_request:${requestId}`)) {
      return res.json({
        success: false,
        message: "User already showed interest in this request",
        alreadyInterested: true,
      });
    }

    // Add interest
    user.interests.push(`community_request:${requestId}`);
    user.interestedRequests.push({
      requestId,
      timestamp: new Date().toISOString(),
      pointsEarned,
    });

    // Add activity
    user.activities.push({
      type: "community_request",
      points: pointsEarned,
      timestamp: new Date().toISOString(),
      description: `Interested in: ${requestTitle}`,
      metadata: { requestId },
    });

    // Update points and level
    user.totalPoints += pointsEarned;
    user.level = calculateLevel(user.totalPoints);

    // Update category preference
    if (category && user.categoryPreferences.hasOwnProperty(category)) {
      user.categoryPreferences[category]++;
    }

    // Update urgency response
    if (urgency && user.urgencyResponse.hasOwnProperty(urgency)) {
      user.urgencyResponse[urgency]++;
    }

    // Update location preference
    if (location && !user.locationPreferences.includes(location)) {
      user.locationPreferences.push(location);
    }

    // Update streak
    const today = new Date().toISOString().split("T")[0];
    if (user.lastActivityDate !== today) {
      const lastDate = user.lastActivityDate
        ? new Date(user.lastActivityDate)
        : null;
      const todayDate = new Date(today);

      if (lastDate) {
        const daysDiff = Math.floor(
          (todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24),
        );
        if (daysDiff === 1) {
          user.currentStreak++;
          if (user.currentStreak > user.bestStreak) {
            user.bestStreak = user.currentStreak;
          }
        } else if (daysDiff > 1) {
          user.currentStreak = 1;
        }
      } else {
        user.currentStreak = 1;
      }

      user.lastActivityDate = today;
    }

    // Update analytics
    data.analytics.totalPointsAwarded += pointsEarned;
    data.analytics.totalInterests++;
    data.analytics.averagePointsPerInterest =
      data.analytics.totalPointsAwarded / data.analytics.totalInterests;

    if (
      category &&
      data.analytics.categoryDistribution.hasOwnProperty(category)
    ) {
      data.analytics.categoryDistribution[category]++;
    }

    if (urgency && data.analytics.urgencyDistribution.hasOwnProperty(urgency)) {
      data.analytics.urgencyDistribution[urgency]++;
    }

    // Find most popular category
    let maxCount = 0;
    let popularCategory = "help";
    for (const [cat, count] of Object.entries(
      data.analytics.categoryDistribution,
    )) {
      if (count > maxCount) {
        maxCount = count;
        popularCategory = cat;
      }
    }
    data.analytics.mostPopularCategory = popularCategory;
    data.analytics.lastUpdated = new Date().toISOString();

    // Save data
    fs.writeFileSync(pointsFile, JSON.stringify(data, null, 2));

    res.json({
      success: true,
      message: "Interest recorded successfully",
      pointsEarned,
      totalPoints: user.totalPoints,
      level: user.level,
      currentStreak: user.currentStreak,
    });
  } catch (error) {
    console.error("Error recording interest:", error);
    res
      .status(500)
      .json({ success: false, message: "Error recording interest" });
  }
});

/**
 * GET analytics summary
 */
app.get("/api/points/analytics", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(pointsFile, "utf-8"));
    res.json(data.analytics);
  } catch (error) {
    console.error("Error reading analytics:", error);
    res
      .status(500)
      .json({ success: false, message: "Error reading analytics" });
  }
});

/**
 * GET recommendations based on user's interest history
 */
app.get("/api/points/recommendations/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const data = JSON.parse(fs.readFileSync(pointsFile, "utf-8"));

    const user = data.users[userId];
    if (!user) {
      return res.json([]);
    }

    // Generate recommendations based on:
    // 1. Most engaged categories
    // 2. Preferred locations
    // 3. Urgency response patterns

    const recommendations = {
      preferredCategories: Object.entries(user.categoryPreferences)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([category]) => category),
      preferredLocations: user.locationPreferences.slice(-5),
      urgencyPreference:
        Object.entries(user.urgencyResponse)
          .sort(([, a], [, b]) => b - a)
          .map(([urgency]) => urgency)[0] || "medium",
      recommendationScore:
        user.totalPoints / (user.interestedRequests.length || 1),
      engagementLevel:
        user.currentStreak >= 7
          ? "high"
          : user.currentStreak >= 3
            ? "medium"
            : "low",
    };

    res.json(recommendations);
  } catch (error) {
    console.error("Error generating recommendations:", error);
    res
      .status(500)
      .json({ success: false, message: "Error generating recommendations" });
  }
});

/**
 * Helper function to calculate level
 */
function calculateLevel(totalPoints) {
  const thresholds = [0, 100, 250, 500, 1000, 2000, 5000, 10000];
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (totalPoints >= thresholds[i]) {
      return i;
    }
  }
  return 0;
}

app.listen(PORT, () => {
  console.log(`Donations server running on http://localhost:${PORT}`);
});
