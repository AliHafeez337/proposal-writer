const mongoose = require('mongoose');
const logger = require('../utils/logger');
require('dotenv').config();


// MongoDB connection function
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('MongoDB connected successfully');
  } catch (error) {
    logger.error('MongoDB connection error', { error: error.message, stack: error.stack });
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;