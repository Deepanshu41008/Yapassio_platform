const express = require('express');
const router = express.Router();
const authRoutes = require('./routes');

router.use('/', authRoutes);

module.exports = router;
