const winston = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');

const { combine, timestamp, printf, colorize, errors } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',  // Set log level based on environment
  format: combine( // Combine multiple formats
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    errors({ stack: true }),
    colorize(),
    logFormat
  ),
  transports: [ 
    // Console (always enabled)
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: 'logs/application-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      level: 'info' // Only log info and above to file
    }),
    new DailyRotateFile({
      filename: 'logs/errors-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      level: 'error' // Only errors
    })
  ],
  exceptionHandlers: [ // Handle uncaught exceptions
    new winston.transports.File({ filename: 'logs/exceptions.log' })
  ]
});

// Handle promise rejections
logger.rejections.handle( //  Handle promise rejections
  new winston.transports.File({ filename: 'logs/rejections.log' })
);

module.exports = logger;