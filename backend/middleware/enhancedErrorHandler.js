/**
 * Enhanced Error Handler
 * Comprehensive error handling with logging and reporting
 */

const { performanceMonitor } = require('../utils/performanceMonitor');
const logger = require('../utils/logger');

class EnhancedErrorHandler {
  constructor() {
    this.errorCounts = new Map();
    this.errorDetails = new Map();
    this.criticalErrors = [];
  }

  // Handle different types of errors
  handleError(error, req, res, next) {
    const errorId = this.generateErrorId();
    const errorInfo = this.categorizeError(error);

    // Log error details
    this.logError(error, errorInfo, req, errorId);

    // Track error metrics
    this.trackError(errorInfo, req, errorId);

    // Send appropriate response
    this.sendErrorResponse(errorInfo, req, res, errorId);
  }

  // Generate unique error ID
  generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Categorize error type
  categorizeError(error) {
    const errorTypes = {
      // Validation errors
      ValidationError: {
        type: 'validation',
        statusCode: 400,
        message: 'Validation failed',
        isClientError: true,
        shouldRetry: false
      },

      // Authentication errors
      AuthenticationError: {
        type: 'authentication',
        statusCode: 401,
        message: 'Authentication failed',
        isClientError: true,
        shouldRetry: false
      },

      // Authorization errors
      AuthorizationError: {
        type: 'authorization',
        statusCode: 403,
        message: 'Access denied',
        isClientError: true,
        shouldRetry: false
      },

      // Not found errors
      NotFoundError: {
        type: 'not_found',
        statusCode: 404,
        message: 'Resource not found',
        isClientError: true,
        shouldRetry: false
      },

      // Conflict errors
      ConflictError: {
        type: 'conflict',
        statusCode: 409,
        message: 'Resource conflict',
        isClientError: true,
        shouldRetry: false
      },

      // Rate limit errors
      RateLimitError: {
        type: 'rate_limit',
        statusCode: 429,
        message: 'Too many requests',
        isClientError: true,
        shouldRetry: true,
        retryAfter: 60
      },

      // Database errors
      MongoError: {
        type: 'database',
        statusCode: 500,
        message: 'Database operation failed',
        isClientError: false,
        shouldRetry: true
      },

      // Network errors
      NetworkError: {
        type: 'network',
        statusCode: 503,
        message: 'Network error occurred',
        isClientError: false,
        shouldRetry: true
      },

      // Timeout errors
      TimeoutError: {
        type: 'timeout',
        statusCode: 408,
        message: 'Request timeout',
        isClientError: false,
        shouldRetry: true
      },

      // Default error
      default: {
        type: 'internal',
        statusCode: 500,
        message: 'Internal server error',
        isClientError: false,
        shouldRetry: false
      }
    };

    // Determine error type based on error constructor name or message
    let errorType = errorTypes.default;

    if (error.name && errorTypes[error.name]) {
      errorType = errorTypes[error.name];
    } else if (error.code) {
      // Handle MongoDB error codes
      switch (error.code) {
      case 11000:
        errorType = {
          type: 'duplicate',
          statusCode: 409,
          message: 'Duplicate resource',
          isClientError: true,
          shouldRetry: false
        };
        break;
      case 'LIMIT_FILE_SIZE':
        errorType = {
          type: 'file_too_large',
          statusCode: 413,
          message: 'File too large',
          isClientError: true,
          shouldRetry: false
        };
        break;
      default:
        errorType = errorTypes.MongoError;
      }
    }

    return {
      ...errorType,
      originalError: error,
      originalMessage: error.message,
      stack: error.stack
    };
  }

  // Log error details
  logError(error, errorInfo, req, errorId) {
    const logData = {
      errorId,
      type: errorInfo.type,
      message: errorInfo.originalMessage,
      statusCode: errorInfo.statusCode,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('User-Agent'),
      userId: req.user?.id || 'anonymous',
      timestamp: new Date().toISOString(),
      stack: errorInfo.stack,
      body: this.sanitizeRequestBody(req.body),
      query: req.query,
      params: req.params
    };

    // Log based on error severity
    if (errorInfo.statusCode >= 500) {
      logger.error('Server Error:', logData);
    } else if (errorInfo.statusCode >= 400) {
      logger.warn('Client Error:', logData);
    } else {
      logger.info('Request Error:', logData);
    }

    // Store error details for analysis
    this.errorDetails.set(errorId, logData);

    // Track error counts
    const errorKey = `${errorInfo.type}:${req.method}:${req.path}`;
    this.errorCounts.set(errorKey, (this.errorCounts.get(errorKey) || 0) + 1);

    // Store critical errors
    if (errorInfo.statusCode >= 500) {
      this.criticalErrors.push({
        errorId,
        ...logData,
        timestamp: Date.now()
      });

      // Keep only last 100 critical errors
      if (this.criticalErrors.length > 100) {
        this.criticalErrors = this.criticalErrors.slice(-100);
      }
    }
  }

  // Track error metrics
  trackError(errorInfo, req, errorId) {
    // Track in performance monitor
    if (performanceMonitor) {
      performanceMonitor.recordMetric('error', 1, {
        type: errorInfo.type,
        statusCode: errorInfo.statusCode,
        path: req.path,
        method: req.method
      });
    }

    // Emit error event for monitoring
    process.emit('error', {
      errorId,
      type: errorInfo.type,
      statusCode: errorInfo.statusCode,
      path: req.path,
      method: req.method,
      timestamp: Date.now()
    });
  }

  // Send error response
  sendErrorResponse(errorInfo, req, res, errorId) {
    const isDevelopment = process.env.NODE_ENV === 'development';

    // Base response
    const response = {
      success: false,
      error: {
        id: errorId,
        type: errorInfo.type,
        message: errorInfo.message,
        statusCode: errorInfo.statusCode,
        shouldRetry: errorInfo.shouldRetry
      }
    };

    // Add retry information
    if (errorInfo.shouldRetry && errorInfo.retryAfter) {
      response.error.retryAfter = errorInfo.retryAfter;
      res.set('Retry-After', errorInfo.retryAfter);
    }

    // Add detailed information in development
    if (isDevelopment) {
      response.error.details = {
        originalMessage: errorInfo.originalMessage,
        stack: errorInfo.stack,
        body: this.sanitizeRequestBody(req.body),
        query: req.query,
        params: req.params
      };
    }

    // Add rate limit headers if applicable
    if (errorInfo.type === 'rate_limit') {
      res.set({
        'X-RateLimit-Limit': '100',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(Date.now() + errorInfo.retryAfter * 1000).toISOString()
      });
    }

    // Send response
    res.status(errorInfo.statusCode).json(response);
  }

  // Sanitize request body for logging
  sanitizeRequestBody(body) {
    if (!body || typeof body !== 'object') {return body;}

    const sensitiveFields = ['password', 'token', 'secret', 'key', 'auth'];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = '[REDACTED]';
      }
    }

    return sanitized;
  }

  // Get error statistics
  getErrorStats() {
    const stats = {
      totalErrors: Array.from(this.errorCounts.values()).reduce((sum, count) => sum + count, 0),
      errorTypes: {},
      criticalErrors: this.criticalErrors.length,
      recentErrors: this.criticalErrors.slice(-10)
    };

    // Group errors by type
    for (const [key, count] of this.errorCounts.entries()) {
      const [type] = key.split(':');
      stats.errorTypes[type] = (stats.errorTypes[type] || 0) + count;
    }

    return stats;
  }

  // Get error details by ID
  getErrorDetails(errorId) {
    return this.errorDetails.get(errorId);
  }

  // Clear old errors
  clearOldErrors(maxAge = 24 * 60 * 60 * 1000) { // 24 hours
    const cutoff = Date.now() - maxAge;

    // Clear critical errors
    this.criticalErrors = this.criticalErrors.filter(error => error.timestamp > cutoff);

    // Clear error details
    for (const [errorId, details] of this.errorDetails.entries()) {
      if (new Date(details.timestamp).getTime() < cutoff) {
        this.errorDetails.delete(errorId);
      }
    }

    console.log('🧹 Old error details cleared');
  }
}

// Create singleton instance
const errorHandler = new EnhancedErrorHandler();

// Express middleware
const handleErrors = (error, req, res, next) => {
  errorHandler.handleError(error, req, res, next);
};

// Async error wrapper
const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Custom error classes
class ValidationError extends Error {
  constructor(message, details = null) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }
}

class AuthenticationError extends Error {
  constructor(message = 'Authentication failed') {
    super(message);
    this.name = 'AuthenticationError';
  }
}

class AuthorizationError extends Error {
  constructor(message = 'Access denied') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

class NotFoundError extends Error {
  constructor(message = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ConflictError extends Error {
  constructor(message = 'Resource conflict') {
    super(message);
    this.name = 'ConflictError';
  }
}

class RateLimitError extends Error {
  constructor(message = 'Too many requests', retryAfter = 60) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfter = retryAfter;
  }
}

// Clean up old errors periodically
setInterval(() => {
  errorHandler.clearOldErrors();
}, 60 * 60 * 1000); // Every hour

module.exports = {
  errorHandler,
  handleErrors,
  asyncHandler,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ConflictError,
  RateLimitError
};
