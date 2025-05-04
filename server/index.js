// server/index.js

// Import necessary modules
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db/connect');
const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const aiRoutes = require('./routes/ai');
// const financialRoutes = require('./routes/financial');
const pricingRoutes = require('./routes/pricing');
const requestLogger = require('./middleware/requestLogger');
const logger = require('./utils/logger');

// Initialize express app
const app = express();

// Catch unhandled promise rejections and uncaught exceptions
process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});

// Middlewares
app.use(requestLogger);
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});
// Configure CORS
app.use(cors({
  origin: [
    'http://localhost:5173', // Local frontend
    'https://proposal-writer-two.vercel.app/' // Production frontend
  ],
  credentials: true, // Required for cookies/sessions
  optionsSuccessStatus: 200 // Some legacy browsers choke on 204
}));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/ai', aiRoutes);
// app.use('/api/financial', financialRoutes);
app.use('/api/pricing', pricingRoutes);

// Add a protected test route
app.get('/api/protected', require('./middleware/auth'), (req, res) => {
  res.json({ message: 'This is protected data', userId: req.userId });
});

// Routes
app.get('/', (req, res) => {
  res.send('Business Proposal Generator API');
});

// Serve uploaded files statically
app.use('/uploads', express.static('uploads'));

// Connect to DB and start server
const start = async () => {
  try {
    await connectDB();
    app.listen(process.env.PORT, () => {
      console.log(`Server running on port ${process.env.PORT}`);
    });
  } catch (error) {
    console.error('Server startup error:', error);
  }
};

start();