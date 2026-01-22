/**
 * Error Handler Utility
 * 
 * Provides consistent error response formatting across the application.
 */

/**
 * Format Error Response
 * 
 * Creates a standardized error response object.
 * 
 * @param {string} message - Error message
 * @param {number} [statusCode=500] - HTTP status code
 * @param {Object} [errors=null] - Additional error details (optional)
 * @returns {Object} Formatted error response
 */
const formatError = (message, statusCode = 500, errors = null) => {
  const errorResponse = {
    success: false,
    message,
  };

  // Add validation errors if provided
  if (errors) {
    errorResponse.errors = errors;
  }

  return { errorResponse, statusCode };
};

/**
 * Handle Mongoose Validation Errors
 * 
 * Extracts and formats Mongoose validation errors into a readable format.
 * 
 * @param {Error} error - Mongoose validation error
 * @returns {Object} Formatted error response
 */
const handleValidationError = (error) => {
  const errors = {};

  // Extract field-specific errors
  if (error.errors) {
    Object.keys(error.errors).forEach((key) => {
      errors[key] = error.errors[key].message;
    });
  }

  return formatError('Validation error', 400, errors);
};

/**
 * Handle Mongoose Duplicate Key Error
 * 
 * Formats duplicate key errors (e.g., duplicate email).
 * 
 * @param {Error} error - Mongoose duplicate key error
 * @returns {Object} Formatted error response
 */
const handleDuplicateKeyError = (error) => {
  const field = Object.keys(error.keyPattern)[0];
  return formatError(`${field} already exists. Please use a different ${field}.`, 409);
};

/**
 * Global Error Handler
 * 
 * Centralized error handling middleware for Express.
 * Should be used as the last middleware in app.js.
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const globalErrorHandler = (err, req, res, next) => {
  let errorResponse;
  let statusCode = 500;

  // Handle specific error types
  if (err.name === 'ValidationError') {
    const result = handleValidationError(err);
    errorResponse = result.errorResponse;
    statusCode = result.statusCode;
  } else if (err.code === 11000) {
    // Mongoose duplicate key error
    const result = handleDuplicateKeyError(err);
    errorResponse = result.errorResponse;
    statusCode = result.statusCode;
  } else if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    errorResponse = formatError('Invalid or expired token', 401).errorResponse;
    statusCode = 401;
  } else {
    // Generic error
    errorResponse = formatError(
      err.message || 'Internal server error',
      err.statusCode || 500
    ).errorResponse;

    // Log unexpected errors in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error:', err);
    }
  }

  res.status(statusCode).json(errorResponse);
};

module.exports = {
  formatError,
  handleValidationError,
  handleDuplicateKeyError,
  globalErrorHandler,
};
