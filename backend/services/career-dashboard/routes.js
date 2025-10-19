const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Generate a SWOT analysis for the user
// @route   GET /api/dashboard/swot
// @access  Private
router.get('/swot', protect, async (req, res) => {
  try {
    const user = req.user;
    // In a real app, we would fetch user's recent activity from the database.
    // For now, we'll use mocked data based on the user's profile.
    const mockedActivity = `
      - User has interests in: ${user.interests.join(', ')}.
      - User has skills in: ${user.skills.join(', ')}.
      - Recently completed a simulation challenge in the '${user.interests[0] || 'their chosen'}' domain.
    `;

    const prompt = `
      You are a career coach. Perform a SWOT (Strengths, Weaknesses, Opportunities, Threats) analysis for a user based on their profile and recent activity.

      **User Profile & Activity:**
      ${mockedActivity}

      **Your Task:**
      Generate a brief SWOT analysis. For each of the four areas, provide 2-3 bullet points.

      **Output MUST be in the following JSON format ONLY:**
      {
        "swot_analysis": {
          "strengths": [
            "Strength 1 based on skills.",
            "Strength 2 based on interests."
          ],
          "weaknesses": [
            "Weakness 1, e.g., 'May need to diversify skills beyond current interests.'",
            "Weakness 2, e.g., 'Practical experience not yet demonstrated.'"
          ],
          "opportunities": [
            "Opportunity 1, e.g., 'High demand in the fields of interest.'",
            "Opportunity 2, e.g., 'Can leverage skills in [X] to explore new areas.'"
          ],
          "threats": [
            "Threat 1, e.g., 'Field is competitive.'",
            "Threat 2, e.g., 'Rapid technological changes may require constant learning.'"
          ]
        }
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const jsonString = response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error generating SWOT analysis:', error);
    res.status(500).json({ message: 'Failed to generate SWOT analysis', error: error.message });
  }
});

module.exports = router;
