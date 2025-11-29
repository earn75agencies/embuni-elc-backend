const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission, ensureAdminProfile } = require('../middleware/adminMiddleware');

/**
 * Protected routes - all require authentication
 */
router.use(protect);

/**
 * GET routes
 */

// Admin dashboard stats - requires Admin profile
router.get('/dashboard/stats', ensureAdminProfile, adminController.getDashboardStats);

// Get own admin profile - requires Admin profile
router.get('/profile', ensureAdminProfile, adminController.getAdminProfile);

// Get all admins (Super Admin only)
router.get(
  '/all',
  requirePermission('manage_admins'),
  adminController.getAllAdmins
);

// Get admin by ID (Super Admin only)
router.get(
  '/:adminId',
  requirePermission('manage_admins'),
  adminController.getAdminById
);

// Get activity logs (Super Admin only)
router.get(
  '/logs/activity',
  requirePermission('view_logs'),
  adminController.getActivityLogs
);

// Get admin role statistics (Super Admin only)
router.get(
  '/stats/roles',
  requirePermission('manage_admins'),
  adminController.getAdminStats
);

/**
 * PUT routes
 */

// Update own profile - requires Admin profile
router.put('/profile', ensureAdminProfile, adminController.updateAdminProfile);

// Update admin role (Super Admin only)
router.put(
  '/:adminId/role',
  requirePermission('manage_admins'),
  adminController.updateAdminRole
);

// Activate admin (Super Admin only)
router.put(
  '/:adminId/activate',
  requirePermission('manage_admins'),
  adminController.activateAdmin
);

// Deactivate admin (Super Admin only)
router.put(
  '/:adminId/deactivate',
  requirePermission('manage_admins'),
  adminController.deactivateAdmin
);

/**
 * POST routes
 */

// Create new admin (Super Admin only)
router.post(
  '/create',
  requirePermission('manage_admins'),
  adminController.createAdmin
);

// Log action - requires Admin profile
router.post('/log-action', ensureAdminProfile, adminController.logAdminAction);

// Export activity logs (Super Admin only)
router.post(
  '/logs/export',
  requirePermission('view_logs'),
  adminController.exportActivityLogs
);

/**
 * DELETE routes
 */

// Delete admin (Super Admin only)
router.delete(
  '/:adminId',
  requirePermission('manage_admins'),
  adminController.deleteAdmin
);

module.exports = router;
