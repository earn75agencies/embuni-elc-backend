const express = require('express');
const router = express.Router();
const {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addGroupMember,
  removeGroupMember,
  updateMemberRole,
  getGroupActivity,
  getGroupMembers
} = require('../controllers/adminGroup.controller');
const { protect, authorize } = require('../middleware/auth.middleware');

// Protect all routes with authentication
router.use(protect);

/**
 * @route   POST /api/admin/groups
 * @desc    Create a new admin group
 * @access  Private/Admin
 */
router.post('/', authorize('super_admin'), createGroup);

/**
 * @route   GET /api/admin/groups
 * @desc    Get all admin groups
 * @access  Private/Admin
 */
router.get('/', authorize('admin'), getAllGroups);

/**
 * @route   GET /api/admin/groups/:id
 * @desc    Get single group by ID
 * @access  Private/Admin
 */
router.get('/:id', authorize('admin'), getGroupById);

/**
 * @route   PUT /api/admin/groups/:id
 * @desc    Update group
 * @access  Private/Admin
 */
router.put('/:id', authorize('admin'), updateGroup);

/**
 * @route   DELETE /api/admin/groups/:id
 * @desc    Delete group
 * @access  Private/Admin
 */
router.delete('/:id', authorize('admin'), deleteGroup);

/**
 * @route   POST /api/admin/groups/:id/members
 * @desc    Add member to group
 * @access  Private/Admin
 */
router.post('/:id/members', authorize('admin'), addGroupMember);

/**
 * @route   DELETE /api/admin/groups/:id/members/:memberId
 * @desc    Remove member from group
 * @access  Private/Admin
 */
router.delete('/:id/members/:memberId', authorize('admin'), removeGroupMember);

/**
 * @route   PUT /api/admin/groups/:id/members/:memberId/role
 * @desc    Update member role
 * @access  Private/Admin
 */
router.put('/:id/members/:memberId/role', authorize('admin'), updateMemberRole);

/**
 * @route   GET /api/admin/groups/:id/activity
 * @desc    Get group activity
 * @access  Private/Admin
 */
router.get('/:id/activity', authorize('admin'), getGroupActivity);

/**
 * @route   GET /api/admin/groups/:id/members
 * @desc    Get group members
 * @access  Private/Admin
 */
router.get('/:id/members', authorize('admin'), getGroupMembers);

module.exports = router;
