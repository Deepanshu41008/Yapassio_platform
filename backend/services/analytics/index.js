const express = require('express');
const router = express.Router();

const analyticsRoutes = require('./routes');

router.use('/', analyticsRoutes);

module.exports = router;
