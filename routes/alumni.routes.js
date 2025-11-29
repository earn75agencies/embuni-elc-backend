const express = require('express');
const router = express.Router();
const alumniController = require('../controllers/alumni.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');

// Apply authentication middleware to all routes
router.use(protect);

// Get all alumni with filtering
router.get('/',
  [
    query('industry').optional().isString(),
    query('graduationYear').optional().isInt({ min: 2000, max: new Date().getFullYear() + 10 }),
    query('graduationYearRange').optional().isJSON(),
    query('skills').optional().isString(),
    query('location').optional().isString(),
    query('availableForMentorship').optional().isBoolean(),
    query('openToCollaboration').optional().isBoolean(),
    query('featured').optional().isBoolean(),
    query('verified').optional().isBoolean(),
    query('includePrivate').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['graduationYear', 'lastName', 'firstName', 'company']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  alumniController.getAlumni
);

// Search alumni
router.get('/search',
  [
    query('q').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Search query is required'),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  alumniController.searchAlumni
);

// Get alumni statistics
router.get('/stats', alumniController.getAlumniStats);

// Get alumni events
router.get('/events',
  [
    query('type').optional().isIn(['reunion', 'conference', 'workshop', 'networking', 'speaking_engagement', 'other']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  alumniController.getAlumniEvents
);

// Get current user's alumni profile
router.get('/my-profile', alumniController.getMyAlumniProfile);

// Get specific alumni by ID
router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid alumni ID')
  ],
  alumniController.getAlumniById
);

// Create or update alumni profile
router.post('/profile',
  [
    body('graduationYear').isInt({ min: 2000, max: new Date().getFullYear() + 10 }).withMessage('Valid graduation year is required'),
    body('degree').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Degree is required'),
    body('fieldOfStudy').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Field of study is required'),
    body('currentPosition.title').optional().isString().trim().isLength({ max: 200 }),
    body('currentPosition.company').optional().isString().trim().isLength({ max: 200 }),
    body('currentPosition.industry').optional().isIn(['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'government', 'other']),
    body('currentPosition.startDate').optional().isISO8601().toDate(),
    body('currentPosition.description').optional().isString().trim().isLength({ max: 1000 }),
    body('skills.technical').optional().isArray(),
    body('skills.soft').optional().isArray(),
    body('skills.languages').optional().isArray(),
    body('contactInfo.email').optional().isEmail(),
    body('contactInfo.phone').optional().isString(),
    body('contactInfo.linkedin').optional().isURL(),
    body('contactInfo.twitter').optional().isString(),
    body('contactInfo.website').optional().isURL(),
    body('contactInfo.location.city').optional().isString().trim(),
    body('contactInfo.location.country').optional().isString().trim(),
    body('contactInfo.location.remote').optional().isBoolean(),
    body('networking.availableForMentorship').optional().isBoolean(),
    body('networking.mentorshipAreas').optional().isArray(),
    body('networking.willingToSpeak').optional().isBoolean(),
    body('networking.speakingTopics').optional().isArray(),
    body('networking.openToCollaboration').optional().isBoolean(),
    body('networking.collaborationInterests').optional().isArray(),
    body('networking.jobSeeking').optional().isBoolean(),
    body('networking.jobInterests').optional().isArray(),
    body('networking.networkingGoals').optional().isArray(),
    body('privacy.profileVisibility').optional().isIn(['public', 'alumni_only', 'private']),
    body('privacy.contactVisible').optional().isBoolean(),
    body('privacy.showCurrentPosition').optional().isBoolean(),
    body('privacy.showCareerHistory').optional().isBoolean(),
    body('privacy.showContactInfo').optional().isBoolean(),
    body('bio').optional().isString().trim().isLength({ max: 1000 })
  ],
  alumniController.createOrUpdateAlumniProfile
);

// Send connection request
router.post('/:id/connect',
  [
    param('id').isMongoId().withMessage('Invalid alumni ID'),
    body('message').optional().isString().trim().isLength({ max: 1000 })
  ],
  alumniController.sendConnectionRequest
);

// Respond to connection request
router.post('/:id/connect/respond',
  [
    param('id').isMongoId().withMessage('Invalid alumni ID'),
    body('action').isIn(['accept', 'decline']).withMessage('Action must be accept or decline'),
    body('message').optional().isString().trim().isLength({ max: 1000 })
  ],
  alumniController.respondToConnectionRequest
);

// Add testimonial
router.post('/:id/testimonial',
  [
    param('id').isMongoId().withMessage('Invalid alumni ID'),
    body('content').isString().trim().isLength({ min: 10, max: 2000 }).withMessage('Content must be between 10 and 2000 characters'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('relationship').isString().trim().isLength({ min: 1, max: 100 }).withMessage('Relationship is required')
  ],
  alumniController.addTestimonial
);

module.exports = router;