const express = require('express');
const router = express.Router();
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getUserEnrollments,
  getEnrollmentById,
  updateProgress,
  getCourseProgress,
  submitAssessment,
  getCourseAnalytics
} = require('../controllers/course.controller');
const { protect } = require('../middleware/auth.middleware');

// Public routes
router.get('/', getAllCourses);
router.get('/:id', getCourseById);

// Protected routes
router.use(protect);

// Course management
router.post('/', createCourse);
router.put('/:id', updateCourse);
router.delete('/:id', deleteCourse);

// Enrollment routes
router.post('/enroll', enrollInCourse);
router.get('/enrollments/my', getUserEnrollments);
router.get('/enrollments/:id', getEnrollmentById);

// Progress routes
router.post('/progress', updateProgress);
router.get('/:courseId/progress', getCourseProgress);

// Assessment routes
router.post('/assessments/submit', submitAssessment);

// Analytics routes
router.get('/:courseId/analytics', getCourseAnalytics);

module.exports = router;