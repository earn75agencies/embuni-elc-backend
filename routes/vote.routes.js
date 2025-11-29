/**
 * Vote Routes
 * Handles voting operations
 */

const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { recaptcha } = require('../middleware/recaptchaMiddleware');
const {
  validateVotingLink,
  submitVote,
  getResults,
  getLiveResults
} = require('../controllers/vote.controller');

// Public routes (with optional auth)
router.post(
  '/validate-link',
  recaptcha({ required: false }),
  validateVotingLink
);

router.get(
  '/results/:electionId',
  optionalAuth,
  getResults
);

router.get(
  '/live/:electionId',
  optionalAuth,
  getLiveResults
);

// Protected routes
router.post(
  '/submit',
  recaptcha({ required: true, version: 'v3', action: 'vote', score_threshold: 0.4 }),
  submitVote
);

module.exports = router;

