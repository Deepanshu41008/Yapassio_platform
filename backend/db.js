const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async (uri) => {
  try {
    const mongoUri = uri || process.env.MONGODB_URI;
    await mongoose.connect(mongoUri, {
      dbName: process.env.MONGODB_DB_NAME,
      serverSelectionTimeoutMS: 5000,
      autoIndex: true
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    throw err;
  }
};

module.exports = connectDB;
