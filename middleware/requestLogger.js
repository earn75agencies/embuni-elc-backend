/**
 * Request/Response Logging Middleware
 * Logs all incoming requests and responses
 */

const logger = require('../utils/logger');

const requestLogger = (req, res, next) => {
  const startTime = Date.now();
  const requestId = req.id || req.headers['x-request-id'] || 'unknown';

  // Log request
  logger.http(`${req.method} ${req.originalUrl} - IP: ${req.ip} - RequestID: ${requestId}`);

  // Log request body for non-GET requests (sanitized)
  if (req.method !== 'GET' && req.body && Object.keys(req.body).length > 0) {
    const sanitizedBody = { ...req.body };
    // Remove sensitive fields
    if (sanitizedBody.password) {sanitizedBody.password = '[REDACTED]';}
    if (sanitizedBody.token) {sanitizedBody.token = '[REDACTED]';}
    if (sanitizedBody.secret) {sanitizedBody.secret = '[REDACTED]';}

    logger.debug(`Request body: ${JSON.stringify(sanitizedBody)}`);
  }

  // Capture response
  const originalSend = res.send;
  res.send = function (data) {
    const duration = Date.now() - startTime;

    // Log response
    logger.http(
      `${req.method} ${req.originalUrl} - Status: ${res.statusCode} - Duration: ${duration}ms - RequestID: ${requestId}`
    );

    // Log slow requests
    if (duration > 1000) {
      logger.warn(`Slow request detected: ${req.method} ${req.originalUrl} took ${duration}ms`);
    }

    // Log errors
    if (res.statusCode >= 400) {
      logger.error(
        `Error response: ${req.method} ${req.originalUrl} - Status: ${res.statusCode} - RequestID: ${requestId}`
      );
    }

    return originalSend.call(this, data);
  };

  next();
};

module.exports = requestLogger;

