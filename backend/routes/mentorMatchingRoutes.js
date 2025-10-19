const express = require('express');
const router = express.Router();
const mentorMatchingController = require('../controllers/mentorMatchingController');

// Mentor routes
router.post('/mentors/register', mentorMatchingController.registerMentor);

// Student routes
router.post('/students/profile', mentorMatchingController.createStudentProfile);

// Matching routes
router.post('/matching/find-mentors', mentorMatchingController.findMentors);

module.exports = router;
