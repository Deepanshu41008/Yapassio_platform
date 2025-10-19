const express = require('express');
const router = express.Router();
const examPreparationController = require('../controllers/examPreparationController');

// Exam routes
router.get('/exams', examPreparationController.listExams);
router.get('/exams/:exam_id/syllabus', examPreparationController.getSyllabus);

// Resource routes
router.post('/resources/curate', examPreparationController.curateResources);

// Study plan routes
router.post('/study-plans/generate', examPreparationController.generateStudyPlan);

// Question routes
router.post('/questions/generate', examPreparationController.generateQuestions);

// Student progress routes
router.post('/students/:student_id/weak-areas/analyze', examPreparationController.analyzeWeakAreas);

// Mock test routes
router.post('/mock-tests/generate', examPreparationController.generateMockTest);
router.post('/mock-tests/:test_id/submit', examPreparationController.submitMockTest);

module.exports = router;
