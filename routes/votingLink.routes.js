/**
 * Voting Link Routes
 * Handles voting link generation and management
 */

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/adminMiddleware');
const {
  generateVotingLinks,
  getVotingLinks
} = require('../controllers/votingLink.controller');

// Generate voting links (Admin only)
router.post(
  '/generate',
  protect,
  requirePermission('MANAGE_MEMBERS'),
  generateVotingLinks
);

// Get voting links for election
router.get(
  '/elections/:electionId',
  protect,
  requirePermission('VIEW_REPORTS'),
  getVotingLinks
);

module.exports = router;

