const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Google Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || 'AIzaSyDxLDuLA9paxomWOgz0dXwW0Il9-BnUopo');

// @desc    Get global opportunities for a specific domain
// @route   GET /api/opportunities/:domain
// @access  Public
router.get('/:domain', async (req, res) => {
  try {
    const { domain } = req.params;
    if (!domain) {
      return res.status(400).json({ message: 'A career domain must be provided.' });
    }

    const prompt = `
      You are an international recruitment and immigration expert. Your task is to provide a summary of global opportunities for the "${domain}" field.

      Please provide the following information:
      1.  **Top Countries:** A list of the top 3-5 countries with high demand for professionals in this field.
      2.  **Visa Pathways:** For each country, briefly mention one or two common visa or immigration pathways (e.g., "Canada Express Entry", "German Job Seeker Visa").
      3.  **Job Boards:** A list of 3-4 major international job boards where one can find jobs in this domain.

      **Output MUST be in the following JSON format ONLY:**
      {
        "domain": "${domain}",
        "opportunities": {
          "top_countries": [
            {
              "country": "Country Name",
              "demand_level": "High",
              "visa_pathways": ["Visa Program 1", "Visa Program 2"]
            }
          ],
          "job_boards": [
            {
              "name": "LinkedIn",
              "url": "https://www.linkedin.com/jobs/"
            },
            {
              "name": "Indeed",
              "url": "https://www.indeed.com/"
            }
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
    console.error('Error generating opportunities:', error);
    res.status(500).json({ message: 'Failed to generate opportunities', error: error.message });
  }
});

module.exports = router;
