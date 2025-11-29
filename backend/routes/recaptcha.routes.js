/**
 * reCAPTCHA Routes
 * Provides reCAPTCHA configuration to frontend
 */

const express = require('express');
const router = express.Router();
const { getRecaptchaConfig } = require('../middleware/recaptchaMiddleware');

/**
 * GET /api/recaptcha/config
 * Get reCAPTCHA configuration for frontend
 */
router.get('/config', (req, res) => {
  try {
    const config = getRecaptchaConfig();

    res.json({
      success: true,
      data: {
        enabled: config.enabled,
        siteKey: config.siteKey,
        version: config.version,
        v3ScoreThreshold: config.v3ScoreThreshold
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get reCAPTCHA configuration',
      error: error.message
    });
  }
});

module.exports = router;

