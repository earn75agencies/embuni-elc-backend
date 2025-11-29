/**
 * Contact Routes
 * Handles contact information and social media links
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin, requirePermission } = require('../middleware/adminMiddleware');
const {
  getContactInfo,
  updateContactInfo
} = require('../controllers/contact.controller');

// Public route - anyone can get contact info
router.get('/', getContactInfo);

// Admin routes - only admins with CONTACT_ADMIN role can update
router.put(
  '/',
  protect,
  admin,
  requirePermission('CONTACT_ADMIN'),
  updateContactInfo
);

module.exports = router;

