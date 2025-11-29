/**
 * Candidate Routes
 * Handles candidate management
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/authMiddleware');
const { requirePermission } = require('../middleware/adminMiddleware');
const {
  addCandidate,
  updateCandidate,
  withdrawCandidate
} = require('../controllers/candidate.controller');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/candidates/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'candidate-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Standard upload for regular users
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

// Admin upload with higher limits
const adminUpload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB for admins
  },
  fileFilter: (req, file, cb) => {
    // Admins can upload more file types
    const allowedTypes = /jpeg|jpg|png|gif|webp|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /image|application\/pdf/.test(file.mimetype);

    // For admins, be lenient
    if (extname || mimetype) {
      return cb(null, true);
    } else {
      console.warn(`Admin upload: Unusual file type ${file.mimetype} for ${file.originalname}`);
      return cb(null, true); // Allow anyway for admins
    }
  }
});

// Middleware to choose upload based on user role
// NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
const chooseUpload = (req, res, next) => {
  if (req.isAdmin) {
    return adminUpload.single('photo')(req, res, next);
  }
  return upload.single('photo')(req, res, next);
};

// Routes - use admin-aware upload
router.post(
  '/positions/:positionId/candidates',
  protect,
  requirePermission('MANAGE_EVENTS'),
  chooseUpload,
  addCandidate
);

router.patch(
  '/candidates/:id',
  protect,
  requirePermission('MANAGE_EVENTS'),
  chooseUpload,
  updateCandidate
);

router.patch(
  '/candidates/:id/withdraw',
  protect,
  requirePermission('MANAGE_EVENTS'),
  withdrawCandidate
);

module.exports = router;

