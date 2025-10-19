const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Get curated resources for a specific exam
// @route   GET /api/exams/resources/:examName
// @access  Public
router.get('/:examName', async (req, res) => {
  try {
    const { examName } = req.params;

    const prompt = `
      You are an expert educational content curator. Your task is to generate a list of the top 5-7 most recommended, high-quality, and publicly available study resources for the "${examName}" exam.

      Please categorize the resources into "Textbooks", "Official Websites", "YouTube Channels", and "Online Courses". For each resource, provide a brief description of why it's recommended.

      **Output MUST be in the following JSON format ONLY:**
      {
        "exam": "${examName}",
        "resources": {
          "Textbooks": [
            {
              "title": "Textbook Title 1",
              "author": "Author Name",
              "description": "This book is essential because it covers the core syllabus in great detail..."
            }
          ],
          "Official Websites": [
            {
              "name": "Official Exam Board Website",
              "url": "https://example.com",
              "description": "The official source for syllabus, dates, and announcements."
            }
          ],
          "YouTube Channels": [
            {
              "name": "Channel Name",
              "url": "https://youtube.com/channel/...",
              "description": "This channel provides excellent video lectures on key topics."
            }
          ],
          "Online Courses": [
            {
              "name": "Course on Coursera/edX",
              "url": "https://coursera.org/...",
              "description": "A well-structured course that offers practice quizzes and a certificate."
            }
          ]
        }
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
    console.error(`Error fetching resources for ${req.params.examName}:`, error);
    res.status(500).json({ message: 'Failed to fetch resources', error: error.message });
  }
});

module.exports = router;
