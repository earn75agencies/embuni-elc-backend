const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const session = require('express-session');
const passport = require('passport');
const compression = require('compression');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');
const https = require('https');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

// Validate environment variables
const { validateEnv } = require('./utils/envValidator');
try {
  validateEnv();
} catch (error) {
  console.error('❌ Environment validation failed:', error.message);
  process.exit(1);
}

// Initialize logger
const logger = require('./utils/logger');
const requestLogger = require('./middleware/requestLogger');

// Initialize Express app
const app = express();

// ======================
// Security Middleware
// ======================

// Set security HTTP headers
app.use(helmet());

// CORS configuration is loaded from ./config/cors

// Rate limiting - Ensure values are numbers
const apiLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10), // 15 minutes by default
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10), // 100 requests per window by default
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false
});

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: [
    'duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price'
  ]
}));

// Compression middleware (should be placed before routes)
app.use(compression());

// Trust proxy (important when behind a proxy like Nginx)
app.set('trust proxy', 1);

// Session configuration
const sessionConfig = {
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // Only send cookies over HTTPS in production
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  },
  store: process.env.NODE_ENV === 'production' 
    ? new (require('connect-mongo')(session))({
        mongooseConnection: mongoose.connection,
        ttl: 24 * 60 * 60 // 1 day
      })
    : null
};

if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1); // Trust first proxy
  sessionConfig.cookie.secure = true; // Serve secure cookies
}

app.use(session(sessionConfig));

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  // Log to file in production
  const accessLogStream = fs.createWriteStream(
    path.join(__dirname, 'logs/access.log'),
    { flags: 'a' }
  );
  app.use(morgan('combined', { stream: accessLogStream }));
}

// Custom request logger middleware
app.use(requestLogger);


// Import routes
const authRoutes = require('./routes/auth.routes');
const eventsRoutes = require('./routes/events.routes');
const postsRoutes = require('./routes/posts.routes');
const galleryRoutes = require('./routes/gallery.routes');
const membersRoutes = require('./routes/members.routes');
const adminRoutes = require('./routes/admin.routes');
const adminGroupRoutes = require('./routes/adminGroup.routes');
const recaptchaRoutes = require('./routes/recaptcha.routes');
const electionRoutes = require('./routes/election.routes');
const positionRoutes = require('./routes/position.routes');
const candidateRoutes = require('./routes/candidate.routes');
const voteRoutes = require('./routes/vote.routes');
const votingLinkRoutes = require('./routes/votingLink.routes');
const contactRoutes = require('./routes/contact.routes');
const partnerRoutes = require('./routes/partner.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const designSettingsRoutes = require('./routes/designSettings.routes');
const contactMessageRoutes = require('./routes/contactMessage.routes');
const mentorshipRoutes = require('./routes/mentorship.routes');
const internshipRoutes = require('./routes/internship.routes');
const alumniRoutes = require('./routes/alumni.routes');
const courseRoutes = require('./routes/course.routes');

// Import passport configuration
require('./config/passport');

// Trust proxy - important for rate limiting behind reverse proxies
app.set('trust proxy', 1);


// CORS configuration - Use enhanced CORS config
const corsOptions = require('./config/cors');
app.use(cors(corsOptions));

// Request timeout middleware
const requestTimeout = require('./middleware/timeout');
app.use(requestTimeout(30000)); // 30 seconds

// Request validation middleware
const {
  validateContentType,
  validateJSON,
  addRequestId,
  logRequest
} = require('./middleware/requestValidator');

// Enhanced security middleware
const { sanitizeBody, schemas } = require('./middleware/inputSanitizer');
const {
  apiLimiter,
  authLimiter,
  strictLimiter,
  createLimiter,
  commentLimiter,
  contactLimiter,
  passwordResetLimiter
} = require('./middleware/rateLimiter');

// Admin bypass middleware - check admin status early
const { checkAdmin, adminBypassValidation } = require('./middleware/adminBypass');

// Add request ID for tracking
app.use(addRequestId);

// Check admin status early (before validation)
app.use(checkAdmin);

// Request logging (development)
if (process.env.NODE_ENV === 'development') {
  app.use(logRequest);
}

// Body parser middleware
app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: { message: 'Invalid JSON format' }
      });
      throw new Error('Invalid JSON');
    }
  }
}));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting is already applied to /api routes

// Validate content type
app.use(validateContentType);

// Enhanced input sanitization (excluding auth routes which handle their own)
// app.use(enhancedSanitizeBody());

// Handle JSON parsing errors
app.use(validateJSON);

// Session middleware (required for passport)
app.use(session({
  secret: process.env.SESSION_SECRET || 'elp-session-secret',
  resave: false,
  saveUninitialized: false,
  name: 'elp.sid', // Don't use default 'connect.sid'
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true in production with HTTPS
    httpOnly: true,
    sameSite: 'strict', // CSRF protection
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    domain: process.env.NODE_ENV === 'production' ? process.env.COOKIE_DOMAIN : undefined
  },
  // Use secure session store in production
  store: process.env.NODE_ENV === 'production'
    ? require('connect-mongo').create({
      mongoUrl: process.env.MONGO_URI,
      ttl: 24 * 60 * 60 // 24 hours
    })
    : undefined
}));


// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Compression middleware
app.use(compression());

// Request logging
app.use(requestLogger);

// HTTP request logging (Morgan)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev', { stream: logger.stream }));
} else {
  app.use(morgan('combined', { stream: logger.stream }));
}

// Static files for uploads
app.use('/uploads', express.static('uploads'));

// Favicon route
app.get('/favicon.ico', (req, res) => {
  res.status(204).end(); // No content
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', sanitizeBody(schemas.content), eventsRoutes);
app.use('/api/posts', sanitizeBody(schemas.content), postsRoutes);
app.use('/api/gallery', galleryRoutes);
app.use('/api/members', membersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/groups', adminGroupRoutes);
app.use('/api/recaptcha', recaptchaRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api', positionRoutes);
app.use('/api', candidateRoutes);
app.use('/api/vote', voteRoutes);
app.use('/api/voting-links', votingLinkRoutes);
app.use('/api/contact', sanitizeBody(schemas.contact), contactRoutes);
app.use('/api/partners', sanitizeBody(schemas.partner), partnerRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/design-settings', designSettingsRoutes);
app.use('/api/contact', sanitizeBody(schemas.contact), contactMessageRoutes);
app.use('/api/mentorship', mentorshipRoutes);
app.use('/api/internships', internshipRoutes);
app.use('/api/alumni', alumniRoutes);
app.use('/api/courses', courseRoutes);

// Health check routes (register early for Render health checks)
const healthRoutes = require('./routes/health.routes');
app.use('/api/health', healthRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'ELP Backend API',
    version: '1.0.0',
    status: 'running',
    health: '/api/health'
  });
});

// 404 handler
const { notFound, errorHandler } = require('./middleware/errorHandler');
app.use(notFound);

// Global error handler (must be last)
app.use(errorHandler);

// Database connection
const connectDB = require('./config/db');

// Start server after DB connection
const http = require('http');
const { initializeSocket } = require('./services/socket.service');

// Store server instance for graceful shutdown
let server;

const startServer = async () => {
  try {
    logger.info('Starting server...');
    await connectDB();

    logger.info('Database connection established, starting HTTP server...');
    const PORT = process.env.PORT || 5000;

    server = http.createServer(app);

    // Initialize Socket.io for real-time voting
    initializeSocket(server);
    logger.info('Socket.io initialized for real-time voting');

    return new Promise((resolve, reject) => {
      server.listen(PORT, '0.0.0.0', () => {
        const isProduction = process.env.NODE_ENV === 'production';
        const backendUrl = process.env.BACKEND_URL || `http://0.0.0.0:${PORT}`;
        
        logger.info(`
  ╔═══════════════════════════════════════════╗
  ║   ELP Backend Server Running              ║
  ║   Port: ${PORT}                              ║
  ║   Host: 0.0.0.0                           ║
  ║   Environment: ${process.env.NODE_ENV || 'development'}           ║
  ║   Mode: ${isProduction ? '🚀 Production' : '🛠️ Development'}              ║
  ║   URL: ${backendUrl}             ║
  ║   Socket.io: /votes namespace              ║
  ╚═══════════════════════════════════════════╝
  `);
        
        if (isProduction) {
          logger.info('🚀 Production optimizations enabled');
          logger.info(`🔗 Frontend URL: ${process.env.FRONTEND_URL}`);
          logger.info(`🌐 CORS Origins: ${process.env.ALLOWED_ORIGINS || 'Configured in CORS settings'}`);
        }
        
        logger.info('Server is ready to accept connections');
        logger.info(`Health check: ${backendUrl}/api/health`);
        
        // Resolve to indicate server started successfully
        // Server will continue running even after promise resolves
        resolve();
      });

      server.on('error', (err) => {
        logger.error('Server error:', err);
        reject(err);
      });
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer().catch((err) => {
  logger.error('Uncaught error in startServer:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...', {
    name: err.name,
    message: err.message,
    stack: err.stack
  });
  process.exit(1);
});

// Graceful shutdown function
async function gracefulShutdown(signal) {
  logger.info(`👋 ${signal} RECEIVED. Shutting down gracefully`);

  try {
    // Close HTTP server
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((err) => {
          if (err) {
            logger.error('Error closing HTTP server:', err);
            reject(err);
          } else {
            logger.info('HTTP server closed');
            resolve();
          }
        });

        // Force close after 10 seconds
        setTimeout(() => {
          logger.warn('Forcing server close after timeout');
          resolve();
        }, 10000);
      });
    }

    // Close MongoDB connection (returns Promise, no callback)
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed');
      } catch (dbError) {
        logger.error('Error closing MongoDB connection:', dbError);
        // Continue with shutdown even if DB close fails
      }
    } else {
      logger.info('MongoDB connection already closed or not connected');
    }

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    // Force exit after logging error
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
}

// Handle SIGTERM (for graceful shutdown on Render, Heroku, etc.)
process.on('SIGTERM', () => {
  gracefulShutdown('SIGTERM').catch((err) => {
    logger.error('Error in graceful shutdown:', err);
    process.exit(1);
  });
});

// Handle SIGINT (Ctrl+C)
process.on('SIGINT', () => {
  gracefulShutdown('SIGINT').catch((err) => {
    logger.error('Error in graceful shutdown:', err);
    process.exit(1);
  });
});

module.exports = app;
