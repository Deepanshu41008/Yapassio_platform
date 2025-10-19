const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require('dotenv');

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Fallback mock responses for when API is unavailable
const callGeminiAPI = async (prompt) => {
  // Check if we should use mock data
  const useMock = process.env.USE_MOCK_AI === 'true';
  
  if (useMock) {
    console.log('⚠️  Using mock AI response');
    return generateMockResponse(prompt);
  }
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro"});
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API request failed:', error.message);
    console.log('⚠️  Falling back to mock AI response');
    return generateMockResponse(prompt);
  }
};

// Generate contextual mock responses based on the prompt
const generateMockResponse = (prompt) => {
  const lowerPrompt = prompt.toLowerCase();
  
  // Question generation
  if (lowerPrompt.includes('generate') && lowerPrompt.includes('question')) {
    const count = parseInt(prompt.match(/\d+/)?.[0] || '5');
    const questions = [];
    for (let i = 1; i <= count; i++) {
      questions.push({
        question_text: `Sample Question ${i}: What is the significance of the topic being studied?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correct_answer: 'Option A',
        explanation: 'This is a sample explanation for educational purposes.'
      });
    }
    return JSON.stringify(questions);
  }
  
  // Scenario generation
  if (lowerPrompt.includes('scenario') || lowerPrompt.includes('simulation')) {
    return JSON.stringify({
      scenario_title: 'Professional Workplace Challenge',
      context: 'You are working on a critical project with tight deadlines.',
      role: 'Team Lead responsible for deliverables',
      artifacts_provided: ['Project brief', 'Resource list', 'Timeline'],
      deliverables_required: ['Status report', 'Risk assessment', 'Action plan'],
      evaluation_criteria: ['Quality of analysis', 'Practical solutions', 'Communication clarity']
    });
  }
  
  // Study plan generation
  if (lowerPrompt.includes('study plan')) {
    return JSON.stringify({
      schedule: [
        { date: new Date().toISOString().split('T')[0], topics: [{ topic_name: 'Introduction', duration_minutes: 60 }], is_revision_day: false, is_mock_test_day: false }
      ],
      milestones: [{ week: 1, target: 'Complete foundation topics' }],
      ai_confidence_score: 85
    });
  }
  
  // Resource curation
  if (lowerPrompt.includes('quality') || lowerPrompt.includes('resource')) {
    return JSON.stringify({
      quality_score: 8,
      reasoning: 'High-quality educational content with clear explanations',
      target_difficulty: 'medium'
    });
  }
  
  // Weak area analysis
  if (lowerPrompt.includes('weak') || lowerPrompt.includes('remedial')) {
    return JSON.stringify({
      root_causes: 'Need more practice with core concepts and time management',
      remedial_plan: 'Focus on fundamentals with daily practice sessions and timed exercises'
    });
  }
  
  // Skills extraction
  if (lowerPrompt.includes('skills') || lowerPrompt.includes('extract')) {
    return JSON.stringify(['HTML', 'CSS', 'JavaScript', 'Responsive Design']);
  }
  
  // Evaluation
  if (lowerPrompt.includes('evaluate')) {
    return JSON.stringify({
      overall_score: 75,
      detailed_feedback: 'Good effort with room for improvement in technical execution and presentation'
    });
  }
  
  // Performance analysis
  if (lowerPrompt.includes('performance')) {
    return JSON.stringify({
      final_outcome: 'Successful communication',
      empathy_score: 80,
      professionalism_score: 85
    });
  }
  
  // Default response
  return 'Thank you for your query. This is a helpful AI-generated response for your request.';
};

const getEmbedding = async (text) => {
    try {
        const model = genAI.getGenerativeModel({ model: "embedding-001"});
        const result = await model.embedContent(text);
        return result.embedding.values;
    } catch (error) {
        console.error('Gemini embedding request failed:', error);
        throw new Error('Gemini embedding request failed');
    }
};


module.exports = { callGeminiAPI, getEmbedding };
