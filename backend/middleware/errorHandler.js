/**
 * Enhanced Error Handler Middleware
 * Standardized error responses and logging
 */

const logger = require('../utils/logger');

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;
  error.statusCode = err.statusCode || 500;

  // Log error
  const logData = {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id || req.headers['x-request-id'],
    userId: req.user?._id,
    statusCode: error.statusCode
  };

  if (error.statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else {
    logger.warn('Client Error:', logData);
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    const message = `${field} already exists`;
    error = new APIError(message, 400);
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map(e => e.message);
    const message = messages.join(', ');
    error = new APIError(message, 400);
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    const message = `Invalid ${err.path || 'ID'}`;
    error = new APIError(message, 400);
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = new APIError('Invalid token', 401);
  }

  if (err.name === 'TokenExpiredError') {
    error = new APIError('Token expired', 401);
  }

  // File upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      error = new APIError('File too large', 400);
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      error = new APIError('Too many files', 400);
    } else {
      error = new APIError('File upload error', 400);
    }
  }

  // Rate limit error
  if (err.statusCode === 429) {
    error = new APIError('Too many requests, please try again later', 429);
  }

  // Standardized error response
  const response = {
    success: false,
    error: {
      message: error.message || 'Server Error',
      statusCode: error.statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  };

  // Add request ID if available
  if (req.id || req.headers['x-request-id']) {
    response.requestId = req.id || req.headers['x-request-id'];
  }

  res.status(error.statusCode).json(response);
};

/**
 * Async handler wrapper
 */
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * 404 Not Found handler
 */
const notFound = (req, res, next) => {
  const error = new APIError(`Route ${req.originalUrl} not found`, 404);
  next(error);
};

module.exports = {
  errorHandler,
  asyncHandler,
  APIError,
  notFound
};

