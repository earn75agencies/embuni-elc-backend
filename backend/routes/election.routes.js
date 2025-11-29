/**
 * Election Routes
 * Handles election management endpoints
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/adminMiddleware');
const { recaptcha } = require('../middleware/recaptchaMiddleware');
const {
  createElection,
  approveElection,
  startElection,
  closeElection,
  getElection,
  listElections,
  exportResults
} = require('../controllers/election.controller');

// Public routes
router.get('/', listElections);
router.get('/:id', getElection);

// Chapter Admin routes
router.post(
  '/',
  protect,
  requirePermission('MANAGE_EVENTS'),
  recaptcha({ required: false }),
  createElection
);

// Super Admin routes
router.patch(
  '/:id/approve',
  protect,
  requirePermission('MANAGE_ADMINS'),
  approveElection
);

// Admin routes (chapter admin or super admin)
router.patch(
  '/:id/start',
  protect,
  requirePermission('MANAGE_EVENTS'),
  startElection
);

router.patch(
  '/:id/close',
  protect,
  requirePermission('MANAGE_EVENTS'),
  closeElection
);

router.get(
  '/:id/export',
  protect,
  requirePermission('VIEW_REPORTS'),
  exportResults
);

module.exports = router;

