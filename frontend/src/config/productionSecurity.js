/**
 * Enhanced Production Security Configuration
 * Comprehensive security measures for production deployment
 */

// API Security Configuration
export const API_SECURITY = {
  // Request timeout configuration
  TIMEOUTS: {
    DEFAULT: 30000, // 30 seconds
    UPLOAD: 300000, // 5 minutes
    DOWNLOAD: 60000 // 1 minute
  },

  // Rate limiting configuration
  RATE_LIMITS: {
    DEFAULT: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.'
    },
    AUTH: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 5, // limit each IP to 5 auth requests per windowMs
      message: 'Too many authentication attempts, please try again later.'
    },
    UPLOAD: {
      windowMs: 60 * 60 * 1000, // 1 hour
      max: 10, // limit each IP to 10 uploads per hour
      message: 'Upload limit exceeded, please try again later.'
    }
  },

  // File upload security
  UPLOAD_SECURITY: {
    MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_MIME_TYPES: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ],
    ALLOWED_EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.txt', '.doc', '.docx'],
    SCAN_VIRUSES: true,
    SANITIZE_FILENAMES: true
  },

  // Input validation patterns
  VALIDATION_PATTERNS: {
    NAME: /^[a-zA-Z\s'-]{2,50}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^\+?[\d\s\-()]{10,20}$/,
    PASSWORD: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
    ALPHANUMERIC: /^[a-zA-Z0-9]+$/,
    NUMERIC: /^\d+$/,
    DECIMAL: /^\d+(\.\d{1,2})?$/,
    DATE: /^\d{4}-\d{2}-\d{2}$/,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },

  // XSS Protection
  XSS_PROTECTION: {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTRIBUTES: {
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    },
    ALLOWED_SCHEMES: ['http', 'https', 'mailto', 'tel']
  },

  // CSRF Protection
  CSRF_PROTECTION: {
    TOKEN_EXPIRY: 60 * 60 * 1000, // 1 hour
    COOKIE_NAME: 'elp-csrf-token',
    HEADER_NAME: 'X-CSRF-Token',
    STRICT_MODE: true
  },

  // Session Security
  SESSION_SECURITY: {
    COOKIE_NAME: 'elp-session',
    SECRET_LENGTH: 64,
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    SECURE: import.meta.env.PROD,
    HTTP_ONLY: true,
    SAME_SITE: 'strict',
    ROTATE_ON_LOGIN: true,
    IDLE_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    ABSOLUTE_TIMEOUT: 8 * 60 * 60 * 1000 // 8 hours
  },

  // JWT Configuration
  JWT_CONFIG: {
    ACCESS_TOKEN_EXPIRY: '15m',
    REFRESH_TOKEN_EXPIRY: '7d',
    ALGORITHM: 'HS256',
    ISSUER: 'equity-leaders-program',
    AUDIENCE: 'elp-users'
  },

  // Password Security
  PASSWORD_SECURITY: {
    MIN_LENGTH: 8,
    MAX_LENGTH: 128,
    REQUIRE_UPPERCASE: true,
    REQUIRE_LOWERCASE: true,
    REQUIRE_NUMBERS: true,
    REQUIRE_SPECIAL_CHARS: true,
    PREVENT_COMMON_PASSWORDS: true,
    PREVENT_PERSONAL_INFO: true,
    HASH_ROUNDS: 12,
    SALT_ROUNDS: 12
  },

  // API Key Security
  API_KEY_SECURITY: {
    HEADER_NAME: 'X-API-Key',
    LENGTH: 64,
    PREFIX: 'elp_',
    ROTATION_INTERVAL: 30 * 24 * 60 * 60 * 1000, // 30 days
    RATE_LIMIT_PER_KEY: 1000
  },

  // Database Security
  DB_SECURITY: {
    CONNECTION_TIMEOUT: 10000,
    QUERY_TIMEOUT: 30000,
    MAX_CONNECTIONS: 100,
    IDLE_TIMEOUT: 30000,
    ENCRYPTION_AT_REST: true,
    AUDIT_LOGGING: true,
    PARAMETERIZED_QUERIES: true,
    ROW_LEVEL_SECURITY: true
  },

  // Logging and Monitoring
  LOGGING_SECURITY: {
    LOG_LEVEL: import.meta.env.PROD ? 'warn' : 'info',
    LOG_REQUESTS: true,
    LOG_RESPONSES: false, // Don't log response bodies in production
    LOG_ERRORS: true,
    LOG_AUTH_EVENTS: true,
    LOG_SECURITY_EVENTS: true,
    SENSITIVE_DATA_MASKING: true,
    RETENTION_DAYS: 90,
    REAL_TIME_ALERTS: true
  },

  // Backup and Recovery
  BACKUP_SECURITY: {
    FREQUENCY: 'daily',
    RETENTION_DAYS: 30,
    ENCRYPTION: true,
    OFFSITE_STORAGE: true,
    AUTOMATED_TESTING: true,
    POINT_IN_TIME_RECOVERY: true
  },

  // Compliance and Auditing
  COMPLIANCE: {
    GDPR_COMPLIANT: true,
    CCPA_COMPLIANT: true,
    DATA_RETENTION_DAYS: 365,
    RIGHT_TO_DELETION: true,
    DATA_PORTABILITY: true,
    CONSENT_MANAGEMENT: true,
    AUDIT_TRAIL: true,
    REGULAR_SECURITY_AUDITS: true
  }
};

// Legacy security config for backward compatibility
export const securityConfig = {
  // Content Security Policy
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'", // For React and inline scripts
        "https://www.google-analytics.com",
        "https://www.googletagmanager.com",
        "https://www.recaptcha.net",
        "https://www.gstatic.com"
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'", // For styled-components and inline styles
        "https://fonts.googleapis.com"
      ],
      imgSrc: [
        "'self'",
        "data:",
        "https:",
        "https://embuni-elc-backend.onrender.com",
        "https://images.unsplash.com",
        "https://via.placeholder.com"
      ],
      connectSrc: [
        "'self'",
        "https://embuni-elc-backend.onrender.com",
        "https://api.github.com",
        "https://www.google-analytics.com"
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "data:"
      ],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      childSrc: ["'none'"],
      workerSrc: ["'self'"],
      manifestSrc: ["'self'"],
      upgradeInsecureRequests: []
    }
  },

  // Security Headers
  headers: {
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'Cross-Origin-Embedder-Policy': 'require-corp',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin'
  },

  // Rate Limiting Configuration
  rateLimiting: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
      success: false,
      message: 'Too many requests from this IP, please try again later.',
      retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false
  },

  // Input Validation Rules
  validation: {
    maxLength: {
      name: 100,
      email: 255,
      title: 200,
      description: 1000,
      message: 2000
    },
    allowedTags: ['p', 'br', 'strong', 'em', 'u', 'ul', 'ol', 'li'],
    allowedAttributes: {
      '*': ['class'],
      'a': ['href', 'title', 'target'],
      'img': ['src', 'alt', 'title', 'width', 'height']
    }
  },

  // File Upload Security
  fileUpload: {
    maxSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf'
    ],
    allowedExtensions: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    scanForMalware: true,
    sanitizeFilename: true
  },

  // Session Security
  session: {
    name: 'elp_session',
    secret: import.meta.env.VITE_SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    rolling: true,
    cookie: {
      secure: true,
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: 'strict'
    }
  },

  // JWT Configuration
  jwt: {
    algorithm: 'HS256',
    expiresIn: '24h',
    issuer: 'embuni-elc',
    audience: 'embuni-elc-users'
  },

  // Password Policy
  passwordPolicy: {
    minLength: 8,
    maxLength: 128,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: false,
    preventCommonPasswords: true,
    preventUserInfoInPassword: true
  },

  // API Security
  api: {
    enableCORS: true,
    allowedOrigins: [
      'https://embuni-elc-frontend.vercel.app',
      'https://embuni-elc.com',
      'http://localhost:3000'
    ],
    allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    credentials: true
  },

  // Monitoring and Logging
  monitoring: {
    enableSecurityLogs: true,
    logLevel: 'warn',
    logFailedAttempts: true,
    logSuspiciousActivity: true,
    alertThresholds: {
      failedLogins: 5,
      suspiciousRequests: 50,
      errorRate: 0.1 // 10%
    }
  }
};

// Environment-specific configurations
export const getSecurityConfig = () => {
const isProduction = import.meta.env.PROD;
  const isDevelopment = import.meta.env.DEV;
  const isTest = import.meta.env.MODE === 'test';

  return {
    ...API_SECURITY,
    // Override based on environment
    RATE_LIMITS: {
      ...API_SECURITY.RATE_LIMITS,
      DEFAULT: {
        ...API_SECURITY.RATE_LIMITS.DEFAULT,
        max: isDevelopment ? 1000 : 100
      }
    },
    LOGGING_SECURITY: {
      ...API_SECURITY.LOGGING_SECURITY,
      LOG_LEVEL: isDevelopment ? 'debug' : isTest ? 'error' : 'warn'
    },
    SESSION_SECURITY: {
      ...API_SECURITY.SESSION_SECURITY,
      SECURE: isProduction,
      SAME_SITE: isDevelopment ? 'lax' : 'strict'
    }
  };
};

// Security headers for frontend
export const getSecurityHeaders = () => {
  const config = getSecurityConfig();
  
  return {
    ...securityConfig.headers,
    'X-RateLimit-Limit': config.RATE_LIMITS.DEFAULT.max.toString(),
    'X-RateLimit-Window': (config.RATE_LIMITS.DEFAULT.windowMs / 1000).toString(),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin'
  };
};

// Security validation functions
export const validateInput = (value, pattern) => {
  if (!value || !pattern) return false;
  return pattern.test(value);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
};

export const generateSecureToken = (length = 32) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export default {
  API_SECURITY,
  securityConfig,
  getSecurityConfig,
  getSecurityHeaders,
  validateInput,
  sanitizeInput,
  generateSecureToken
};
