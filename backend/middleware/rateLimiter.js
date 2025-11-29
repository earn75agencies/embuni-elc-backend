const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');

// Redis client for distributed rate limiting (if Redis is available)
let redisClient;
try {
  if (process.env.REDIS_URL) {
    redisClient = new Redis(process.env.REDIS_URL);
  }
} catch (error) {
  console.warn('Redis not available, falling back to memory store for rate limiting');
}

/**
 * General API rate limiter
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    retryAfter: '15 minutes'
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  skip: (req) => {
    // Don't rate limit health check and static assets
    return req.path === '/health' || req.path.startsWith('/uploads/');
  },
  keyGenerator: (req) => {
    // Use IP for unauthenticated requests, user ID for authenticated
    return req.user ? `user:${req.user._id}` : `ip:${req.ip}`;
  }
});

/**
 * Authentication rate limiter - stricter limits
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 login attempts per windowMs
  message: {
    success: false,
    message: 'Too many login attempts, please try again after 15 minutes',
    retryAfter: '15 minutes'
  },
  skipSuccessfulRequests: true, // Don't count successful requests
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    // Use email as key for login attempts, fallback to IP
    const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    return email ? `auth:${email}` : `auth:ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`Rate limit exceeded for authentication: ${req.body.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many login attempts, please try again after 15 minutes',
      retryAfter: '15 minutes'
    });
  }
});

/**
 * Strict rate limiter for sensitive operations
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  message: {
    success: false,
    message: 'Too many requests to sensitive endpoints, please try again later',
    retryAfter: '1 hour'
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    return req.user ? `strict:user:${req.user._id}` : `strict:ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`Strict rate limit exceeded: ${req.user?.email || req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many requests to sensitive endpoints, please try again later',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Post/Create rate limiter
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 30, // Limit to 30 posts per hour per user
  message: {
    success: false,
    message: 'Too many posts created, please wait before creating more',
    retryAfter: '1 hour'
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    return req.user ? `create:user:${req.user._id}` : `create:ip:${req.ip}`;
  },
  skip: (req) => {
    // Skip for admins
    // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
    return req.isAdmin || false;
  },
  handler: (req, res) => {
    console.warn(`Create rate limit exceeded: ${req.user?.email || req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many posts created, please wait before creating more',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Comment rate limiter
 */
const commentLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5, // Limit to 5 comments per minute
  message: {
    success: false,
    message: 'Too many comments, please wait before commenting again',
    retryAfter: '1 minute'
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    return req.user ? `comment:user:${req.user._id}` : `comment:ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`Comment rate limit exceeded: ${req.user?.email || req.ip} on ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Too many comments, please wait before commenting again',
      retryAfter: '1 minute'
    });
  }
});

/**
 * Contact form rate limiter - prevents spam
 */
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 contact form submissions per hour
  message: {
    success: false,
    message: 'Too many contact form submissions, please try again later',
    retryAfter: '1 hour'
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    return `contact:ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`Contact form rate limit exceeded: ${req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many contact form submissions, please try again later',
      retryAfter: '1 hour'
    });
  }
});

/**
 * Password reset rate limiter
 */
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // Limit to 3 password reset requests per hour
  message: {
    success: false,
    message: 'Too many password reset attempts, please try again later',
    retryAfter: '1 hour'
  },
  store: redisClient ? new RedisStore({
    sendCommand: (...args) => redisClient.call(...args)
  }) : undefined,
  keyGenerator: (req) => {
    const email = req.body.email ? req.body.email.toLowerCase().trim() : null;
    return email ? `reset:${email}` : `reset:ip:${req.ip}`;
  },
  handler: (req, res) => {
    console.warn(`Password reset rate limit exceeded: ${req.body.email || req.ip}`);
    res.status(429).json({
      success: false,
      message: 'Too many password reset attempts, please try again later',
      retryAfter: '1 hour'
    });
  }
});

module.exports = {
  apiLimiter,
  authLimiter,
  strictLimiter,
  createLimiter,
  commentLimiter,
  contactLimiter,
  passwordResetLimiter
};
