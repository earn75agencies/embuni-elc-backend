/**
 * Request Validation Middleware
 * Validates incoming requests and ensures proper formatting
 */

const { APIError } = require('./errorHandler');
const logger = require('../utils/logger');

/**
 * Validate request content type
 */
const validateContentType = (req, res, next) => {
  // Skip validation for GET, HEAD, OPTIONS, and DELETE requests
  if (['GET', 'HEAD', 'OPTIONS', 'DELETE'].includes(req.method)) {
    return next();
  }

  // Check if request has body
  if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
    const contentType = req.headers['content-type'];

    // Allow multipart/form-data for file uploads
    if (contentType && !contentType.includes('application/json') &&
        !contentType.includes('multipart/form-data') &&
        !contentType.includes('application/x-www-form-urlencoded')) {
      return next(new APIError('Content-Type must be application/json', 400));
    }
  }

  next();
};

/**
 * Validate JSON body
 */
const validateJSON = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return next(new APIError('Invalid JSON in request body', 400));
  }
  next(err);
};

/**
 * Sanitize request body
 * Remove potentially dangerous fields
 * Note: Admins still get sanitized for security, but validation is lenient
 */
const sanitizeBody = (req, res, next) => {
  if (req.body && typeof req.body === 'object') {
    // Remove fields that could be used for NoSQL injection
    const dangerousFields = ['$where', '$ne', '$gt', '$gte', '$lt', '$lte', '$in', '$nin', '$regex'];

    const sanitize = (obj) => {
      if (!obj || typeof obj !== 'object') {return;}

      for (const key in obj) {
        if (dangerousFields.includes(key)) {
          delete obj[key];
          logger.warn(`Removed dangerous field: ${key} from request body`);
        } else if (Array.isArray(obj[key])) {
          // Sanitize array items if they are objects
          obj[key].forEach((item, index) => {
            if (typeof item === 'object' && item !== null) {
              sanitize(item);
            }
          });
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          sanitize(obj[key]);
        }
      }
    };

    sanitize(req.body);
  }
  next();
};

/**
 * Add request ID for tracking
 */
const addRequestId = (req, res, next) => {
  req.id = req.headers['x-request-id'] ||
           `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  res.setHeader('X-Request-ID', req.id);
  next();
};

/**
 * Log request details (for debugging)
 */
const logRequest = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    logger.debug('Incoming request:', {
      method: req.method,
      path: req.path,
      query: req.query,
      body: req.method !== 'GET' ? req.body : undefined,
      headers: {
        'content-type': req.headers['content-type'],
        'authorization': req.headers['authorization'] ? '***' : undefined
      }
    });
  }
  next();
};

/**
 * Validate request using express-validator results
 */
const validateRequest = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg,
        value: error.value
      }))
    });
  }

  next();
};

module.exports = {
  validateContentType,
  validateJSON,
  sanitizeBody,
  addRequestId,
  logRequest,
  validateRequest
};

