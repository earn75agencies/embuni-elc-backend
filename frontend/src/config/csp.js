/**
 * Content Security Policy Configuration
 * Defines CSP headers for security
 */

const isDevelopment = import.meta.env.DEV;

// CSP Directives
const cspDirectives = {
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

// CSP Header Value
const cspHeaderValue = Object.entries(cspDirectives)
  .map(([directive, sources]) => `${directive} ${sources.join(' ')}`)
  .join('; ');

// Security Headers
const securityHeaders = {
  'Content-Security-Policy': cspHeaderValue,
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
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