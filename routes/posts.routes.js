const express = require('express');
const router = express.Router();
const { protect, optionalAuth } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');
const { createLimiter, commentLimiter } = require('../middleware/rateLimiter');

const {
  getAllPosts,
  getPostById,
  getPostBySlug,
  createPost,
  updatePost,
  deletePost,
  addComment,
  deleteComment,
  toggleLike,
  getFeaturedPosts,
  toggleFeatured,
  getPostsByAuthor,
  getPostsByCategory
} = require('../controllers/posts.controller');

// Public routes (with optional auth for admin access to drafts)
router.get('/', optionalAuth, getAllPosts);
router.get('/featured', getFeaturedPosts);
router.get('/category/:category', getPostsByCategory);
router.get('/author/:authorId', getPostsByAuthor);
router.get('/:id', optionalAuth, getPostById);
router.get('/slug/:slug', optionalAuth, getPostBySlug);

// Protected routes - User
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comments', protect, commentLimiter, addComment);
router.delete('/:id/comments/:commentId', protect, deleteComment);

// Admin/Author routes
router.post('/', protect, createLimiter, createPost);
router.put('/:id', protect, updatePost);
router.delete('/:id', protect, deletePost);
router.put('/:id/featured', protect, admin, toggleFeatured);

module.exports = router;
