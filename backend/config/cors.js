/**
 * CORS Configuration
 * Handles multiple allowed origins for both local and production environments
 * Enhanced for production deployment
 */

const getAllowedOrigins = () => {
  const frontendUrl = process.env.FRONTEND_URL || 'https://earnix-frontend-ufmt-e9ry6c09s-gedion-mutua-nzokas-projects.vercel.app';
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS || '';

  // Default local development origins
  const localOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:5173',
    'http://127.0.0.1:5174'
  ];

  // Production frontend URLs
  const productionOrigins = [
    'https://embuni-elc-frontend.vercel.app',
    'https://earnix-frontend-ufmt-e9ry6c09s-gedion-mutua-nzokas-projects.vercel.app'
  ];

  // Parse ALLOWED_ORIGINS from .env (comma-separated)
  const envOrigins = allowedOriginsEnv
    .split(',')
    .map(origin => origin.trim())
    .filter(origin => origin.length > 0);

  // Combine: FRONTEND_URL is primary, ALLOWED_ORIGINS adds more flexibility
  // In production, prioritize production URLs
  const allOrigins = new Set([
    frontendUrl,
    ...productionOrigins,
    ...envOrigins,
    ...(process.env.NODE_ENV === 'development' ? localOrigins : [])
  ]);

  return Array.from(allOrigins);
};

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = getAllowedOrigins();

    // Allow requests with no origin (like mobile apps, curl, Postman, or same-origin requests)
    if (!origin) {
      return callback(null, true);
    }

    // Check if origin is in allowed list
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      // In development, log but allow (for easier debugging)
      if (process.env.NODE_ENV === 'development') {
        console.warn(`⚠️  CORS: Origin ${origin} not in allowed list, but allowing in development`);
        console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
        return callback(null, true);
      }
      console.warn(`🚫 CORS blocked origin: ${origin}`);
      console.warn(`   Allowed origins: ${allowedOrigins.join(', ')}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS', 'HEAD'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'Accept',
    'Origin',
    'Access-Control-Request-Method',
    'Access-Control-Request-Headers',
    'X-Request-ID'
  ],
  exposedHeaders: [
    'Content-Length',
    'Content-Type',
    'X-Request-ID',
    'X-Total-Count',
    'X-Rate-Limit-Limit',
    'X-Rate-Limit-Remaining',
    'X-Rate-Limit-Reset'
  ],
  maxAge: process.env.NODE_ENV === 'production' ? 86400 : 7200, // 24h in production, 2h in development
  // Security headers for CORS
  preflightContinue: false,
  optionsSuccessStatus: 204
};

module.exports = corsOptions;
