/**
 * Error handling middleware with structured logging
 */

const logger = require('../utils/logger');

// Error categories
const ErrorCategories = {
  VALIDATION: 'validation',
  AUTHENTICATION: 'authentication',
  AUTHORIZATION: 'authorization',
  DATABASE: 'database',
  NETWORK: 'network',
  BUSINESS_LOGIC: 'business_logic',
  SYSTEM: 'system',
  SECURITY: 'security'
};

// Error severity levels
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Main error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let context = {};

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation Error';
    context = { fields: Object.keys(err.errors || {}) };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (err.code === 11000) {
    // MongoDB duplicate key
    statusCode = 409;
    message = 'Duplicate key error';
    const field = Object.keys(err.keyPattern || {})[0];
    if (field) {
      context = { field, value: err.keyValue?.[field] };
    }
  }

  // Log the error
  const logData = {
    statusCode,
    message,
    path: req.path,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };

  // Log based on status code
  if (statusCode >= 500) {
    logger.error('❌ Server Error:', logData);
  } else if (statusCode >= 400) {
    logger.warn('⚠️ Client Error:', logData);
  } else {
    logger.info('ℹ️ Request Error:', logData);
  }

  // Security: Don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Standardized error response
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
        retryAfter: err.retryAfter || 'Please try again later'
      })
    }
  };

  // Add rate limit information if applicable
  if (req.rateLimit) {
    response.error.rateLimit = {
      limit: req.rateLimit.limit,
      current: req.rateLimit.current,
      remaining: req.rateLimit.remaining,
      resetTime: req.rateLimit.resetTime
    };
  }

  // Add request ID if available
  if (req.id || req.headers['x-request-id']) {
    response.requestId = req.id || req.headers['x-request-id'];
  }

  // Add security headers for error responses
  res.set({
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  });

  res.status(statusCode).json(response);
};

/**
 * Categorize errors for better monitoring and alerting
 */
function categorizeError(err, req) {
  let category = ErrorCategories.SYSTEM;
  let severity = ErrorSeverity.MEDIUM;
  let context = {};
  const statusCode = err.statusCode || 500;

  // Authentication errors
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    category = ErrorCategories.AUTHENTICATION;
    severity = ErrorSeverity.MEDIUM;
    context = { tokenType: 'JWT', reason: err.name };
  }

  // Authorization errors
  if (statusCode === 403) {
    category = ErrorCategories.AUTHORIZATION;
    severity = ErrorSeverity.HIGH;
    context = { requiredPermission: err.requiredPermission };
  }

  // Validation errors
  if (err.name === 'ValidationError' || statusCode === 400) {
    category = ErrorCategories.VALIDATION;
    severity = ErrorSeverity.LOW;
    context = { 
      validationErrors: err.errors || [],
      field: err.field 
    };
  }

  // Database errors
  if (err.name === 'MongoError' || err.name === 'MongooseError') {
    category = ErrorCategories.DATABASE;
    severity = ErrorSeverity.HIGH;
    context = { 
      database: 'mongodb',
      operation: err.operation 
    };
  }

  // Network errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ETIMEDOUT') {
    category = ErrorCategories.NETWORK;
    severity = ErrorSeverity.HIGH;
    context = { networkError: err.code };
  }

  // Security errors
  if (err.code === 'RATE_LIMIT_EXCEEDED' || err.security) {
    category = ErrorCategories.SECURITY;
    severity = ErrorSeverity.CRITICAL;
    context = { 
      securityEvent: true,
      type: err.securityType 
    };
  }

  return { category, severity, context };
}

/**
 * Handle specific error types with enhanced logic
 */
function handleSpecificErrors(err, req) {
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return {
      statusCode: 409,
      message: `${field} already exists`,
      category: ErrorCategories.VALIDATION,
      context: { duplicateField: field, value: err.keyValue[field] }
    };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors || {}).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return {
      statusCode: 400,
      message: 'Validation failed',
      category: ErrorCategories.VALIDATION,
      context: { validationErrors: messages }
    };
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid ${err.path || 'ID'} format`,
      category: ErrorCategories.VALIDATION,
      context: { field: err.path, value: err.value }
    };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return {
      statusCode: 401,
      message: 'Invalid authentication token',
      category: ErrorCategories.AUTHENTICATION,
      context: { tokenError: 'invalid' }
    };
  }

  if (err.name === 'TokenExpiredError') {
    return {
      statusCode: 401,
      message: 'Authentication token expired',
      category: ErrorCategories.AUTHENTICATION,
      context: { tokenError: 'expired', expiredAt: err.expiredAt }
    };
  }

  // File upload errors
  if (err.name === 'MulterError') {
    let message = 'File upload error';
    let context = {};
    
    switch (err.code) {
      case 'LIMIT_FILE_SIZE':
      case 'FILE_TOO_LARGE':
        message = 'File too large';
        context = { limit: err.limit, field: err.field };
        break;
      case 'LIMIT_FILE_COUNT':
        message = 'Too many files';
        context = { limit: err.limit, field: err.field };
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        message = 'Unexpected file field';
        context = { field: err.field };
        break;
      default:
        context = { multerError: err.code };
    }
    
    return {
      statusCode: 400,
      message,
      category: ErrorCategories.VALIDATION,
      context
    };
  }

  // Rate limit error
  if (err.statusCode === 429 || err.code === 'RATE_LIMIT_EXCEEDED') {
    return {
      statusCode: 429,
      message: 'Too many requests, please try again later',
      category: ErrorCategories.SECURITY,
      context: { 
        retryAfter: err.resetTime || err.retryAfter,
        limit: err.limit 
      }
    };
  }

  // Business logic errors
  if (err.businessLogic) {
    return {
      statusCode: err.statusCode || 400,
      message: err.message,
      category: ErrorCategories.BUSINESS_LOGIC,
      context: err.context || {}
    };
  }

  return null;
}

/**
 * Detect suspicious activity for security monitoring
 */
function detectSuspiciousActivity(req) {
  const suspicious = [];
  
  // Check for common attack patterns
  const userAgent = req.get('user-agent') || '';
  const suspiciousAgents = ['sqlmap', 'nikto', 'nmap', 'masscan'];
  if (suspiciousAgents.some(agent => userAgent.toLowerCase().includes(agent))) {
    suspicious.push('suspicious_user_agent');
  }

  // Check for unusual request patterns
  if (req.path.includes('../') || req.path.includes('..\\')) {
    suspicious.push('path_traversal_attempt');
  }

  // Check for SQL injection patterns
  const sqlPatterns = ['union select', 'drop table', 'insert into', 'delete from'];
  const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
  if (sqlPatterns.some(pattern => queryString.toLowerCase().includes(pattern))) {
    suspicious.push('sql_injection_attempt');
  }

  return suspicious.length > 0 ? suspicious : null;
}

/**
 * Async handler wrapper for controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  return Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500, options = {}) {
    super(message);
    this.statusCode = statusCode;
    this.businessLogic = options.businessLogic || false;
    this.category = options.category || ErrorCategories.SYSTEM;
    this.context = options.context || {};
    this.security = options.security || false;
    this.retryAfter = options.retryAfter;
    Error.captureStackTrace(this, this.constructor);
  }

  static validation(message, field, value) {
    return new APIError(message, 400, {
      category: ErrorCategories.VALIDATION,
      context: { field, value }
    });
  }

  static unauthorized(message = 'Unauthorized') {
    return new APIError(message, 401, {
      category: ErrorCategories.AUTHENTICATION
    });
  }

  static forbidden(message = 'Forbidden') {
    return new APIError(message, 403, {
      category: ErrorCategories.AUTHORIZATION
    });
  }

  static notFound(message = 'Not Found') {
    return new APIError(message, 404);
  }

  static conflict(message = 'Conflict') {
    return new APIError(message, 409);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  APIError,
  ErrorCategories,
  ErrorSeverity,
  categorizeError,
  handleSpecificErrors,
  detectSuspiciousActivity
};