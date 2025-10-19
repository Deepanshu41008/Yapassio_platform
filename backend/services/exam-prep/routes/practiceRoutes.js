const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Get practice questions for a specific exam
// @route   GET /api/exams/practice/:examName
// @access  Public
router.get('/:examName', async (req, res) => {
  try {
    const { examName } = req.params;
    const { topic = 'a key topic', count = 5 } = req.query;

    const prompt = `
      You are an expert test preparation author. Your task is to generate ${count} high-quality, multiple-choice practice questions for the "${examName}" exam, focusing on the topic of "${topic}".

      For each question, you must provide the question text, an array of 4 options, the correct answer (using the exact text of the correct option), and a brief explanation of why that answer is correct.

      **Output MUST be in the following JSON format ONLY:**
      {
        "exam": "${examName}",
        "topic": "${topic}",
        "questions": [
          {
            "question": "This is the text for question 1?",
            "options": [
              "Option A",
              "Option B",
              "Option C",
              "Option D"
            ],
            "correctAnswer": "Option C",
            "explanation": "This is the correct answer because..."
          },
          {
            "question": "This is the text for question 2?",
            "options": [
              "Option W",
              "Option X",
              "Option Y",
              "Option Z"
            ],
            "correctAnswer": "Option Y",
            "explanation": "This is the correct answer because..."
          }
        ]
      }
    `;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the text to ensure it's valid JSON
    const jsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(jsonString);

    res.json({ success: true, data });

  } catch (error) {
    console.error(`Error fetching practice questions for ${req.params.examName}:`, error);
    res.status(500).json({ message: 'Failed to fetch practice questions', error: error.message });
  }
});

module.exports = router;
