/**
 * Testimonial Routes
 * API endpoints for testimonial management
 */

const express = require('express');
const router = express.Router();
const {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  rejectTestimonial,
  updateTestimonialOrder,
  getPublicTestimonials,
  getPendingTestimonials,
  upload
} = require('../controllers/testimonial.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/requestValidator');

// Public routes
router.get('/public', getPublicTestimonials);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin-only routes
router.use(requireAdmin);

// GET /api/testimonials - Get all testimonials with filtering
router.get('/', [
  query('status').optional().isIn(['pending', 'approved', 'rejected', 'all']),
  query('authorRole').optional().isIn(['student', 'alumni', 'partner', 'faculty', 'all']),
  query('featured').optional().isBoolean(),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validateRequest, getTestimonials);

// GET /api/testimonials/pending - Get pending testimonials for review
router.get('/pending', getPendingTestimonials);

// GET /api/testimonials/:id - Get testimonial by ID
router.get('/:id', [
  param('id').isMongoId()
], validateRequest, getTestimonialById);

// POST /api/testimonials - Create new testimonial
router.post('/', [
  upload.single('authorImage'),
  body('authorName').trim().isLength({ min: 1, max: 100 }).withMessage('Author name is required and must be 100 characters or less'),
  body('authorRole').isIn(['student', 'alumni', 'partner', 'faculty']).withMessage('Author role is required'),
  body('authorTitle').optional().trim().isLength({ max: 150 }),
  body('authorOrganization').optional().trim().isLength({ max: 150 }),
  body('content').trim().isLength({ min: 1, max: 1000 }).withMessage('Content is required and must be 1000 characters or less'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Status must be pending, approved, or rejected'),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 })
], validateRequest, createTestimonial);

// PUT /api/testimonials/:id - Update testimonial
router.put('/:id', [
  upload.single('authorImage'),
  param('id').isMongoId(),
  body('authorName').optional().trim().isLength({ min: 1, max: 100 }),
  body('authorRole').optional().isIn(['student', 'alumni', 'partner', 'faculty']),
  body('authorTitle').optional().trim().isLength({ max: 150 }),
  body('authorOrganization').optional().trim().isLength({ max: 150 }),
  body('content').optional().trim().isLength({ min: 1, max: 1000 }),
  body('rating').optional().isInt({ min: 1, max: 5 }),
  body('status').optional().isIn(['pending', 'approved', 'rejected']),
  body('featured').optional().isBoolean(),
  body('order').optional().isInt({ min: 0 })
], validateRequest, updateTestimonial);

// DELETE /api/testimonials/:id - Delete testimonial
router.delete('/:id', [
  param('id').isMongoId()
], validateRequest, deleteTestimonial);

// PUT /api/testimonials/:id/approve - Approve testimonial
router.put('/:id/approve', [
  param('id').isMongoId(),
  body('reviewNotes').optional().trim().isLength({ max: 500 })
], validateRequest, approveTestimonial);

// PUT /api/testimonials/:id/reject - Reject testimonial
router.put('/:id/reject', [
  param('id').isMongoId(),
  body('reviewNotes').optional().trim().isLength({ max: 500 })
], validateRequest, rejectTestimonial);

// PUT /api/testimonials/order - Update testimonial order
router.put('/order', [
  body('testimonials').isArray().withMessage('Testimonials must be an array'),
  body('testimonials.*.id').isMongoId().withMessage('Each testimonial must have a valid ID'),
  body('testimonials.*.order').isInt({ min: 0 }).withMessage('Order must be a non-negative integer')
], validateRequest, updateTestimonialOrder);

module.exports = router;
