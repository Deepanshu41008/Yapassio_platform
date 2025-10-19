const express = require('express');
const router = express.Router();
const { Exam, Resource, Question, StudyPlan, UserProgress, MockTest, TestAttempt } = require('../models');
const aiEngine = require('../engine/aiEngine');

// ============= EXAM MANAGEMENT =============

// Get all exams
router.get('/', async (req, res) => {
  try {
    const { category, difficulty } = req.query;
    let query = { active: true };
    
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    
    const exams = await Exam.find(query);
    res.json({ success: true, exams });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get exam details
router.get('/:id', async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    
    res.json({ success: true, exam });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= AI RESOURCE CURATION =============

// Get AI-curated resources
router.get('/:examId/resources', async (req, res) => {
  try {
    const { subject, topic, type } = req.query;
    const exam = await Exam.findById(req.params.examId);
    
    if (!exam) return res.status(404).json({ error: 'Exam not found' });
    
    // Get existing resources from DB
    let query = { examId: req.params.examId };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (type) query.type = type;
    
    let resources = await Resource.find(query).limit(20);
    
    // If no resources, generate using AI
    if (resources.length === 0 && subject && topic) {
      const aiResources = await aiEngine.curateResources(exam.name, subject, topic);
      
      // Save to database
      for (const resource of aiResources) {
        const newResource = new Resource({
          ...resource,
          examId: req.params.examId
        });
        await newResource.save();
        resources.push(newResource);
      }
    }
    
    res.json({ success: true, resources });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= AI STUDY PLANNER =============

// Generate personalized study plan
router.post('/:examId/study-plan', async (req, res) => {
  try {
    const { userId, targetDate, dailyHours } = req.body;
    
    // Check if plan already exists
    let plan = await StudyPlan.findOne({ 
      userId, 
      examId: req.params.examId,
      active: true 
    });
    
    if (!plan) {
      // Generate new AI-optimized plan
      const planData = await aiEngine.generateStudyPlan(
        userId,
        req.params.examId,
        targetDate,
        dailyHours
      );
      
      plan = new StudyPlan(planData);
      await plan.save();
    }
    
    res.json({ success: true, studyPlan: plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user's study plan
router.get('/:examId/study-plan/:userId', async (req, res) => {
  try {
    const plan = await StudyPlan.findOne({
      userId: req.params.userId,
      examId: req.params.examId,
      active: true
    });
    
    if (!plan) {
      return res.status(404).json({ error: 'Study plan not found' });
    }
    
    res.json({ success: true, studyPlan: plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update task completion
router.patch('/study-plan/:planId/task/:taskId', async (req, res) => {
  try {
    const { completed, notes } = req.body;
    
    const plan = await StudyPlan.findById(req.params.planId);
    if (!plan) return res.status(404).json({ error: 'Plan not found' });
    
    // Find and update task
    for (const day of plan.schedule) {
      const task = day.tasks.find(t => t._id.toString() === req.params.taskId);
      if (task) {
        task.completed = completed;
        task.completedAt = completed ? new Date() : null;
        if (notes) task.notes = notes;
        
        // Update analytics
        if (completed) {
          plan.analytics.totalStudyHours += task.duration / 60;
          plan.analytics.lastStudyDate = new Date();
        }
        break;
      }
    }
    
    await plan.save();
    res.json({ success: true, message: 'Task updated' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= PRACTICE QUESTIONS =============

// Get practice questions
router.get('/:examId/questions', async (req, res) => {
  try {
    const { subject, topic, difficulty, limit = 10 } = req.query;
    
    let query = { examId: req.params.examId };
    if (subject) query.subject = subject;
    if (topic) query.topic = topic;
    if (difficulty) query.difficulty = difficulty;
    
    let questions = await Question.find(query).limit(parseInt(limit));
    
    // Generate AI questions if needed
    if (questions.length < limit && subject && topic) {
      const exam = await Exam.findById(req.params.examId);
      const aiQuestions = await aiEngine.generatePracticeQuestions(
        exam.name,
        subject,
        topic,
        difficulty || 'Medium',
        limit - questions.length
      );
      
      for (const q of aiQuestions) {
        const newQuestion = new Question({
          ...q,
          examId: req.params.examId
        });
        await newQuestion.save();
        questions.push(newQuestion);
      }
    }
    
    res.json({ success: true, questions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit practice answer
router.post('/questions/:questionId/submit', async (req, res) => {
  try {
    const { userId, answer, timeTaken } = req.body;
    
    const question = await Question.findById(req.params.questionId);
    if (!question) return res.status(404).json({ error: 'Question not found' });
    
    const isCorrect = answer === question.correctAnswer;
    
    // Update question statistics
    question.statistics.attempted += 1;
    if (isCorrect) question.statistics.correct += 1;
    question.statistics.avgTime = 
      (question.statistics.avgTime * (question.statistics.attempted - 1) + timeTaken) / 
      question.statistics.attempted;
    await question.save();
    
    // Update user progress
    let progress = await UserProgress.findOne({ 
      userId, 
      examId: question.examId 
    });
    
    if (!progress) {
      progress = new UserProgress({
        userId,
        examId: question.examId
      });
    }
    
    progress.practiceStats.totalQuestions += 1;
    if (isCorrect) progress.practiceStats.correctAnswers += 1;
    progress.practiceStats.accuracy = 
      (progress.practiceStats.correctAnswers / progress.practiceStats.totalQuestions) * 100;
    progress.practiceStats.questionsToday += 1;
    progress.lastActive = new Date();
    
    await progress.save();
    
    res.json({
      success: true,
      isCorrect,
      explanation: question.explanation,
      correctAnswer: question.correctAnswer,
      stats: progress.practiceStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= MOCK TESTS =============

// Get available mock tests
router.get('/:examId/mock-tests', async (req, res) => {
  try {
    const { type, difficulty } = req.query;
    
    let query = { examId: req.params.examId, active: true };
    if (type) query.type = type;
    if (difficulty) query.difficulty = difficulty;
    
    const tests = await MockTest.find(query)
      .select('-questions')
      .sort('-createdAt');
    
    res.json({ success: true, mockTests: tests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start mock test
router.post('/mock-tests/:testId/start', async (req, res) => {
  try {
    const { userId } = req.body;
    
    const mockTest = await MockTest.findById(req.params.testId)
      .populate('questions');
    
    if (!mockTest) return res.status(404).json({ error: 'Test not found' });
    
    // Create test attempt
    const attempt = new TestAttempt({
      userId,
      mockTestId: req.params.testId,
      startTime: new Date()
    });
    
    await attempt.save();
    
    res.json({
      success: true,
      attemptId: attempt._id,
      test: {
        title: mockTest.title,
        duration: mockTest.duration,
        totalQuestions: mockTest.totalQuestions,
        questions: mockTest.questions,
        instructions: mockTest.instructions
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit mock test
router.post('/mock-tests/attempts/:attemptId/submit', async (req, res) => {
  try {
    const { responses } = req.body;
    
    const attempt = await TestAttempt.findById(req.params.attemptId);
    if (!attempt) return res.status(404).json({ error: 'Attempt not found' });
    
    const mockTest = await MockTest.findById(attempt.mockTestId)
      .populate('questions');
    
    // Calculate results
    let correct = 0, incorrect = 0, unattempted = 0;
    let totalMarks = 0, obtainedMarks = 0;
    
    for (const question of mockTest.questions) {
      const response = responses.find(r => r.questionId === question._id.toString());
      
      if (!response || !response.answer) {
        unattempted++;
      } else if (response.answer === question.correctAnswer) {
        correct++;
        obtainedMarks += question.marks;
      } else {
        incorrect++;
        if (mockTest.negativeMarking) {
          obtainedMarks -= question.negativeMarks || 0;
        }
      }
      
      totalMarks += question.marks;
    }
    
    // Update attempt
    attempt.endTime = new Date();
    attempt.status = 'Completed';
    attempt.responses = responses.map(r => ({
      ...r,
      isCorrect: mockTest.questions.find(q => 
        q._id.toString() === r.questionId
      )?.correctAnswer === r.answer
    }));
    attempt.score = obtainedMarks;
    attempt.percentage = (obtainedMarks / totalMarks) * 100;
    attempt.analysis = {
      correct,
      incorrect,
      unattempted,
      accuracy: (correct / (correct + incorrect)) * 100 || 0
    };
    
    // Generate AI feedback
    attempt.feedback = await aiEngine.generateTestFeedback(attempt);
    
    await attempt.save();
    
    // Update user progress
    const progress = await UserProgress.findOne({ 
      userId: attempt.userId,
      examId: mockTest.examId 
    });
    
    if (progress) {
      progress.mockTests.push({
        testId: mockTest._id,
        date: new Date(),
        score: obtainedMarks,
        percentile: attempt.percentage,
        timeTaken: (attempt.endTime - attempt.startTime) / 60000,
        analysis: {
          strong: attempt.feedback.strengths,
          weak: attempt.feedback.weaknesses,
          recommendations: attempt.feedback.recommendations
        }
      });
      await progress.save();
    }
    
    res.json({
      success: true,
      result: {
        score: obtainedMarks,
        totalMarks,
        percentage: attempt.percentage,
        correct,
        incorrect,
        unattempted,
        feedback: attempt.feedback
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ============= WEAK AREA ANALYSIS =============

// Get weak areas and remedy plans
router.get('/progress/:userId/:examId/weak-areas', async (req, res) => {
  try {
    const { weakAreas, remedyPlans } = await aiEngine.analyzeWeakAreas(
      req.params.userId,
      req.params.examId
    );
    
    res.json({ success: true, weakAreas, remedyPlans });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get user progress
router.get('/progress/:userId/:examId', async (req, res) => {
  try {
    const progress = await UserProgress.findOne({
      userId: req.params.userId,
      examId: req.params.examId
    });
    
    if (!progress) {
      return res.json({
        success: true,
        progress: {
          overallProgress: 0,
          practiceStats: {
            totalQuestions: 0,
            correctAnswers: 0,
            accuracy: 0
          }
        }
      });
    }
    
    res.json({ success: true, progress });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
