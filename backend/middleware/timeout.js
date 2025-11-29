/**
 * Request Timeout Middleware
 * Sets timeout for requests to prevent hanging
 */

const logger = require('../utils/logger');

const requestTimeout = (timeoutMs = 30000) => {
  return (req, res, next) => {
    // Set timeout
    req.setTimeout(timeoutMs, () => {
      logger.warn(`Request timeout: ${req.method} ${req.originalUrl} - ${timeoutMs}ms`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: {
            message: 'Request timeout',
            statusCode: 504
          }
        });
      }
    });

    // Set response timeout
    res.setTimeout(timeoutMs, () => {
      logger.warn(`Response timeout: ${req.method} ${req.originalUrl} - ${timeoutMs}ms`);
      if (!res.headersSent) {
        res.status(504).json({
          success: false,
          error: {
            message: 'Response timeout',
            statusCode: 504
          }
        });
      }
    });

    next();
  };
};

module.exports = requestTimeout;

