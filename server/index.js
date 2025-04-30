require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./db/connect');
const authRoutes = require('./routes/auth');
const proposalRoutes = require('./routes/proposals');
const aiRoutes = require('./routes/ai');
const financialRoutes = require('./routes/financial');
const pricingRoutes = require('./routes/pricing');
const requestLogger = require('./middleware/requestLogger');

const app = express();

process.on('uncaughtException', (error) => {
  logger.error('Uncaught Exception', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection', reason);
});

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Middleware
app.use(requestLogger);
app.use(cors({
  origin: 'http://localhost:3000', // Or '*' for testing
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(bodyParser.json());
app.use('/api/auth', authRoutes);
app.use('/api/proposals', proposalRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/financial', financialRoutes);
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