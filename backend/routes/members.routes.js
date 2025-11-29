const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { admin } = require('../middleware/adminMiddleware');

const {
  getAllMembers,
  getMemberById,
  getMemberByUserId,
  updateMember,
  getMemberStats,
  getLeadershipTeam,
  promoteToLeadership,
  demoteFromLeadership,
  addVolunteerHours,
  awardBadge,
  getLeaderboard,
  searchMembers
} = require('../controllers/members.controller');

// Public routes
router.get('/', getAllMembers);
router.get('/leadership/team', getLeadershipTeam);
router.get('/leaderboard', getLeaderboard);
router.get('/search/:query', searchMembers);
router.get('/:id', getMemberById);
router.get('/user/:userId', getMemberByUserId);
router.get('/:id/stats', getMemberStats);

// Protected routes - User
router.put('/:id', protect, updateMember);

// Admin routes
router.put('/:id/promote', protect, admin, promoteToLeadership);
router.put('/:id/demote', protect, admin, demoteFromLeadership);
router.put('/:id/volunteer-hours', protect, admin, addVolunteerHours);
router.post('/:id/badge', protect, admin, awardBadge);

module.exports = router;
