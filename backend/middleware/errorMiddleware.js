/**
 * Enhanced Error handling middleware
 * Must be last middleware in app
 * Uses structured logging for better error tracking
 * Includes performance monitoring and security features
 */

const logger = require('../utils/logger');
const { performance } = require('perf_hooks');

// Error categories for better monitoring
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

const errorHandler = (err, req, res, next) => {
  const startTime = performance.now();
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Server Error';
  let category = ErrorCategories.SYSTEM;
  let severity = ErrorSeverity.MEDIUM;
  let context = {};

  // Determine error category and severity
  const { category: errorCategory, severity: errorSeverity, context: errorContext } = categorizeError(err, req);
  category = errorCategory;
  severity = errorSeverity;
  context = errorContext;

  // Enhanced logging with structured data
  const logData = {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('user-agent'),
    requestId: req.id || req.headers['x-request-id'],
    userId: req.user?._id,
    statusCode,
    category,
    severity,
    context,
    timestamp: new Date().toISOString(),
    duration: performance.now() - startTime
  };

  // Add security-relevant information
  if (category === ErrorCategories.SECURITY) {
    logData.securityContext = {
      suspiciousIP: detectSuspiciousActivity(req),
      rateLimitExceeded: req.rateLimit,
      authAttempts: req.authAttempts
    };
  }

  // Log based on severity
  if (severity === ErrorSeverity.CRITICAL || severity === ErrorSeverity.HIGH) {
    logger.error('🚨 Critical Error:', logData);
  } else if (statusCode >= 500) {
    logger.error('❌ Server Error:', logData);
  } else if (statusCode >= 400) {
    logger.warn('⚠️ Client Error:', logData);
  } else {
    logger.info('ℹ️ Request Error:', logData);
  }

  // Handle specific error types with enhanced logic
  const enhancedError = handleSpecificErrors(err, req);
  if (enhancedError) {
    statusCode = enhancedError.statusCode;
    message = enhancedError.message;
    category = enhancedError.category || category;
    context = { ...context, ...enhancedError.context };
  }

  // Security: Don't leak sensitive information in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    message = 'Internal server error';
  }

  // Standardized error response with enhanced information
  const response = {
    success: false,
    error: {
      message,
      statusCode,
      category,
      severity,
      timestamp: new Date().toISOString(),
      ...(req.id || req.headers['x-request-id']) && {
        requestId: req.id || req.headers['x-request-id']
      },
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err,
        context
      }),
      ...(statusCode === 429 && {
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
 * Async error wrapper for controllers with enhanced error tracking
 */
const asyncHandler = (fn) => (req, res, next) => {
  const startTime = performance.now();
  
  Promise.resolve(fn(req, res, next))
    .catch((err) => {
      // Add performance data to error
      err.duration = performance.now() - startTime;
      err.requestInfo = {
        method: req.method,
        path: req.path,
        userAgent: req.get('user-agent'),
        ip: req.ip
      };
      next(err);
    });
};

/**
 * Custom API Error class with enhanced features
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

  /**
   * Create a validation error
   */
  static validation(message, field, value) {
    return new APIError(message, 400, {
      category: ErrorCategories.VALIDATION,
      context: { field, value }
    });
  }

  /**
   * Create an authentication error
   */
  static authentication(message) {
    return new APIError(message, 401, {
      category: ErrorCategories.AUTHENTICATION
    });
  }

  /**
   * Create an authorization error
   */
  static authorization(message, requiredPermission) {
    return new APIError(message, 403, {
      category: ErrorCategories.AUTHORIZATION,
      context: { requiredPermission }
    });
  }

  /**
   * Create a not found error
   */
  static notFound(resource) {
    return new APIError(`${resource} not found`, 404, {
      category: ErrorCategories.BUSINESS_LOGIC,
      context: { resource }
    });
  }

  /**
   * Create a conflict error
   */
  static conflict(message, details) {
    return new APIError(message, 409, {
      category: ErrorCategories.BUSINESS_LOGIC,
      context: details
    });
  }

  /**
   * Create a rate limit error
   */
  static rateLimit(retryAfter) {
    return new APIError('Rate limit exceeded', 429, {
      category: ErrorCategories.SECURITY,
      security: true,
      retryAfter
    });
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  APIError,
  ErrorCategories,
  ErrorSeverity
};

  if (statusCode >= 500) {
    logger.error('Server Error:', logData);
  } else {
    logger.warn('Client Error:', logData);
  }

  // Handle specific error types

  // Mongoose duplicate key error
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    message = `${field} already exists`;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const messages = Object.values(err.errors).map(e => e.message);
    message = messages.join(', ');
  }

  // Mongoose cast error
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid ${err.path || 'ID'}`;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // File upload errors
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'FILE_TOO_LARGE') {
      statusCode = 400;
      message = 'File too large';
    } else if (err.code === 'LIMIT_FILE_COUNT') {
      statusCode = 400;
      message = 'Too many files';
    } else {
      statusCode = 400;
      message = 'File upload error';
    }
  }

  // Rate limit error
  if (err.statusCode === 429) {
    statusCode = 429;
    message = 'Too many requests, please try again later';
  }

  // Standardized error response
  const response = {
    success: false,
    error: {
      message,
      statusCode,
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

  res.status(statusCode).json(response);
};

/**
 * Async error wrapper for controllers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Custom API Error class
 */
class APIError extends Error {
  constructor(message, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = {
  errorHandler,
  asyncHandler,
  APIError
};
