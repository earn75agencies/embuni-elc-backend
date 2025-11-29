/**
 * Environment Variable Validator
 * Validates all required environment variables on startup
 * Enhanced with security checks and performance monitoring
 */

const logger = require('./logger');
const crypto = require('crypto');

const requiredEnvVars = {
  // Critical
  MONGO_URI: {
    required: true,
    description: 'MongoDB connection string',
    validate: (value) => {
      if (!value || !value.startsWith('mongodb')) {
        throw new Error('MONGO_URI must be a valid MongoDB connection string');
      }
      // Check for common security issues in connection string
      if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
        throw new Error('MONGO_URI should not use localhost in production');
      }
    }
  },
  JWT_SECRET: {
    required: true,
    description: 'JWT secret key for token signing',
    validate: (value) => {
      if (!value || value.length < 32) {
        throw new Error('JWT_SECRET must be at least 32 characters long');
      }
      if (value === 'your-secret-key' || value === 'change-this-secret') {
        throw new Error('JWT_SECRET must be changed from default value');
      }
      // Check entropy for weak secrets
      const entropy = calculateEntropy(value);
      if (entropy < 3.0) {
        throw new Error('JWT_SECRET appears to be too weak (low entropy)');
      }
    }
  },
  SESSION_SECRET: {
    required: true,
    description: 'Session secret for express-session',
    validate: (value) => {
      if (!value || value.length < 32) {
        throw new Error('SESSION_SECRET must be at least 32 characters long');
      }
      if (value === 'elp-session-secret') {
        throw new Error('SESSION_SECRET must be changed from default value');
      }
      const entropy = calculateEntropy(value);
      if (entropy < 3.0) {
        throw new Error('SESSION_SECRET appears to be too weak (low entropy)');
      }
    }
  },
  // Optional but recommended
  FRONTEND_URL: {
    required: false,
    description: 'Frontend URL for CORS',
    default: 'https://embuni-elc-frontend.vercel.app',
    validate: (value) => {
      if (value && !value.startsWith('http')) {
        throw new Error('FRONTEND_URL must be a valid URL starting with http/https');
      }
    }
  },
  PORT: {
    required: false,
    description: 'Server port',
    default: '5000',
    validate: (value) => {
      const port = parseInt(value);
      if (isNaN(port) || port < 1 || port > 65535) {
        throw new Error('PORT must be a valid port number (1-65535)');
      }
      // Warn about common ports
      if ([22, 80, 443, 3306, 5432].includes(port)) {
        logger.warn(`PORT ${port} is commonly used by other services`);
      }
    }
  },
  NODE_ENV: {
    required: false,
    description: 'Node environment',
    default: 'development',
    validate: (value) => {
      const validEnvs = ['development', 'production', 'test'];
      if (!validEnvs.includes(value)) {
        throw new Error(`NODE_ENV must be one of: ${validEnvs.join(', ')}`);
      }
    }
  },
  // Voting system
  VOTE_LINK_SECRET: {
    required: false,
    description: 'HMAC secret for voting link tokens',
    validate: (value) => {
      if (value && value.length < 32) {
        throw new Error('VOTE_LINK_SECRET must be at least 32 characters long');
      }
      if (value && value === 'change-this-secret-in-production-min-32-chars') {
        throw new Error('VOTE_LINK_SECRET must be changed from default value');
      }
    }
  },
  // Email (optional)
  SMTP_HOST: {
    required: false,
    description: 'SMTP server host',
    validate: (value) => {
      if (value && !value.includes('.')) {
        throw new Error('SMTP_HOST must be a valid hostname');
      }
    }
  },
  SMTP_USER: {
    required: false,
    description: 'SMTP username'
  },
  SMTP_PASS: {
    required: false,
    description: 'SMTP password'
  },
  // Cloudinary (optional)
  CLOUDINARY_URL: {
    required: false,
    description: 'Cloudinary connection string',
    validate: (value) => {
      if (value && !value.includes('cloudinary')) {
        throw new Error('CLOUDINARY_URL must be a valid Cloudinary URL');
      }
    }
  },
  // reCAPTCHA (optional)
  RECAPTCHA_SECRET_KEY: {
    required: false,
    description: 'reCAPTCHA secret key',
    validate: (value) => {
      if (value && !value.startsWith('6L')) {
        throw new Error('RECAPTCHA_SECRET_KEY appears to be invalid');
      }
    }
  },
  // Performance and security
  RATE_LIMIT_WINDOW_MS: {
    required: false,
    description: 'Rate limit window in milliseconds',
    default: '900000', // 15 minutes
    validate: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 60000) {
        throw new Error('RATE_LIMIT_WINDOW_MS must be at least 60000 (1 minute)');
      }
    }
  },
  RATE_LIMIT_MAX_REQUESTS: {
    required: false,
    description: 'Maximum requests per window',
    default: '100',
    validate: (value) => {
      const num = parseInt(value);
      if (isNaN(num) || num < 1 || num > 10000) {
        throw new Error('RATE_LIMIT_MAX_REQUESTS must be between 1 and 10000');
      }
    }
  }
};

/**
 * Calculate entropy of a string (basic implementation)
 */
function calculateEntropy(str) {
  const freq = {};
  for (let i = 0; i < str.length; i++) {
    freq[str[i]] = (freq[str[i]] || 0) + 1;
  }
  
  let entropy = 0;
  for (const char in freq) {
    const p = freq[char] / str.length;
    entropy -= p * Math.log2(p);
  }
  
  return entropy;
}

/**
 * Validate all environment variables
 */
const validateEnv = () => {
  const errors = [];
  const warnings = [];
  const validated = {};
  const startTime = Date.now();

  logger.info('🔍 Validating environment variables...');

  for (const [key, config] of Object.entries(requiredEnvVars)) {
    const value = process.env[key];

    if (config.required && !value) {
      errors.push(`Missing required environment variable: ${key} - ${config.description}`);
    } else if (!value && config.default) {
      process.env[key] = config.default;
      validated[key] = config.default;
      logger.debug(`Using default value for ${key}: ${config.default}`);
    } else if (value) {
      // Run validation if provided
      if (config.validate) {
        try {
          config.validate(value);
          validated[key] = value;
          logger.debug(`✓ ${key} is valid`);
        } catch (error) {
          errors.push(`${key}: ${error.message}`);
        }
      } else {
        validated[key] = value;
        logger.debug(`✓ ${key} is set`);
      }
    } else if (config.required === false && !value) {
      warnings.push(`Optional environment variable not set: ${key} - ${config.description}`);
    }
  }

  // Enhanced security checks for production
  if (process.env.NODE_ENV === 'production') {
    // Check for insecure defaults
    const insecureDefaults = [
      'your-secret-key',
      'change-this-secret',
      'elp-session-secret',
      'change-this-secret-in-production-min-32-chars'
    ];
    
    for (const secret of insecureDefaults) {
      Object.keys(process.env).forEach(key => {
        if (process.env[key] === secret) {
          errors.push(`Security risk: ${key} is using a default/insecure value`);
        }
      });
    }

    // CORS security
    if (process.env.FRONTEND_URL === '*' || !process.env.FRONTEND_URL) {
      warnings.push('FRONTEND_URL is too permissive in production');
    }
    
    // HTTPS enforcement
    if (process.env.FORCE_HTTPS !== 'true') {
      warnings.push('FORCE_HTTPS should be enabled in production');
    }
    
    // Rate limiting
    if (!process.env.RATE_LIMIT_MAX_REQUESTS || parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) > 1000) {
      warnings.push('Consider stricter rate limiting in production');
    }
  }

  // Performance recommendations
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.REDIS_HOST) {
      warnings.push('Redis not configured - consider adding for better performance');
    }
    
    if (!process.env.CLOUDINARY_URL) {
      warnings.push('Cloudinary not configured - image uploads will be local');
    }
  }

  // Log results
  if (warnings.length > 0) {
    logger.warn('⚠️ Environment variable warnings:');
    warnings.forEach((warning) => logger.warn(`  - ${warning}`));
  }

  if (errors.length > 0) {
    logger.error('❌ Environment variable validation failed:');
    errors.forEach((error) => logger.error(`  - ${error}`));
    throw new Error('Environment variable validation failed. Please check your .env file.');
  }

  const validationTime = Date.now() - startTime;
  logger.info(`✅ All environment variables validated successfully (${validationTime}ms)`);
  
  return validated;
};

/**
 * Get environment configuration summary
 */
const getEnvSummary = () => {
  return {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    features: {
      email: !!(process.env.EMAIL_HOST && process.env.EMAIL_USER),
      cloudinary: !!process.env.CLOUDINARY_URL,
      redis: !!process.env.REDIS_HOST,
      recaptcha: !!process.env.RECAPTCHA_SECRET_KEY,
      voting: !!process.env.VOTE_LINK_SECRET
    },
    security: {
      httpsEnforced: process.env.FORCE_HTTPS === 'true',
      rateLimiting: !!(process.env.RATE_LIMIT_MAX_REQUESTS),
      corsConfigured: !!process.env.FRONTEND_URL
    }
  };
};

module.exports = { 
  validateEnv, 
  requiredEnvVars,
  getEnvSummary
};

