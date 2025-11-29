/**
 * Enhanced Security Middleware
 * Comprehensive security measures for production backend
 */

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cors = require('cors');
const express = require('express');
const { createHash } = require('crypto');
const { performance } = require('perf_hooks');

// Enhanced rate limiting with Redis
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis client for rate limiting
const redisClient = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

// Security configuration
const securityConfig = {
  // Rate limiting configurations
  rateLimits: {
    // General API rate limit
    general: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: {
        success: false,
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      standardHeaders: true,
      legacyHeaders: false,
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      }),
      keyGenerator: (req) => {
        return `rate_limit:${req.ip}:${req.path}`;
      }
    },

    // Strict rate limit for sensitive endpoints
    strict: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 requests per windowMs
      message: {
        success: false,
        error: 'Too many attempts from this IP, please try again later.',
        retryAfter: '15 minutes'
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      }),
      skipSuccessfulRequests: false
    },

    // Authentication rate limit
    auth: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth attempts per windowMs
      message: {
        success: false,
        error: 'Too many authentication attempts, please try again later.',
        retryAfter: '15 minutes'
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      }),
      keyGenerator: (req) => {
        return `auth_limit:${req.ip}:${req.body.email || 'unknown'}`;
      }
    },

    // Upload rate limit
    upload: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 uploads per hour
      message: {
        success: false,
        error: 'Upload limit exceeded, please try again later.',
        retryAfter: '1 hour'
      },
      store: new RedisStore({
        sendCommand: (...args) => redisClient.call(...args)
      })
    }
  },

  // Helmet configuration
  helmet: {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://www.google-analytics.com'],
        imgSrc: ["'self'", 'data:', 'https:', 'https://res.cloudinary.com'],
        connectSrc: ["'self'", 'https://api.example.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"]
      }
    },
    crossOriginEmbedderPolicy: false,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  },

  // CORS configuration
  cors: {
    origin: function (origin, callback) {
      const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000', 'https://equityleaders.embuni.ac.ke'];

      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) {return callback(null, true);}

      if (allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'Authorization',
      'X-CSRF-Token',
      'X-API-Key'
    ],
    exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
    maxAge: 86400 // 24 hours
  }
};

// Create rate limiters
const createRateLimiter = (config) => {
  return rateLimit(config);
};

// Security middleware factory
const securityMiddleware = {
  // Apply all security middleware
  applyAll: (app) => {
    // Trust proxy for rate limiting behind reverse proxy
    app.set('trust proxy', 1);

    // Helmet for security headers
    app.use(helmet(securityConfig.helmet));

    // CORS configuration
    app.use(cors(securityConfig.cors));

    // Rate limiting
    app.use(createRateLimiter(securityConfig.rateLimits.general));

    // Body parser middleware (before sanitization)
    app.use(express.json({
      limit: '10mb',
      verify: (req, res, buf) => {
        req.rawBody = buf;
      }
    }));
    app.use(express.urlencoded({ extended: true, limit: '10mb' }));

    // Data sanitization
    app.use(mongoSanitize()); // NoSQL injection protection
    app.use(xss()); // XSS protection
    app.use(hpp()); // HTTP parameter pollution protection

    // Custom security headers
    app.use((req, res, next) => {
      // Remove server information
      res.removeHeader('X-Powered-By');

      // Add custom security headers
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.setHeader('X-Frame-Options', 'DENY');
      res.setHeader('X-XSS-Protection', '1; mode=block');
      res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

      // Add rate limit headers
      res.setHeader('X-RateLimit-Limit', securityConfig.rateLimits.general.max);
      res.setHeader('X-RateLimit-Window', Math.round(securityConfig.rateLimits.general.windowMs / 1000));

      next();
    });

    // Request logging for security
    app.use((req, res, next) => {
      const startTime = performance.now();

      // Log request details
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - IP: ${req.ip}`);

      // Log response when finished
      res.on('finish', () => {
        const duration = performance.now() - startTime;
        console.log(`[${new Date().toISOString()}] ${req.method} ${req.path} - ${res.statusCode} - ${duration.toFixed(2)}ms`);
      });

      next();
    });
  },

  // Specific rate limiters for different endpoints
  rateLimiters: {
    general: createRateLimiter(securityConfig.rateLimits.general),
    strict: createRateLimiter(securityConfig.rateLimits.strict),
    auth: createRateLimiter(securityConfig.rateLimits.auth),
    upload: createRateLimiter(securityConfig.rateLimits.upload)
  },

  // Input validation middleware
  validateInput: (schema) => {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      if (error) {
        return res.status(400).json({
          success: false,
          error: 'Validation failed',
          details: error.details.map(detail => ({
            field: detail.path.join('.'),
            message: detail.message
          }))
        });
      }
      next();
    };
  },

  // SQL injection prevention (for any raw queries)
  preventSQLInjection: (req, res, next) => {
    const sqlPatterns = [
      /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
      /(--|;|\/\*|\*\/|xp_|sp_)/gi,
      /(\bOR\b.*=.*\bOR\b)/gi,
      /(\bAND\b.*=.*\bAND\b)/gi
    ];

    const checkValue = (value) => {
      if (typeof value === 'string') {
        return sqlPatterns.some(pattern => pattern.test(value));
      }
      if (typeof value === 'object' && value !== null) {
        return Object.values(value).some(v => checkValue(v));
      }
      return false;
    };

    if (checkValue(req.body) || checkValue(req.query) || checkValue(req.params)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid input detected'
      });
    }

    next();
  },

  // File upload security
  secureFileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'],

    validateFile: (file) => {
      // Check file size
      if (file.size > securityMiddleware.secureFileUpload.maxSize) {
        throw new Error('File size exceeds maximum allowed size');
      }

      // Check MIME type
      if (!securityMiddleware.secureFileUpload.allowedMimeTypes.includes(file.mimetype)) {
        throw new Error('File type not allowed');
      }

      // Check file extension
      const ext = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
      if (!securityMiddleware.secureFileUpload.allowedExtensions.includes(ext)) {
        throw new Error('File extension not allowed');
      }

      return true;
    },

    sanitizeFilename: (filename) => {
      // Remove special characters and replace with underscores
      return filename
        .replace(/[^a-zA-Z0-9.-]/g, '_')
        .replace(/_{2,}/g, '_')
        .toLowerCase();
    }
  },

  // API key validation
  validateApiKey: (req, res, next) => {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
      return res.status(401).json({
        success: false,
        error: 'API key required'
      });
    }

    // Validate API key format
    const apiKeyPattern = /^elp_[a-zA-Z0-9]{64}$/;
    if (!apiKeyPattern.test(apiKey)) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key format'
      });
    }

    // Here you would validate the API key against your database
    // For now, we'll just check if it matches environment variable
    if (apiKey !== process.env.API_KEY) {
      return res.status(401).json({
        success: false,
        error: 'Invalid API key'
      });
    }

    next();
  },

  // Request timeout middleware
  requestTimeout: (timeoutMs = 30000) => {
    return (req, res, next) => {
      const timeout = setTimeout(() => {
        if (!res.headersSent) {
          res.status(408).json({
            success: false,
            error: 'Request timeout'
          });
        }
      }, timeoutMs);

      res.on('finish', () => clearTimeout(timeout));
      res.on('close', () => clearTimeout(timeout));
      next();
    };
  },

  // IP whitelist/blacklist middleware
  ipFilter: (options = {}) => {
    const { whitelist = [], blacklist = [] } = options;

    return (req, res, next) => {
      const clientIP = req.ip || req.connection.remoteAddress;

      // Check blacklist first
      if (blacklist.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP'
        });
      }

      // Check whitelist if it's not empty
      if (whitelist.length > 0 && !whitelist.includes(clientIP)) {
        return res.status(403).json({
          success: false,
          error: 'Access denied from this IP'
        });
      }

      next();
    };
  }
};

module.exports = securityMiddleware;
