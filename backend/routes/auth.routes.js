const express = require('express');
const router = express.Router();
const passport = require('passport');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { admin, requirePermission } = require('../middleware/adminMiddleware');
const { authLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');
const { recaptcha } = require('../middleware/recaptchaMiddleware');
const { sanitizeBody, schemas } = require('../middleware/inputSanitizer');

const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  changePassword,
  googleCallback,
  getAllUsers,
  getUserById,
  updateUserRole,
  deleteUser,
  deactivateAccount,
  createAdminLogin,
  assignAdminRole,
  resetAdminPassword,
  getAllAdminLogins,
  deactivateAdminCredentials,
  reactivateAdminCredentials
} = require('../controllers/auth.controller');

// Public routes with reCAPTCHA protection
router.post('/register',
  authLimiter,
  sanitizeBody(schemas.auth),
  // recaptcha({ required: true, version: 'v3', action: 'register' }),
  register
);
router.post('/login',
  authLimiter,
  sanitizeBody(schemas.auth),
  //recaptcha({ required: true, version: 'v3', action: 'login', score_threshold: 0.3 }),
  login
);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/login' }),
  googleCallback
);

// Protected routes - User
router.post('/logout', protect, logout);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);
router.post('/change-password', protect, changePassword);
router.post('/deactivate', protect, deactivateAccount);

// Admin routes - User Management
router.get('/users', protect, admin, getAllUsers);
router.get('/users/:id', protect, admin, getUserById);
router.put('/users/:id/role', protect, admin, updateUserRole);
router.delete('/users/:id', protect, admin, deleteUser);

// Admin Login Assignment Routes (Super Admin only)
router.post('/admin/create-login', protect, requirePermission('manage_admins'), createAdminLogin);
router.post('/admin/assign-role', protect, requirePermission('manage_admins'), assignAdminRole);
router.post('/admin/reset-password', protect, requirePermission('manage_admins'), resetAdminPassword);
router.get('/admin/all-logins', protect, requirePermission('manage_admins'), getAllAdminLogins);
router.put('/admin/:adminId/deactivate', protect, requirePermission('manage_admins'), deactivateAdminCredentials);
router.put('/admin/:adminId/reactivate', protect, requirePermission('manage_admins'), reactivateAdminCredentials);

module.exports = router;
