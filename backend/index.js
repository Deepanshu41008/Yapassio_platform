const express = require('express');
const mongoose = require('mongoose');
const redis = require('redis');
const dotenv = require('dotenv');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const connectDB = require('./db');

dotenv.config();

const app = express();

if (process.env.NODE_ENV !== 'test' && process.env.REDIS_URL) {
    // Redis Client (optional)
    const redisClient = redis.createClient({
        url: process.env.REDIS_URL
    });

    redisClient.on('error', (err) => console.log('⚠️  Redis Client Error (continuing without cache):', err.message));
    redisClient.connect().catch(err => console.log('⚠️  Redis not available, running without cache'));
}


app.use(cors());
app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
  res.send('AI-Powered Student Platform Backend');
});

// Health check endpoint
app.get('/api/v1/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  // In a test environment, redisClient might not be defined.
  const redisStatus = process.env.NODE_ENV === 'test' ? 'disconnected' : 'connected';
  const geminiStatus = process.env.GEMINI_API_KEY ? 'configured' : 'not configured';

  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: dbStatus,
      redis: redisStatus,
      gemini_api: geminiStatus
    },
    version: '1.0.0'
  });
});

// Import routes
const mentorMatchingRoutes = require('./routes/mentorMatchingRoutes');
const examPreparationRoutes = require('./routes/examPreparationRoutes');
const careerSimulationRoutes = require('./routes/careerSimulationRoutes');

// Use routes
app.use('/api/v1', mentorMatchingRoutes);
app.use('/api/v1', examPreparationRoutes);
app.use('/api/v1', careerSimulationRoutes);

// Swagger documentation setup
const swaggerDocument = require('./swagger.json');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

module.exports = app;
