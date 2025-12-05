/**
 * Content Security Policy Configuration
 * Implements strict CSP headers for production security
 */

const CSP_DIRECTIVES = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'", // Remove in production with proper nonce
    "'unsafe-eval'", // Remove in production
    'https://www.google.com',
    'https://www.gstatic.com',
    'https://apis.google.com',
    'https://www.googletagmanager.com',
    'https://www.google-analytics.com'
  ],
  'style-src': [
    "'self'",
    "'unsafe-inline'", // Remove in production with proper nonce
    'https://fonts.googleapis.com',
    'https://www.google.com'
  ],
  'img-src': [
    "'self'",
    'data:',
    'https:',
    'https://res.cloudinary.com',
    'https://images.unsplash.com',
    'https://www.google.com'
  ],
  'font-src': [
    "'self'",
    'https://fonts.gstatic.com',
    'data:'
  ],
  'connect-src': [
    "'self'",
    'https://api.example.com',
    'https://www.google-analytics.com',
    'wss://localhost:3000',
    'wss://your-production-domain.com'
  ],
  'media-src': ["'self'"],
  'object-src': ["'none'"],
  'base-uri': ["'self'"],
  'form-action': ["'self'"],
  'frame-ancestors': ["'none'"],
  'frame-src': ["'none'"],
  'worker-src': ["'self'", 'blob:'],
  'manifest-src': ["'self'"],
  'upgrade-insecure-requests': []
};

const isDevelopment = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

// In development, allow more permissive policies
const developmentCSP = {
  'default-src': ["'self'"],
  'script-src': [
    "'self'",
    "'unsafe-inline'",
    "'unsafe-eval'",
    'ws:',
    'wss:'
  ],
  'style-src': ["'self'", "'unsafe-inline'"],
  'connect-src': ["'self'", 'ws:', 'wss:']
};

// Merge development overrides
const cspDirectives = isDevelopment 
  ? { ...CSP_DIRECTIVES, ...developmentCSP }
  : CSP_DIRECTIVES;

// Convert to CSP header string
const cspHeaderValue = Object.entries(cspDirectives)
  .map(([directive, sources]) => {
    return `${directive} ${sources.join(' ')}`;
  })
  .join('; ');

// Additional security headers
const securityHeaders = {
  'Content-Security-Policy': cspHeaderValue,
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': isDevelopment ? '' : 'max-age=31536000; includeSubDomains; preload',
  'Cross-Origin-Embedder-Policy': 'require-corp',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin'
};

// Remove empty headers
const filteredHeaders = Object.fromEntries(
  Object.entries(securityHeaders).filter(([, value]) => value !== '')
);

export {
  securityHeaders: filteredHeaders,
  cspDirectives,
  cspHeaderValue
};

