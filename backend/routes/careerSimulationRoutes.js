const express = require('express');
const router = express.Router();
const careerSimulationController = require('../controllers/careerSimulationController');

// Career routes
router.get('/careers', careerSimulationController.listCareers);
router.get('/careers/:career_id/scenarios', careerSimulationController.listScenarios);

// Scenario routes
router.post('/scenarios/generate', careerSimulationController.generateScenario);

// Simulation routes
router.post('/simulations/start', careerSimulationController.startSimulation);
router.post('/simulations/:simulation_id/submit', careerSimulationController.submitSimulation);
router.post('/simulations/:simulation_id/evaluate', careerSimulationController.evaluateSimulation);

// Freelance matching routes
router.get('/students/:student_id/freelance-matches', careerSimulationController.getFreelanceMatches);

// Role-play routes
router.post('/role-play/start', careerSimulationController.startRolePlay);
router.post('/role-play/:conversation_id/respond', careerSimulationController.respondRolePlay);
router.post('/role-play/:conversation_id/complete', careerSimulationController.completeRolePlay);

module.exports = router;
