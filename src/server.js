require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/database');

/**
 * Server Bootstrap
 * 
 * Initializes the server and connects to the database.
 */

// Get port from environment or default to 5000
const PORT = process.env.PORT || 5000;

// Validate environment variables
const validateEnv = () => {
  const required = ['MONGO_URI', 'JWT_SECRET', 'PAYSTACK_SECRET_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    console.error(' Missing required environment variables:', missing.join(', '));
    console.error('Please check your .env file');
    process.exit(1);
  }
  
  // Validate Paystack key format
  const paystackKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (paystackKey && !paystackKey.startsWith('sk_test_') && !paystackKey.startsWith('sk_live_')) {
    console.warn(' Warning: PAYSTACK_SECRET_KEY should start with sk_test_ or sk_live_');
    console.warn('   Current key starts with:', paystackKey.substring(0, 10) + '...');
  }
  
  console.log('Environment variables validated');
};

// Validate environment before starting
validateEnv();

// Connect to MongoDB
connectDB();

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error(' Uncaught Exception:', err.message);
  process.exit(1);
});
