const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const mentorRoutes = require('./routes/mentorRoutes');
const communityRoutes = require('./routes/communityRoutes');
const matchingEngine = require('./engine/matchingEngine');

dotenv.config();

const app = express();
const PORT = process.env.MENTOR_SERVICE_PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/mentor_matching', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB - Mentor Matching Service');
});

// Routes
app.use('/api/mentors', mentorRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/matching', matchingEngine);

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    service: 'mentor-matching',
    timestamp: new Date().toISOString() 
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
  });
});

// Start server only if this file is run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Mentor Matching Service running on port ${PORT}`);
  });
}

module.exports = app;
