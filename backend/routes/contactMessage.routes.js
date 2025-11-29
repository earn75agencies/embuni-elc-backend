/**
 * Contact Message Routes
 * API endpoints for contact form submissions and message management
 */

const express = require('express');
const router = express.Router();
const {
  submitMessage,
  getMessages,
  getMessageById,
  respondToMessage,
  updateMessageStatus,
  deleteMessage,
  getPendingMessages,
  getMessageStats
} = require('../controllers/contactMessage.controller');
const { authenticateToken, requireAdmin } = require('../middleware/authMiddleware');
const { body, param, query } = require('express-validator');
const { validateRequest } = require('../middleware/requestValidator');
const { contactLimiter } = require('../middleware/rateLimiter');
const { sanitizeBody, schemas } = require('../middleware/inputSanitizer');

// Public routes
router.post('/message',
  contactLimiter,
  sanitizeBody(schemas.contact),
  [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name is required and must be 100 characters or less'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('phone').optional().trim().isLength({ max: 20 }).withMessage('Phone number must be 20 characters or less'),
    body('subject').trim().isLength({ min: 1, max: 200 }).withMessage('Subject is required and must be 200 characters or less'),
    body('message').trim().isLength({ min: 1, max: 2000 }).withMessage('Message is required and must be 2000 characters or less'),
    body('category').optional().isIn(['general', 'membership', 'partnership', 'technical', 'feedback', 'other']),
    body('priority').optional().isIn(['low', 'medium', 'high', 'urgent'])
  ],
  validateRequest,
  submitMessage
);

// Protected routes (require authentication)
router.use(authenticateToken);

// Admin-only routes
router.use(requireAdmin);

// GET /api/contact/messages - Get all contact messages with filtering
router.get('/messages', [
  query('status').optional().isIn(['pending', 'in-progress', 'resolved', 'closed', 'all']),
  query('category').optional().isIn(['general', 'membership', 'partnership', 'technical', 'feedback', 'other', 'all']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent', 'all']),
  query('search').optional().isString(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], validateRequest, getMessages);

// GET /api/contact/messages/pending - Get pending messages
router.get('/messages/pending', getPendingMessages);

// GET /api/contact/messages/stats - Get message statistics
router.get('/messages/stats', getMessageStats);

// GET /api/contact/messages/:id - Get message by ID
router.get('/messages/:id', [
  param('id').isMongoId()
], validateRequest, getMessageById);

// PUT /api/contact/messages/:id/respond - Respond to message
router.put('/messages/:id/respond', [
  param('id').isMongoId(),
  body('response').trim().isLength({ min: 1, max: 2000 }).withMessage('Response is required and must be 2000 characters or less'),
  body('internalNotes').optional().trim().isLength({ max: 1000 })
], validateRequest, respondToMessage);

// PUT /api/contact/messages/:id/status - Update message status
router.put('/messages/:id/status', [
  param('id').isMongoId(),
  body('status').isIn(['pending', 'in-progress', 'resolved', 'closed']).withMessage('Status must be pending, in-progress, resolved, or closed'),
  body('internalNotes').optional().trim().isLength({ max: 1000 })
], validateRequest, updateMessageStatus);

// DELETE /api/contact/messages/:id - Delete message
router.delete('/messages/:id', [
  param('id').isMongoId()
], validateRequest, deleteMessage);

module.exports = router;
