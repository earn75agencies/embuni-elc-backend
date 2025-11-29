const express = require('express');
const router = express.Router();
const mentorshipController = require('../controllers/mentorship.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');

// Apply authentication middleware to all routes
router.use(protect);

// Get all mentorships for the current user
router.get('/',
  [
    query('status').optional().isIn(['pending', 'active', 'completed', 'cancelled', 'on_hold']),
    query('role').optional().isIn(['mentor', 'mentee'])
  ],
  mentorshipController.getMentorships
);

// Get mentorship statistics
router.get('/stats', mentorshipController.getMentorshipStats);

// Find potential mentors
router.get('/find-mentors',
  [
    query('interests').optional().isString(),
    query('industry').optional().isString(),
    query('experienceLevel').optional().isString(),
    query('skills').optional().isString(),
    query('careerGoals').optional().isString(),
    query('limit').optional().isInt({ min: 1, max: 50 }),
    query('offset').optional().isInt({ min: 0 })
  ],
  mentorshipController.findMentors
);

// Get specific mentorship by ID
router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid mentorship ID')
  ],
  mentorshipController.getMentorshipById
);

// Send mentorship request
router.post('/request',
  [
    body('mentorId').isMongoId().withMessage('Invalid mentor ID'),
    body('goals').optional().isArray(),
    body('goals.*.title').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('goals.*.description').optional().isString().trim().isLength({ max: 1000 }),
    body('goals.*.targetDate').optional().isISO8601().toDate(),
    body('message').optional().isString().trim().isLength({ max: 1000 }),
    body('matchingCriteria').optional().isObject(),
    body('matchingCriteria.interests').optional().isArray(),
    body('matchingCriteria.skills').optional().isArray(),
    body('matchingCriteria.industry').optional().isString().trim(),
    body('matchingCriteria.experienceLevel').optional().isString().trim()
  ],
  mentorshipController.sendMentorshipRequest
);

// Respond to mentorship request
router.post('/:id/respond',
  [
    param('id').isMongoId().withMessage('Invalid mentorship ID'),
    body('action').isIn(['accept', 'decline']).withMessage('Action must be accept or decline'),
    body('message').optional().isString().trim().isLength({ max: 1000 })
  ],
  mentorshipController.respondToRequest
);

// Schedule a mentorship session
router.post('/:id/sessions',
  [
    param('id').isMongoId().withMessage('Invalid mentorship ID'),
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
    body('description').optional().isString().trim().isLength({ max: 1000 }),
    body('scheduledDate').isISO8601().toDate().withMessage('Valid scheduled date is required'),
    body('duration').isInt({ min: 15, max: 480 }).withMessage('Duration must be between 15 and 480 minutes'),
    body('meetingType').optional().isIn(['in_person', 'video', 'phone', 'email']).withMessage('Invalid meeting type'),
    body('meetingLink').optional().isURL().withMessage('Meeting link must be a valid URL')
  ],
  mentorshipController.scheduleSession
);

// Update goal progress
router.put('/:id/goals/:goalId',
  [
    param('id').isMongoId().withMessage('Invalid mentorship ID'),
    param('goalId').isMongoId().withMessage('Invalid goal ID'),
    body('progress').optional().isInt({ min: 0, max: 100 }).withMessage('Progress must be between 0 and 100'),
    body('status').optional().isIn(['not_started', 'in_progress', 'completed', 'cancelled']).withMessage('Invalid status'),
    body('notes').optional().isString().trim().isLength({ max: 1000 })
  ],
  mentorshipController.updateGoalProgress
);

// Submit feedback
router.post('/:id/feedback',
  [
    param('id').isMongoId().withMessage('Invalid mentorship ID'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comments').optional().isString().trim().isLength({ max: 1000 }),
    body('category').optional().isIn(['communication', 'expertise', 'supportiveness', 'overall']).withMessage('Invalid category')
  ],
  mentorshipController.submitFeedback
);

module.exports = router;