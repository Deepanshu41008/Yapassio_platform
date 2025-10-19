const express = require('express');
const router = express.Router();

const opportunitiesRoutes = require('./routes');

router.use('/', opportunitiesRoutes);

module.exports = router;
