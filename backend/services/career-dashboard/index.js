const express = require('express');
const router = express.Router();

const dashboardRoutes = require('./routes');

router.use('/', dashboardRoutes);

module.exports = router;
