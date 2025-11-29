/**
 * Partner Routes
 * API endpoints for partner management
 */

const express = require('express');
const router = express.Router();
const {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerOrder,
  getPublicPartners,
  upload
} = require('../controllers/partner.controller');
const {
  authenticateToken,
  requireAdmin
} = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/requestValidator');

// Public routes
router.get('/public', getPublicPartners);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin-only routes
router.use(requireAdmin);

// GET /api/partners - Get all partners with filtering
router.get('/', getPartners);

// GET /api/partners/:id - Get partner by ID
router.get('/:id', [param('id').isMongoId()], validateRequest, getPartnerById);

// POST /api/partners - Create new partner
router.post(
  '/',
  [
    upload.single('logo'),
    body('name')
      .trim()
      .isLength({ min: 1, max: 100 })
      .withMessage('Name is required and must be 100 characters or less'),
    body('description')
      .trim()
      .isLength({ min: 1, max: 500 })
      .withMessage(
        'Description is required and must be 500 characters or less'
      ),
    body('website')
      .optional()
      .isURL()
      .withMessage('Website must be a valid URL'),
    body('type')
      .optional()
      .isIn(['sponsor', 'partner', 'collaborator'])
      .withMessage('Type must be sponsor, partner, or collaborator'),
    body('contactEmail')
      .optional()
      .isEmail()
      .withMessage('Contact email must be valid'),
    body('contactPhone').optional().isString(),
    body('status')
      .optional()
      .isIn(['active', 'inactive', 'pending'])
      .withMessage('Status must be active, inactive, or pending'),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt({ min: 0 })
  ],
  validateRequest,
  createPartner
);

// PUT /api/partners/:id - Update partner
router.put(
  '/:id',
  [
    upload.single('logo'),
    param('id').isMongoId(),
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('description').optional().trim().isLength({ min: 1, max: 500 }),
    body('website').optional().isURL(),
    body('type').optional().isIn(['sponsor', 'partner', 'collaborator']),
    body('contactEmail').optional().isEmail(),
    body('contactPhone').optional().isString(),
    body('status').optional().isIn(['active', 'inactive', 'pending']),
    body('featured').optional().isBoolean(),
    body('order').optional().isInt({ min: 0 })
  ],
  validateRequest,
  updatePartner
);

// DELETE /api/partners/:id - Delete partner
router.delete(
  '/:id',
  [param('id').isMongoId()],
  validateRequest,
  deletePartner
);

// PUT /api/partners/order - Update partner order
router.put(
  '/order',
  [
    body('partners').isArray().withMessage('Partners must be an array'),
    body('partners.*.id')
      .isMongoId()
      .withMessage('Each partner must have a valid ID'),
    body('partners.*.order')
      .isInt({ min: 0 })
      .withMessage('Order must be a non-negative integer')
  ],
  validateRequest,
  updatePartnerOrder
);

module.exports = router;
