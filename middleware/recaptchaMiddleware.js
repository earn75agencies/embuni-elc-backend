/**
 * reCAPTCHA Middleware
 * Verifies reCAPTCHA tokens for bot protection
 */

const https = require('https');
const querystring = require('querystring');

// Load reCAPTCHA configuration
const recaptchaConfig = {
  enabled: process.env.RECAPTCHA_ENABLED === 'true',
  version: process.env.RECAPTCHA_VERSION || 'v3',
  site_key: process.env.RECAPTCHA_SITE_KEY,
  secret_key: process.env.RECAPTCHA_SECRET_KEY,
  config: {
    v3: {
      score_threshold: parseFloat(process.env.RECAPTCHA_SCORE_THRESHOLD || '0.5')
    }
  }
};

/**
 * Verify reCAPTCHA v2 token
 */
const verifyRecaptchaV2 = async (token, remoteip) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('reCAPTCHA token is required'));
    }

    const secretKey = recaptchaConfig.secret_key || process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return reject(new Error('reCAPTCHA secret key not configured'));
    }

    const postData = querystring.stringify({
      secret: secretKey,
      response: token,
      remoteip: remoteip
    });

    const options = {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            resolve({
              success: true,
              challenge_ts: result.challenge_ts,
              hostname: result.hostname
            });
          } else {
            reject(new Error(`reCAPTCHA verification failed: ${result['error-codes']?.join(', ') || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error('Failed to parse reCAPTCHA response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Verify reCAPTCHA v3 token
 */
const verifyRecaptchaV3 = async (token, action, remoteip) => {
  return new Promise((resolve, reject) => {
    if (!token) {
      return reject(new Error('reCAPTCHA token is required'));
    }

    const secretKey = recaptchaConfig.secret_key || process.env.RECAPTCHA_SECRET_KEY;
    if (!secretKey) {
      return reject(new Error('reCAPTCHA secret key not configured'));
    }

    const scoreThreshold = recaptchaConfig.config?.v3?.score_threshold || 0.5;

    const postData = querystring.stringify({
      secret: secretKey,
      response: token,
      remoteip: remoteip
    });

    const options = {
      hostname: 'www.google.com',
      path: '/recaptcha/api/siteverify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.success) {
            // Verify action matches
            if (action && result.action !== action) {
              return reject(new Error('reCAPTCHA action mismatch'));
            }

            // Check score threshold
            if (result.score < scoreThreshold) {
              return reject(new Error(`reCAPTCHA score ${result.score} is below threshold ${scoreThreshold}`));
            }

            resolve({
              success: true,
              score: result.score,
              action: result.action,
              challenge_ts: result.challenge_ts,
              hostname: result.hostname
            });
          } else {
            reject(new Error(`reCAPTCHA verification failed: ${result['error-codes']?.join(', ') || 'Unknown error'}`));
          }
        } catch (error) {
          reject(new Error('Failed to parse reCAPTCHA response'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Check if route requires reCAPTCHA
 */
const requiresRecaptcha = (path, method) => {
  if (!recaptchaConfig.enabled) {
    return null;
  }

  const protectedRoutes = recaptchaConfig.protected_routes || [];

  for (const route of protectedRoutes) {
    // Simple path matching (can be enhanced with regex)
    if (path.includes(route.path.replace('/api', '')) || path === route.path) {
      if (!route.methods || route.methods.includes(method)) {
        return route;
      }
    }
  }

  return null;
};

/**
 * Check if IP is in bypass list
 */
const isBypassed = (ip) => {
  if (!recaptchaConfig.bypass?.enabled) {
    return false;
  }

  const bypassIPs = recaptchaConfig.bypass.ips || [];
  return bypassIPs.includes(ip);
};

/**
 * reCAPTCHA Middleware
 */
exports.recaptcha = (options = {}) => {
  return async (req, res, next) => {
    // Check if reCAPTCHA is enabled
    if (!recaptchaConfig.enabled && process.env.RECAPTCHA_ENABLED !== 'true') {
      return next();
    }

    // Check if route requires reCAPTCHA
    const routeConfig = requiresRecaptcha(req.path, req.method) || options;

    if (!routeConfig || !routeConfig.required) {
      return next();
    }

    // Check bypass list
    const clientIP = req.ip || req.connection.remoteAddress;
    if (isBypassed(clientIP)) {
      return next();
    }

    // Get token from request
    const token = req.body.recaptchaToken ||
                  req.body['g-recaptcha-response'] ||
                  req.headers['x-recaptcha-token'] ||
                  req.query.recaptchaToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'reCAPTCHA verification required',
        code: 'RECAPTCHA_REQUIRED',
        recaptchaSiteKey: recaptchaConfig.site_key || process.env.RECAPTCHA_SITE_KEY
      });
    }

    try {
      const version = routeConfig.version || recaptchaConfig.version || 'v3';
      const action = routeConfig.action || req.path.replace('/api/', '').replace(/\//g, '_');

      let verificationResult;

      if (version === 'v3') {
        verificationResult = await verifyRecaptchaV3(token, action, clientIP);
      } else {
        verificationResult = await verifyRecaptchaV2(token, clientIP);
      }

      // Attach verification result to request
      req.recaptcha = verificationResult;

      // Log success if enabled
      if (recaptchaConfig.logging?.log_success) {
        console.log('reCAPTCHA verification successful:', {
          path: req.path,
          score: verificationResult.score,
          action: verificationResult.action
        });
      }

      next();
    } catch (error) {
      return res.status(403).json({
        success: false,
        message: 'reCAPTCHA verification failed. Please try again.',
        code: 'RECAPTCHA_FAILED',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  };
};

/**
 * Get reCAPTCHA site key for frontend
 */
exports.getRecaptchaConfig = () => {
  return {
    enabled: recaptchaConfig.enabled || process.env.RECAPTCHA_ENABLED === 'true',
    siteKey: recaptchaConfig.site_key || process.env.RECAPTCHA_SITE_KEY,
    version: recaptchaConfig.version || process.env.RECAPTCHA_VERSION || 'v3',
    v3ScoreThreshold: recaptchaConfig.config?.v3?.score_threshold || 0.5
  };
};

/**
 * Optional reCAPTCHA (doesn't fail if missing)
 */
exports.optionalRecaptcha = (options = {}) => {
  return async (req, res, next) => {
    const token = req.body.recaptchaToken ||
                  req.body['g-recaptcha-response'] ||
                  req.headers['x-recaptcha-token'];

    if (!token) {
      // No token, continue without verification
      return next();
    }

    // Verify if token is provided
    return exports.recaptcha(options)(req, res, next);
  };
};

module.exports = exports;

