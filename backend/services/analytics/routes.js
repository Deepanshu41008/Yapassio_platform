const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Generate a success probability score
// @route   GET /api/analytics/success-score
// @access  Private
router.get('/success-score', protect, async (req, res) => {
  try {
    const user = req.user;
    // In a real app, we would fetch a rich set of user activity.
    // For now, we'll use mocked data based on the user's profile.
    const mockedActivity = `
      - User's primary interest: ${user.interests[0] || 'not specified'}.
      - User's skills: ${user.skills.join(', ') || 'none listed'}.
      - Has completed 2 simulated challenges.
      - Has 1 upcoming study session in their planner.
    `;

    const prompt = `
      You are a data analyst specializing in career success metrics. Your task is to calculate a "Success Probability Score" for a user based on their profile and recent activity. The score should be an integer between 0 and 100.

      **User Profile & Activity:**
      ${mockedActivity}

      **Your Task:**
      Calculate a Success Probability Score. The score should reflect the user's proactive engagement with the platform and the strength of their profile. Also provide a brief justification for the score.

      **Output MUST be in the following JSON format ONLY:**
      {
        "success_score": 85,
        "justification": "The score is high due to the user's clear focus on [Interest] and consistent engagement with platform features like simulations and planning."
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error generating success score:', error);
    res.status(500).json({ message: 'Failed to generate success score', error: error.message });
  }
});

module.exports = router;
