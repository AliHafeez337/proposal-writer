const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const auth = require('../middleware/auth');
const logger = require('../utils/logger');
const router = express.Router();

// Register
router.post('/register', async (req, res) => {
  logger.info('User registration attempt', { email: req.body.email });
  try {
    const { email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn('User already exists', { email });
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const user = new User({ email, password });
    await user.save();
    logger.info('User registered successfully', { userId: user._id, email });

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.status(201).json({ token });
  } catch (error) {
    logger.error('User registration failed', { error: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Login
router.post('/login', async (req, res) => {
  logger.info('User login attempt', { email: req.body.email });
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn('Invalid credentials - user not found', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      logger.warn('Invalid credentials - password mismatch', { email });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    logger.info('User logged in successfully', { userId: user._id, email });

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1d'
    });

    res.json({ user, token });
  } catch (error) {
    logger.error('User login failed', { error: error.message, stack: error.stack, email: req.body.email });
    res.status(500).json({ message: 'Something went wrong' });
  }
});

// Login
router.get('/me', auth, async (req, res) => {
  logger.info(`GET /auth/me initiated by user ${req.userId}`);

  try {
    const user = await User.findById(req.userId);

    if (!user) {
      logger.warn(`User not found for ID: ${req.userId}`);
      return res.status(404).json({ error: 'User not found' });
    }

    logger.info(`Successfully fetched user data for ${user.email}`);
    res.json(user);
  } catch (error) {
    logger.error(`Error in GET /auth/me for user ${req.userId}:`, {
      error: error.message,
      stack: error.stack
    });
    res.status(500).json({ error: 'Failed to fetch user data' });
  }
});

router.post('/logout', auth, (req, res) => {
  res.json({ message: 'Logged out successfully' });
});

module.exports = router;