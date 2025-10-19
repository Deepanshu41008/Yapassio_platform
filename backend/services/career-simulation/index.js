const express = require('express');
const router = express.Router();

const simulationRoutes = require('./routes');

router.use('/', simulationRoutes);

module.exports = router;
