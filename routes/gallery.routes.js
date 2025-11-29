const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createLimiter } = require('../middleware/rateLimiter');

const {
  getAllGalleryItems,
  getGalleryItemById,
  createGalleryItem,
  updateGalleryItem,
  deleteGalleryItem,
  toggleLike,
  getPendingItems,
  approveItem,
  rejectItem,
  getByCategory
} = require('../controllers/gallery.controller');

// Public routes
router.get('/', getAllGalleryItems);
router.get('/category/:category', getByCategory);
router.get('/:id', getGalleryItemById);

// Protected routes - User
router.post('/:id/like', protect, toggleLike);
router.post('/', protect, createLimiter, createGalleryItem);
router.put('/:id', protect, updateGalleryItem);
router.delete('/:id', protect, deleteGalleryItem);

// Admin routes
router.get('/pending', protect, admin, getPendingItems);
router.put('/:id/approve', protect, admin, approveItem);
router.put('/:id/reject', protect, admin, rejectItem);

module.exports = router;
