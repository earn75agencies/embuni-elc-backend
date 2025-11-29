/**
 * Design Settings Routes
 * API endpoints for design settings management
 */

const express = require('express');
const router = express.Router();
const {
  getDesignSettings,
  updateDesignSettings,
  updateBannerSettings,
  updateHeroSettings,
  updateFooterSettings,
  updateColorScheme,
  updateAnnouncementSettings,
  resetDesignSettings,
  upload
} = require('../controllers/designSettings.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { body, param } = require('express-validator');
const { validateRequest } = require('../middleware/requestValidator');

// Public routes
router.get('/public', getDesignSettings);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin-only routes
router.use(requireAdmin);

// GET /api/design-settings - Get design settings
router.get('/', getDesignSettings);

// PUT /api/design-settings - Update all design settings
router.put('/', [
  upload.fields([
    { name: 'bannerBackgroundImage', maxCount: 1 },
    { name: 'heroImage', maxCount: 1 }
  ]),
  body('banner.title').optional().trim().isLength({ max: 200 }),
  body('banner.subtitle').optional().trim().isLength({ max: 500 }),
  body('banner.ctaText').optional().trim().isLength({ max: 100 }),
  body('banner.ctaLink').optional().trim().isLength({ max: 200 }),
  body('hero.title').optional().trim().isLength({ max: 200 }),
  body('hero.subtitle').optional().trim().isLength({ max: 500 }),
  body('footer.description').optional().trim().isLength({ max: 1000 }),
  body('footer.copyright').optional().trim().isLength({ max: 200 }),
  body('footer.quickLinks').optional().isArray(),
  body('footer.quickLinks.*.text').optional().trim().isLength({ min: 1, max: 100 }),
  body('footer.quickLinks.*.url').optional().isURL(),
  body('footer.quickLinks.*.order').optional().isInt({ min: 0 }),
  body('footer.socialLinks.facebook').optional().isURL(),
  body('footer.socialLinks.twitter').optional().isURL(),
  body('footer.socialLinks.instagram').optional().isURL(),
  body('footer.socialLinks.linkedin').optional().isURL(),
  body('footer.socialLinks.youtube').optional().isURL(),
  body('colors.primary').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('colors.secondary').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('colors.accent').optional().matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/),
  body('announcements.enabled').optional().isBoolean(),
  body('announcements.defaultText').optional().trim().isLength({ max: 200 })
], validateRequest, updateDesignSettings);

// PUT /api/design-settings/banner - Update banner settings
router.put('/banner', [
  upload.single('bannerBackgroundImage'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('subtitle').optional().trim().isLength({ max: 500 }),
  body('ctaText').optional().trim().isLength({ max: 100 }),
  body('ctaLink').optional().trim().isLength({ max: 200 })
], validateRequest, updateBannerSettings);

// PUT /api/design-settings/hero - Update hero settings
router.put('/hero', [
  upload.single('heroImage'),
  body('title').optional().trim().isLength({ max: 200 }),
  body('subtitle').optional().trim().isLength({ max: 500 })
], validateRequest, updateHeroSettings);

// PUT /api/design-settings/footer - Update footer settings
router.put('/footer', [
  body('description').optional().trim().isLength({ max: 1000 }),
  body('copyright').optional().trim().isLength({ max: 200 }),
  body('quickLinks').optional().isArray(),
  body('quickLinks.*.text').optional().trim().isLength({ min: 1, max: 100 }),
  body('quickLinks.*.url').optional().isURL(),
  body('quickLinks.*.order').optional().isInt({ min: 0 }),
  body('socialLinks.facebook').optional().isURL(),
  body('socialLinks.twitter').optional().isURL(),
  body('socialLinks.instagram').optional().isURL(),
  body('socialLinks.linkedin').optional().isURL(),
  body('socialLinks.youtube').optional().isURL()
], validateRequest, updateFooterSettings);

// PUT /api/design-settings/colors - Update color scheme
router.put('/colors', [
  body('primary').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Primary color must be a valid hex color'),
  body('secondary').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Secondary color must be a valid hex color'),
  body('accent').matches(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/).withMessage('Accent color must be a valid hex color')
], validateRequest, updateColorScheme);

// PUT /api/design-settings/announcements - Update announcement settings
router.put('/announcements', [
  body('enabled').isBoolean().withMessage('Enabled must be a boolean'),
  body('defaultText').optional().trim().isLength({ max: 200 }).withMessage('Default text must be 200 characters or less')
], validateRequest, updateAnnouncementSettings);

// POST /api/design-settings/reset - Reset design settings to defaults
router.post('/reset', resetDesignSettings);

module.exports = router;
