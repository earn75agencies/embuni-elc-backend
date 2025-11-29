const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Admin = require('../models/Admin');
const { asyncHandler, APIError } = require('./errorMiddleware');

/**
 * Protect routes - verify JWT token
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Get token from header
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Check if token exists
  if (!token) {
    throw new APIError('Access denied. No token provided.', 401);
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Get user from database
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      throw new APIError('Token is valid but user not found', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new APIError('Account is not active', 401);
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      throw new APIError('Invalid token', 401);
    } else if (error.name === 'TokenExpiredError') {
      throw new APIError('Token expired', 401);
    }
    throw error;
  }
});

/**
 * Admin middleware - check if user is admin
 */
const admin = asyncHandler(async (req, res, next) => {
  if (!req.user) {
    throw new APIError('Access denied. Authentication required.', 401);
  }

  if (req.user.role !== 'admin') {
    throw new APIError('Access denied. Admin privileges required.', 403);
  }

  // Load admin profile for additional checks
  try {
    const adminProfile = await Admin.findOne({ userId: req.user._id });
    if (!adminProfile) {
      throw new APIError('Admin profile not found', 403);
    }

    if (adminProfile.status !== 'active') {
      throw new APIError('Admin account is not active', 403);
    }

    req.adminProfile = adminProfile;
    next();
  } catch (error) {
    throw new APIError('Failed to verify admin privileges', 403);
  }
});

/**
 * Role-based access control middleware
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new APIError('Access denied. Authentication required.', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new APIError('Access denied. Insufficient permissions.', 403));
    }

    next();
  };
};

/**
 * Permission-based access control for admins
 */
const requirePermission = (permission) => {
  return asyncHandler(async (req, res, next) => {
    if (!req.user || !req.adminProfile) {
      throw new APIError('Access denied. Admin authentication required.', 401);
    }

    const { ROLE_PERMISSIONS } = require('../constants/adminRoles');
    const adminRole = req.adminProfile.role;
    const permissions = ROLE_PERMISSIONS[adminRole] || [];

    if (!permissions.includes(permission)) {
      throw new APIError('Access denied. Insufficient permissions.', 403);
    }

    next();
  });
};

/**
 * Optional authentication - doesn't throw error if no token
 */
const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
      const user = await User.findById(decoded.id).select('-password');
      
      if (user && user.status === 'active') {
        req.user = user;
        
        // Load admin profile if user is admin
        if (user.role === 'admin') {
          req.adminProfile = await Admin.findOne({ userId: user._id });
        }
      }
    } catch (error) {
      // Ignore errors for optional auth
    }
  }

  next();
});

module.exports = {
  protect,
  admin,
  authorize,
  requirePermission,
  optionalAuth
};