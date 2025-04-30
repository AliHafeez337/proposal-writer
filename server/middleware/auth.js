const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

const auth = async (req, res, next) => {
  if (!process.env.JWT_SECRET) {
    logger.error('JWT_SECRET is not defined in environment variables');
    return res.status(500).json({ message: 'Server error' });
  }
  try {
    const token = req.header('Authorization').replace('Bearer ', ''); // Extract token from header

    // Decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // Attach user ID to request object
    logger.info('Token', { token }, ' verified successfully', { userId: decoded.userId });

    next();
  } catch (error) {
    logger.error('Authentication failed', { error: error.message, stack: error.stack });
    res.status(401).json({ message: 'Please authenticate' });
  }
};

module.exports = auth;