const express = require('express');
const router = express.Router();

// Import routes
const examRoutes = require('./routes/examRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const practiceRoutes = require('./routes/practiceRoutes');
const plannerRoutes = require('./routes/plannerRoutes');
const analysisRoutes = require('./routes/analysisRoutes');

// Health check for the service
router.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'exam-preparation'
  });
});

// Mount sub-routes
router.use('/', examRoutes); // Base path for general exam info
router.use('/resources', resourceRoutes);
router.use('/practice', practiceRoutes);
router.use('/planner', plannerRoutes);
router.use('/analysis', analysisRoutes);


module.exports = router;
