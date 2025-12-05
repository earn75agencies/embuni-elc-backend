/**
 * Production Security Configuration
 * Implements Content Security Policy, XSS protection, and other security headers
 */

// Content Security Policy configuration
export const CSP_CONFIG = {
  // Directives for different content types
  directives: {
    // Default policy: restrict to same origin by default
    'default-src': ["'self'"],
    
    // Script sources: allow self, trusted CDNs, and inline scripts for React
    'script-src': [
      "'self'",
      "'unsafe-inline'", // Required for React development and some third-party scripts
      "'unsafe-eval'", // Required for some React features
      'https://www.google.com',
      'https://www.gstatic.com',
      'https://apis.google.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      'https://js.stripe.com',
      'https://www.paypal.com',
      'https://www.recaptcha.net',
      'https://www.google.com/recaptcha/',
      import.meta.env.VITE_CDN_URL || ''
    ].filter(Boolean),
    
    // Style sources: allow self, inline styles, and trusted CDNs
    'style-src': [
      "'self'",
      "'unsafe-inline'", // Required for Tailwind CSS and dynamic styling
      'https://fonts.googleapis.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      import.meta.env.VITE_CDN_URL || ''
    ].filter(Boolean),
    
    // Image sources: allow self, data URLs, and trusted image hosts
    'img-src': [
      "'self'",
      'data:',
      'blob:',
      'https:',
      import.meta.env.VITE_CDN_URL || '',
      'https://lh3.googleusercontent.com', // Google profile images
      'https://graph.facebook.com', // Facebook profile images
      'https://platform-lookaside.fbsbx.com' // Facebook platform images
    ].filter(Boolean),
    
    // Font sources: allow self and trusted font CDNs
    'font-src': [
      "'self'",
      'data:',
      'https://fonts.gstatic.com',
      'https://cdn.jsdelivr.net',
      'https://unpkg.com',
      import.meta.env.VITE_CDN_URL || ''
    ].filter(Boolean),
    
    // Connect sources: allow API endpoints and external services
    'connect-src': [
      "'self'",
      import.meta.env.VITE_API_URL || '',
      import.meta.env.VITE_WS_URL || '',
      'https://www.google-analytics.com',
      'https://analytics.google.com',
      'https://api.stripe.com',
      'https://www.paypal.com',
      'https://www.recaptcha.net',
      'https://sentry.io', // Error reporting
      'https://browser.sentry-cdn.com' // Sentry SDK
    ].filter(Boolean),
    
    // Frame sources: allow specific iframes
    'frame-src': [
      "'self'",
      'https://www.google.com',
      'https://www.recaptcha.net',
      'https://js.stripe.com',
      'https://www.paypal.com'
    ],
    
    // Media sources: audio and video
    'media-src': ["'self'", 'blob:', 'https:'],
    
    // Object sources: disallow plugins
    'object-src': ["'none'"],
    
    // Base URI: restrict base tag
    'base-uri': ["'self'"],
    
    // Form action: restrict form submissions
    'form-action': ["'self'"],
    
    // Frame ancestors: prevent clickjacking
    'frame-ancestors': ["'none'"],
    
    // Manifest: allow app manifest
    'manifest-src': ["'self'"],
    
    // Worker: allow service workers
    'worker-src': ["'self'", 'blob:'],
    
    // Prefetch: allow prefetching
    'prefetch-src': ["'self'"],
    
    // Upgrade insecure requests: force HTTPS
    'upgrade-insecure-requests': []
  },
  
  // Report violations to monitoring endpoint
  reportUri: import.meta.env.VITE_ERROR_REPORTING_ENDPOINT || '/api/csp-report',
  
  // Enable report-only mode for testing
  reportOnly: import.meta.env.NODE_ENV !== 'production'
};

// Generate CSP header string
export const generateCSPHeader = (config = CSP_CONFIG) => {
  const directives = Object.entries(config.directives)
    .map(([directive, sources]) => {
      const sourceList = Array.isArray(sources) ? sources.join(' ') : sources;
      return `${directive} ${sourceList}`;
    })
    .join('; ');
  
  return directives;
};

// Security headers configuration
export const SECURITY_HEADERS = {
  // Content Security Policy
  'Content-Security-Policy': generateCSPHeader(),
  
  // Strict Transport Security (HSTS)
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  
  // X-Frame-Options: prevent clickjacking
  'X-Frame-Options': 'DENY',
  
  // X-Content-Type-Options: prevent MIME sniffing
  'X-Content-Type-Options': 'nosniff',
  
  // X-XSS-Protection: legacy XSS protection
  'X-XSS-Protection': '1; mode=block',
  
  // Referrer Policy: control referrer information
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  
  // Permissions Policy: control browser features
  'Permissions-Policy': [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()',
    'ambient-light-sensor=()',
    'autoplay=(self)',
    'encrypted-media=(self)',
    'fullscreen=(self)',
    'picture-in-picture=(self)'
  ].join(', '),
  
  // Cross-Origin Embedder Policy
  'Cross-Origin-Embedder-Policy': 'require-corp',
  
  // Cross-Origin Opener Policy
  'Cross-Origin-Opener-Policy': 'same-origin',
  
  // Cross-Origin Resource Policy
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Rate limiting configuration
export const RATE_LIMIT_CONFIG = {
  // General API rate limits
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false
  },
  
  // Authentication endpoints (stricter limits)
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    message: 'Too many authentication attempts, please try again later.',
    skipSuccessfulRequests: true
  },
  
  // File upload limits
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 uploads per hour
    message: 'Upload limit exceeded, please try again later.'
  },
  
  // Contact form limits
  contact: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // limit each IP to 3 contact messages per hour
    message: 'Contact form limit exceeded, please try again later.'
  }
};

// Input validation patterns
export const VALIDATION_PATTERNS = {
  // Email validation
  email: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  
  // Phone number validation (Kenyan format)
  phone: /^(\+254|0)?[7]\d{8}$/,
  
  // Password strength
  password: {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
  },
  
  // Name validation
  name: /^[a-zA-Z\s'-]{2,50}$/,
  
  // Username validation
  username: /^[a-zA-Z0-9_]{3,20}$/,
  
  // URL validation
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)$/,
  
  // File type validation
  imageTypes: /\.(jpg|jpeg|png|gif|webp)$/i,
  documentTypes: /\.(pdf|doc|docx|txt)$/i,
  
  // ID validation (for various entities)
  id: /^[a-fA-F0-9]{24}$/, // MongoDB ObjectId
  uuid: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
};

// Sanitization functions
export const sanitizeInput = {
  // Remove HTML tags and encode special characters
  text: (input) => {
    if (typeof input !== 'string') return '';
    return input
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .trim();
  },
  
  // Sanitize email
  email: (email) => {
    const sanitized = email.toLowerCase().trim();
    return VALIDATION_PATTERNS.email.test(sanitized) ? sanitized : '';
  },
  
  // Sanitize phone number
  phone: (phone) => {
    const sanitized = phone.replace(/\D/g, '');
    if (sanitized.startsWith('254')) {
      return `+${sanitized}`;
    } else if (sanitized.startsWith('0')) {
      return `+254${sanitized.slice(1)}`;
    } else if (sanitized.startsWith('7')) {
      return `+254${sanitized}`;
    }
    return '';
  },
  
  // Sanitize URL
  url: (url) => {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      return `https://${url}`;
    }
    return VALIDATION_PATTERNS.url.test(url) ? url : '';
  }
};

// Security utilities
export const securityUtils = {
  // Generate random token
  generateToken: (length = 32) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  },
  
  // Check if request is from trusted origin
  isTrustedOrigin: (origin) => {
    const trustedOrigins = [
      window.location.origin,
      import.meta.env.VITE_API_URL,
      'https://www.google.com',
      'https://accounts.google.com'
    ];
    return trustedOrigins.includes(origin);
  },
  
  // Validate file upload
  validateFile: (file, maxSize = 10 * 1024 * 1024, allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']) => {
    if (file.size > maxSize) {
      return { valid: false, error: 'File size exceeds limit' };
    }
    
    if (!allowedTypes.includes(file.type)) {
      return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
  },
  
  // Detect suspicious activity
  detectSuspiciousActivity: (request) => {
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /data:text\/html/gi
    ];
    
    const input = JSON.stringify(request.body || {});
    return suspiciousPatterns.some(pattern => pattern.test(input));
  }
};

export default {
  CSP_CONFIG,
  SECURITY_HEADERS,
  RATE_LIMIT_CONFIG,
  VALIDATION_PATTERNS,
  sanitizeInput,
  securityUtils,
  generateCSPHeader
};
