const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/events/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Standard upload for regular users
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
    }
  }
});

// Admin upload with higher limits and more lenient file types
const adminUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for admins
  },
  fileFilter: (req, file, cb) => {
    // Admins can upload more file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|application\/pdf|application\/msword|application\/vnd\.openxmlformats-officedocument\.wordprocessingml\.document/.test(file.mimetype);

    // For admins, be more lenient - allow if extension OR mimetype matches
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      // Still allow for admins but log warning
      console.warn(`Admin upload: Unusual file type ${file.mimetype} for ${file.originalname}`);
      return cb(null, true); // Allow anyway for admins
    }
  }
});

// Middleware to choose upload based on user role
const chooseUpload = (req, res, next) => {
  // Check if user is admin
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (req.isAdmin) {
    return adminUpload.single('coverImage')(req, res, next);
  }
  return upload.single('coverImage')(req, res, next);
};

const {
  getAllEvents,
  getEventById,
  createEvent,
  updateEvent,
  deleteEvent,
  registerForEvent,
  unregisterFromEvent,
  markAttended,
  toggleLike,
  getEventsByOrganizer,
  getUserRegisteredEvents
} = require('../controllers/events.controller');

// Public routes
router.get('/', getAllEvents);
router.get('/featured', (req, res, next) => {
  req.query.featured = 'true';
  next();
}, getAllEvents);
router.get('/:id', getEventById);

// Protected routes - User
router.post('/:id/register', protect, registerForEvent);
router.post('/:id/unregister', protect, unregisterFromEvent);
router.post('/:id/like', protect, toggleLike);

// User dashboard routes
router.get('/user/registered', protect, getUserRegisteredEvents);

// Admin/Organizer routes - use admin-aware upload
router.post('/', protect, createLimiter, chooseUpload, createEvent);
router.put('/:id', protect, chooseUpload, updateEvent);
router.delete('/:id', protect, deleteEvent);
router.post('/:id/mark-attended/:userId', protect, markAttended);

// Get events by organizer
router.get('/organizer/:userId', getEventsByOrganizer);

module.exports = router;
