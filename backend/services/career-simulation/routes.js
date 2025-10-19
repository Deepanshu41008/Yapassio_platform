const express = require('express');
const router = express.Router();
const { protect } = require('../../../middleware/authMiddleware');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Get a simulated career challenge
// @route   GET /api/simulations/challenge
// @access  Private
router.get('/challenge', protect, async (req, res) => {
  try {
    const { domain } = req.query;
    if (!domain) {
      return res.status(400).json({ message: 'A career domain must be provided.' });
    }

    const prompt = `
      You are a hiring manager and corporate trainer. Generate a realistic, concise workplace challenge for someone in the "${domain}" field. The challenge should be a typical task they might encounter.

      **Output MUST be in the following JSON format ONLY:**
      {
        "domain": "${domain}",
        "challenge": {
          "title": "Challenge Title",
          "scenario": "A detailed description of a workplace situation.",
          "task": "A clear, actionable task for the user to complete based on the scenario."
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
    console.error('Error generating challenge:', error);
    res.status(500).json({ message: 'Failed to generate challenge', error: error.message });
  }
});

// @desc    Submit a challenge and get feedback
// @route   POST /api/simulations/feedback
// @access  Private
router.post('/feedback', protect, async (req, res) => {
  try {
    const { challenge, submission } = req.body;
    if (!challenge || !submission) {
      return res.status(400).json({ message: 'Challenge and submission are required.' });
    }

    const prompt = `
      You are a senior manager providing feedback on a task completed by a junior colleague.
      The colleague was given the following challenge:
      - Challenge Title: ${challenge.title}
      - Scenario: ${challenge.scenario}
      - Task: ${challenge.task}

      Here is their submission:
      "${submission}"

      Your task is to provide constructive feedback on their submission. Evaluate them on the following criteria: Communication, Technical Proficiency, and Creativity. For each criterion, provide a score from 1 to 10 and a brief justification.

      **Output MUST be in the following JSON format ONLY:**
      {
        "feedback": {
          "overall": "A summary of the overall performance.",
          "scores": {
            "communication": {
              "score": 8,
              "justification": "Your communication was clear and professional."
            },
            "technical_proficiency": {
              "score": 7,
              "justification": "The technical solution was good, but could be improved by..."
            },
            "creativity": {
              "score": 9,
              "justification": "You came up with a novel solution to the problem."
            }
          }
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
    console.error('Error generating feedback:', error);
    res.status(500).json({ message: 'Failed to generate feedback', error: error.message });
  }
});

module.exports = router;
