const express = require('express');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

// Import error handler
const { globalErrorHandler } = require('./utils/errorHandler');

/**
 * Express Application Setup
 * 
 * Configures the Express app with middleware and routes.
 */
const app = express();

// Middleware: Parse JSON bodies
app.use(express.json());

// Middleware: Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true }));

// Middleware: Request logging (simple)
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/payments', paymentRoutes);

// 404 Handler: Catch all undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler: Must be last middleware
app.use(globalErrorHandler);

module.exports = app;
