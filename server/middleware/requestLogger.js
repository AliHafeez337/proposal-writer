const logger = require('../utils/logger');

module.exports = (req, res, next) => {
  const start = Date.now();

  // Log the request details
  res.on('finish', () => {
    const duration = Date.now() - start;
    logger.http(`${req.method} ${req.originalUrl}`, {
      status: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      user: req.user?._id
    });
  });

  next();
};