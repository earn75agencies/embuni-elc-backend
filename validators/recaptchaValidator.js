const axios = require('axios');
const logger = require('../utils/logger');

/**
 * reCAPTCHA validation utilities
 */

const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;
const RECAPTCHA_SITE_KEY = process.env.RECAPTCHA_SITE_KEY;
const RECAPTCHA_VERSION = process.env.RECAPTCHA_VERSION || 'v2';
const RECAPTCHA_MIN_SCORE = parseFloat(process.env.RECAPTCHA_MIN_SCORE) || 0.5;

/**
 * Verify reCAPTCHA token with Google
 */
const verifyRecaptcha = async (token, options = {}) => {
  if (!RECAPTCHA_SECRET_KEY) {
    logger.warn('reCAPTCHA secret key not configured');
    return { success: false, error: 'reCAPTCHA not configured' };
  }

  try {
    const verificationURL = 'https://www.google.com/recaptcha/api/siteverify';
    
    const params = new URLSearchParams({
      secret: RECAPTCHA_SECRET_KEY,
      response: token
    });

    // Add optional parameters
    if (options.remoteip) {
      params.append('remoteip', options.remoteip);
    }

    const response = await axios.post(verificationURL, params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      timeout: 10000 // 10 second timeout
    });

    const result = response.data;

    // Log verification attempt (without sensitive data)
    logger.info('reCAPTCHA verification attempt', {
      success: result.success,
      action: options.action,
      score: result.score,
      hostname: result.hostname,
      errorCodes: result['error-codes']
    });

    return result;
  } catch (error) {
    logger.error('reCAPTCHA verification error:', error);
    return { 
      success: false, 
      error: error.message,
      'error-codes': ['network-error']
    };
  }
};

/**
 * Validate reCAPTCHA token with additional checks
 */
const validateRecaptcha = async (token, options = {}) => {
  // Basic token validation
  if (!token) {
    return {
      success: false,
      error: 'Token is required',
      'error-codes': ['missing-input-response']
    };
  }

  if (typeof token !== 'string') {
    return {
      success: false,
      error: 'Invalid token format',
      'error-codes': ['invalid-input-response']
    };
  }

  // Token length validation (basic sanity check)
  if (token.length < 20 || token.length > 2000) {
    return {
      success: false,
      error: 'Invalid token length',
      'error-codes': ['invalid-input-response']
    };
  }

  // Verify with Google
  const result = await verifyRecaptcha(token, options);

  if (!result.success) {
    return result;
  }

  // Additional validation for reCAPTCHA v3
  if (RECAPTCHA_VERSION === 'v3' && result.score !== undefined) {
    if (result.score < RECAPTCHA_MIN_SCORE) {
      logger.warn('reCAPTCHA score too low', {
        score: result.score,
        threshold: RECAPTCHA_MIN_SCORE,
        action: options.action
      });

      return {
        success: false,
        error: `Score too low (${result.score} < ${RECAPTCHA_MIN_SCORE})`,
        score: result.score,
        'error-codes': ['low-score']
      };
    }
  }

  // Action validation for v3
  if (RECAPTCHA_VERSION === 'v3' && options.action) {
    if (result.action !== options.action) {
      logger.warn('reCAPTCHA action mismatch', {
        expected: options.action,
        received: result.action
      });

      return {
        success: false,
        error: `Action mismatch (expected: ${options.action}, received: ${result.action})`,
        action: result.action,
        'error-codes': ['action-mismatch']
      };
    }
  }

  // Hostname validation (optional)
  const allowedHostnames = process.env.RECAPTCHA_ALLOWED_HOSTNAMES?.split(',') || [];
  if (allowedHostnames.length > 0 && result.hostname) {
    if (!allowedHostnames.includes(result.hostname)) {
      logger.warn('reCAPTCHA hostname not allowed', {
        hostname: result.hostname,
        allowed: allowedHostnames
      });

      return {
        success: false,
        error: `Hostname not allowed: ${result.hostname}`,
        hostname: result.hostname,
        'error-codes': ['invalid-hostname']
      };
    }
  }

  return result;
};

/**
 * Get reCAPTCHA configuration for frontend
 */
const getRecaptchaConfig = () => {
  return {
    enabled: !!RECAPTCHA_SITE_KEY,
    siteKey: RECAPTCHA_SITE_KEY,
    version: RECAPTCHA_VERSION,
    minScore: RECAPTCHA_MIN_SCORE,
    isConfigured: !!(RECAPTCHA_SITE_KEY && RECAPTCHA_SECRET_KEY)
  };
};

/**
 * Middleware to validate reCAPTCHA in requests
 */
const requireRecaptcha = (options = {}) => {
  return async (req, res, next) => {
    try {
      const token = req.body['g-recaptcha-response'] || 
                   req.body.recaptchaToken || 
                   req.headers['x-recaptcha-token'];

      if (!token) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA token is required',
          'error-codes': ['missing-input-response']
        });
      }

      const result = await validateRecaptcha(token, {
        action: options.action || 'verify',
        remoteip: req.ip
      });

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: 'reCAPTCHA verification failed',
          error: result.error,
          'error-codes': result['error-codes']
        });
      }

      // Attach verification result to request for potential use
      req.recaptcha = result;
      next();
    } catch (error) {
      logger.error('reCAPTCHA middleware error:', error);
      return res.status(500).json({
        success: false,
        message: 'reCAPTCHA verification error'
      });
    }
  };
};

/**
 * Check if reCAPTCHA is properly configured
 */
const isRecaptchaConfigured = () => {
  return !!(RECAPTCHA_SITE_KEY && RECAPTCHA_SECRET_KEY);
};

/**
 * Get reCAPTCHA error messages
 */
const getRecaptchaErrorMessage = (errorCode) => {
  const errorMessages = {
    'missing-input-secret': 'The secret parameter is missing.',
    'invalid-input-secret': 'The secret parameter is invalid or malformed.',
    'missing-input-response': 'The response parameter is missing.',
    'invalid-input-response': 'The response parameter is invalid or malformed.',
    'bad-request': 'The request is invalid or malformed.',
    'timeout-or-duplicate': 'The response is no longer valid: either is too old or has been used previously.',
    'low-score': 'The activity score is too low.',
    'action-mismatch': 'The action name for the token is invalid.',
    'invalid-hostname': 'The hostname is not allowed.',
    'network-error': 'Network error occurred while verifying reCAPTCHA.'
  };

  return errorMessages[errorCode] || 'Unknown reCAPTCHA error occurred.';
};

module.exports = {
  validateRecaptcha,
  verifyRecaptcha,
  getRecaptchaConfig,
  requireRecaptcha,
  isRecaptchaConfigured,
  getRecaptchaErrorMessage
};