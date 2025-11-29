const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');

/**
 * Protect route - requires valid JWT token
 */
exports.authenticateToken = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Basic token format validation
      if (!token || token.length < 10) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token format'
        });
      }

      // Verify token with additional security checks
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        algorithms: ['HS256'],
        maxAge: '24h'
      });

      // Check token issuer and audience if configured
      if (process.env.JWT_ISSUER && decoded.iss !== process.env.JWT_ISSUER) {
        return res.status(401).json({
          success: false,
          message: 'Invalid token issuer'
        });
      }

      // Get user from token with additional checks
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      if (!req.user.isActive) {
        return res.status(403).json({
          success: false,
          message: 'Account is deactivated'
        });
      }

      // Check if user's password was changed after token was issued
      if (req.user.passwordChangedAt && decoded.iat < req.user.passwordChangedAt.getTime() / 1000) {
        return res.status(401).json({
          success: false,
          message: 'Token is invalid - user password has been changed'
        });
      }

      // Add session fingerprint for additional security
      req.sessionFingerprint = crypto
        .createHash('sha256')
        .update(req.get('User-Agent') + req.ip)
        .digest('hex');

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);

      // Specific error messages for different JWT errors
      if (error.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: 'Token expired, please login again'
        });
      } else if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid token'
        });
      } else {
        return res.status(401).json({
          success: false,
          message: 'Authentication failed'
        });
      }
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required, no token provided'
    });
  }
};

// Keep the old name for backward compatibility
exports.protect = exports.authenticateToken;

/**
 * Optional authentication - doesn't fail if no token
 */
exports.optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];

      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {
          algorithms: ['HS256'],
          maxAge: '24h'
        });
        req.user = await User.findById(decoded.id).select('-password');

        // Add session fingerprint if user is authenticated
        if (req.user) {
          req.sessionFingerprint = crypto
            .createHash('sha256')
            .update(req.get('User-Agent') + req.ip)
            .digest('hex');
        }
      } catch (error) {
        req.user = null;
      }
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
};

/**
 * Verify user owns the resource (for updates/deletes)
 * NEW ADMIN STRUCTURE: Admin access is determined by Admin model, not User.role
 */
exports.verifyOwner = (resourceUserId) => {
  return async (req, res, next) => {
    const isOwner = req.user._id.toString() === resourceUserId.toString();

    // Check if user is admin via Admin model
    if (!isOwner) {
      const Admin = require('../models/Admin');
      const admin = await Admin.findOne({ user: req.user._id, isActive: true });
      if (!admin) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to modify this resource'
        });
      }
    }
    next();
  };
};

/**
 * Strict admin verification - requires active Admin record
 * NEW ADMIN STRUCTURE: Admin access is determined by Admin model, not User.role
 */
exports.strictAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no user'
    });
  }

  // Check Admin model - this is source of truth
  const Admin = require('../models/Admin');
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (!admin) {
    return res.status(403).json({
      success: false,
      message: 'Not authorized, admin access required'
    });
  }

  req.admin = admin;
  req.isAdmin = true;
  next();
};

/**
 * Require admin - simplified version for route protection
 */
exports.requireAdmin = exports.strictAdmin;

/**
 * Rate limit middleware configuration
 */
exports.getRateLimitConfig = () => {
  return {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  };
};
