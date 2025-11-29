const { checkPermission, hasAnyPermission } = require('../constants/adminRoles');
const Admin = require('../models/Admin');

/**
 * Check if user is admin (based on Admin model)
 * NEW ADMIN STRUCTURE: Admin access is determined by Admin model, not User.role
 */
exports.admin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Check Admin model - this is the source of truth
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (admin) {
    req.admin = admin;
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.'
    });
  }
};

/**
 * Ensure user has an Admin record (for admin routes)
 * This middleware should be used on admin routes to ensure Admin profile exists
 * NEW ADMIN STRUCTURE: Admin access is determined by Admin model, not User.role
 */
exports.ensureAdminProfile = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Check Admin model - this is the source of truth for admin access
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (!admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin profile not found. Please contact a super admin to assign you an admin role.',
      code: 'ADMIN_PROFILE_NOT_FOUND'
    });
  }

  // Attach admin to request for use in controllers
  req.admin = admin;
  next();
};

/**
 * Check if user is strict admin (has active Admin record)
 * NEW ADMIN STRUCTURE: Admin access is determined by Admin model, not User.role
 */
exports.strictAdmin = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Check Admin model - this is the source of truth
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (admin) {
    req.admin = admin;
    next();
  } else {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin role required.'
    });
  }
};

/**
 * Check if user has specific permission
 * @param {string} permission - Permission to check
 */
exports.requirePermission = (permission) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Load admin profile for this user
    const admin = await Admin.findOne({ user: req.user._id, isActive: true });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin profile not found or inactive.'
      });
    }

    // Super admin has all permissions
    if (admin.adminRole === 'super_admin') {
      return next();
    }

    if (checkPermission(admin.adminRole, permission)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: `Access denied. Permission '${permission}' required.`
      });
    }
  };
};

/**
 * Check if user has any of the required permissions
 * @param {string[]} permissions - Array of permissions to check
 */
exports.requireAnyPermission = (permissions) => {
  return async (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.'
      });
    }

    // Load admin profile for this user
    const admin = await Admin.findOne({ user: req.user._id, isActive: true });
    if (!admin) {
      return res.status(403).json({
        success: false,
        message: 'Admin profile not found or inactive.'
      });
    }

    // Super admin has all permissions
    if (admin.adminRole === 'super_admin') {
      return next();
    }

    if (hasAnyPermission(admin.adminRole, permissions)) {
      next();
    } else {
      res.status(403).json({
        success: false,
        message: 'Access denied. At least one of the required permissions is needed.'
      });
    }
  };
};

/**
 * Verify admin is accessing their own resource or is super admin
 */
exports.verifyAdminOwnership = async (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required.'
    });
  }

  // Load admin profile for this user
  const admin = await Admin.findOne({ user: req.user._id, isActive: true });
  if (!admin) {
    return res.status(403).json({
      success: false,
      message: 'Admin profile not found or inactive.'
    });
  }

  // Super admin can access anything
  if (admin.adminRole === 'super_admin') {
    return next();
  }

  const adminId = req.params.adminId || req.body.adminId;
  if (adminId && adminId !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own admin profile.'
    });
  }

  next();
};
