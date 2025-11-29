const express = require('express');
const router = express.Router();
const internshipController = require('../controllers/internship.controller');
const { protect } = require('../middleware/auth.middleware');
const { body, param, query } = require('express-validator');

// Apply authentication middleware to all routes
router.use(protect);

// Get all internships with filtering
router.get('/',
  [
    query('status').optional().isIn(['draft', 'active', 'closed', 'filled', 'cancelled']),
    query('industry').optional().isString(),
    query('location').optional().isString(),
    query('isPaid').optional().isBoolean(),
    query('remote').optional().isBoolean(),
    query('schedule').optional().isIn(['full_time', 'part_time', 'flexible']),
    query('duration').optional().isInt({ min: 1, max: 52 }),
    query('skills').optional().isString(),
    query('featured').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['createdAt', 'applicationDeadline', 'title', 'company.name']),
    query('sortOrder').optional().isIn(['asc', 'desc'])
  ],
  internshipController.getInternships
);

// Get internship statistics
router.get('/stats', internshipController.getInternshipStats);

// Get student's applications
router.get('/my-applications',
  [
    query('status').optional().isIn(['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offered', 'accepted', 'rejected', 'withdrawn']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  internshipController.getStudentApplications
);

// Get specific internship by ID
router.get('/:id',
  [
    param('id').isMongoId().withMessage('Invalid internship ID')
  ],
  internshipController.getInternshipById
);

// Create new internship
router.post('/',
  [
    body('company.name').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Company name is required'),
    body('company.industry').isIn(['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'other']).withMessage('Valid industry is required'),
    body('company.location.city').optional().isString().trim(),
    body('company.location.remote').optional().isBoolean(),
    body('company.location.hybrid').optional().isBoolean(),
    body('company.contact.email').isEmail().withMessage('Valid contact email is required'),
    body('title').isString().trim().isLength({ min: 1, max: 200 }).withMessage('Title is required'),
    body('description').isString().trim().isLength({ min: 50, max: 5000 }).withMessage('Description must be between 50 and 5000 characters'),
    body('requirements').isArray({ min: 1 }).withMessage('At least one requirement is required'),
    body('requirements.*').isString().trim().isLength({ min: 1, max: 500 }),
    body('responsibilities').isArray({ min: 1 }).withMessage('At least one responsibility is required'),
    body('responsibilities.*').isString().trim().isLength({ min: 1, max: 500 }),
    body('skills').isArray({ min: 1 }).withMessage('At least one skill is required'),
    body('skills.*').isString().trim().isLength({ min: 1, max: 100 }),
    body('duration').isInt({ min: 1, max: 52 }).withMessage('Duration must be between 1 and 52 weeks'),
    body('startDate').isISO8601().toDate().withMessage('Valid start date is required'),
    body('endDate').isISO8601().toDate().withMessage('Valid end date is required'),
    body('schedule').optional().isIn(['full_time', 'part_time', 'flexible']),
    body('hoursPerWeek').optional().isInt({ min: 1, max: 40 }),
    body('isPaid').optional().isBoolean(),
    body('stipend.amount').optional().isFloat({ min: 0 }),
    body('stipend.currency').optional().isString().isLength({ min: 3, max: 3 }),
    body('stipend.frequency').optional().isIn(['weekly', 'monthly', 'stipend']),
    body('benefits').optional().isArray(),
    body('applicationDeadline').isISO8601().toDate().withMessage('Valid application deadline is required'),
    body('applicationMethod').optional().isIn(['portal', 'email', 'external', 'custom']),
    body('applicationUrl').optional().isURL(),
    body('applicationEmail').optional().isEmail(),
    body('requiredDocuments').optional().isArray(),
    body('targetAudience.educationLevels').optional().isArray(),
    body('targetAudience.fieldsOfStudy').optional().isArray(),
    body('targetAudience.experienceLevel').optional().isIn(['entry_level', 'some_experience', 'experienced']),
    body('targetAudience.minGpa').optional().isFloat({ min: 0, max: 4 }),
    body('targetAudience.citizenshipRequirements').optional().isArray(),
    body('targetAudience.languageRequirements').optional().isArray(),
    body('featured').optional().isBoolean(),
    body('priority').optional().isIn(['low', 'medium', 'high']),
    body('tags').optional().isArray(),
    body('seo.title').optional().isString().trim().isLength({ max: 200 }),
    body('seo.description').optional().isString().trim().isLength({ max: 500 }),
    body('seo.keywords').optional().isArray()
  ],
  internshipController.createInternship
);

// Update internship
router.put('/:id',
  [
    param('id').isMongoId().withMessage('Invalid internship ID'),
    body('company.name').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('company.industry').optional().isIn(['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'other']),
    body('title').optional().isString().trim().isLength({ min: 1, max: 200 }),
    body('description').optional().isString().trim().isLength({ min: 50, max: 5000 }),
    body('requirements').optional().isArray({ min: 1 }),
    body('responsibilities').optional().isArray({ min: 1 }),
    body('skills').optional().isArray({ min: 1 }),
    body('duration').optional().isInt({ min: 1, max: 52 }),
    body('startDate').optional().isISO8601().toDate(),
    body('endDate').optional().isISO8601().toDate(),
    body('schedule').optional().isIn(['full_time', 'part_time', 'flexible']),
    body('isPaid').optional().isBoolean(),
    body('applicationDeadline').optional().isISO8601().toDate(),
    body('status').optional().isIn(['draft', 'active', 'closed', 'filled', 'cancelled']),
    body('featured').optional().isBoolean(),
    body('priority').optional().isIn(['low', 'medium', 'high'])
  ],
  internshipController.updateInternship
);

// Delete internship
router.delete('/:id',
  [
    param('id').isMongoId().withMessage('Invalid internship ID')
  ],
  internshipController.deleteInternship
);

// Apply to internship
router.post('/:id/apply',
  [
    param('id').isMongoId().withMessage('Invalid internship ID'),
    body('resume').optional().isURL(),
    body('coverLetter').optional().isURL(),
    body('portfolio').optional().isURL(),
    body('transcript').optional().isURL(),
    body('notes').optional().isString().trim().isLength({ max: 1000 })
  ],
  internshipController.applyToInternship
);

// Get company's internship applications
router.get('/:id/applications',
  [
    param('id').isMongoId().withMessage('Invalid internship ID'),
    query('status').optional().isIn(['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offered', 'accepted', 'rejected', 'withdrawn']),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 })
  ],
  internshipController.getCompanyApplications
);

// Update application status (for companies)
router.put('/:id/applications/:studentId',
  [
    param('id').isMongoId().withMessage('Invalid internship ID'),
    param('studentId').isMongoId().withMessage('Invalid student ID'),
    body('status').isIn(['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offered', 'accepted', 'rejected', 'withdrawn']).withMessage('Valid status is required'),
    body('feedback').optional().isString().trim().isLength({ max: 2000 }),
    body('interviewDates').optional().isArray(),
    body('interviewDates.*').optional().isISO8601().toDate(),
    body('offerDetails.salary').optional().isFloat({ min: 0 }),
    body('offerDetails.startDate').optional().isISO8601().toDate(),
    body('offerDetails.benefits').optional().isArray()
  ],
  internshipController.updateApplicationStatus
);

module.exports = router;