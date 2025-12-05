/**
 * Admin Controller
 * Handles all admin-related operations including profile management,
 * admin creation, role management, and activity logging
 *
 * @module controllers/admin.controller
 */

const Admin = require('../models/Admin');
const User = require('../models/User');
const Event = require('../models/Event');
const Post = require('../models/Post');
const Member = require('../models/Member');
const GalleryItem = require('../models/GalleryItem');
const Notification = require('../models/Notification');
const Election = require('../models/Election');
const Candidate = require('../models/Candidate');
const Position = require('../models/Position');
const Vote = require('../models/Vote');
const VotingLog = require('../models/VotingLog');
const VotingLink = require('../models/VotingLink');
const ContactInfo = require('../models/ContactInfo');
const { APIError, asyncHandler } = require('../middleware/error.middleware');
const { ROLE_PERMISSIONS } = require('../constants/adminRoles');
const logger = require('../utils/logger');
const cache = require('../utils/cache');

// Department mapping - must use valid enum values from Admin model:
// ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration']
const roleDepartmentMap = {
  super_admin: 'Executive',
  design_admin: 'Administration',    // Home page
  about_admin: 'Administration',      // About page
  programs_admin: 'Administration',   // Programs page
  events_admin: 'Events',             // Events page
  content_admin: 'Administration',   // News page
  gallery_admin: 'Administration',    // Gallery page
  resources_admin: 'Administration',  // Resources page
  contact_admin: 'Communications'     // Contact page
};

/**
 * Resolves department for a given admin role
 * @param {string} role - Admin role
 * @param {string} fallback - Fallback department if provided
 * @returns {string} Department name
 */
const resolveDepartment = (role, fallback) => {
  if (fallback) return fallback;
  return roleDepartmentMap[role] || 'Administration';
};

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin)
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  try {
    // Get counts for various entities
    const [
      totalUsers,
      totalAdmins,
      activeEvents,
      totalPosts,
      totalMembers,
      pendingApprovals
    ] = await Promise.all([
      User.countDocuments(),
      Admin.countDocuments({ isActive: true }),
      Event.countDocuments({ status: 'active' }),
      Post.countDocuments({ status: 'published' }),
      Member.countDocuments({ status: 'active' }),
      // Add other counts as needed
      Admin.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$adminRole', count: { $sum: 1 } } }
      ])
    ]);

    // Get recent activities
    const activities = await Admin.aggregate([
      { $match: { isActive: true } },
      { $sort: { lastActivity: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: 'user',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
          role: '$adminRole',
          lastActivity: 1,
          status: 1
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        counts: {
          totalUsers,
          totalAdmins,
          activeEvents,
          totalPosts,
          totalMembers,
          pendingApprovals
        },
        recentActivity: activities,
      }
    });
  } catch (error) {
    logger.error('Error fetching dashboard stats:', error);
    throw new APIError('Failed to fetch dashboard statistics', 500);
  }
});

/**
 * Get admin profile
 * @route GET /api/admin/profile
 * @access Private (Admin)
 */
exports.getAdminProfile = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findOne({ user: req.user.id })
      .populate('user', 'firstName lastName email avatar')
      .select('-__v -createdAt -updatedAt');

    if (!admin) {
      throw new APIError('Admin profile not found', 404);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Error fetching admin profile:', error);
    throw new APIError('Failed to fetch admin profile', 500);
  }
});

/**
 * Update admin profile
 * @route PUT /api/admin/profile
 * @access Private (Admin)
 */
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  try {
    const { firstName, lastName, avatar, phone } = req.body;
    const updates = {};

    if (firstName || lastName) {
      updates.user = {};
      if (firstName) updates.user.firstName = firstName;
      if (lastName) updates.user.lastName = lastName;
      if (avatar) updates.user.avatar = avatar;
      if (phone) updates.phone = phone;
    }

    const admin = await Admin.findOneAndUpdate(
      { user: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email avatar');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Error updating admin profile:', error);
    throw new APIError('Failed to update admin profile', 500);
  }
});

/**
 * Get all admins
 * @route GET /api/admin
 * @access Private (Super Admin)
 */
exports.getAllAdmins = asyncHandler(async (req, res) => {
  try {
    const { role, isActive, page = 1, limit = 10, search } = req.query;
    const query = {};

    // Build query based on filters
    if (role) query.role = role;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (search) {
      query.$or = [
        { 'user.firstName': { $regex: search, $options: 'i' } },
        { 'user.lastName': { $regex: search, $options: 'i' } },
        { 'user.email': { $regex: search, $options: 'i' } }
      ];
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { createdAt: -1 },
      populate: {
        path: 'user',
        select: 'firstName lastName email avatar'
      }
    };

    const admins = await Admin.paginate(query, options);

    res.status(200).json({
      success: true,
      data: admins.docs,
      pagination: {
        total: admins.totalDocs,
        pages: admins.totalPages,
        page: admins.page,
        limit: admins.limit
      }
    });
  } catch (error) {
    logger.error('Error fetching admins:', error);
    throw new APIError('Failed to fetch admins', 500);
  }
});

/**
 * Get admin by ID
 * @route GET /api/admin/:adminId
 * @access Private (Super Admin)
 */
exports.getAdminById = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId)
      .populate('user', 'firstName lastName email avatar')
      .select('-__v');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    // Check permissions (only super admin or the admin themselves can view)
    if (req.user.role !== 'super_admin' && admin.user._id.toString() !== req.user.id) {
      throw new APIError('Not authorized to view this admin', 403);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error(`Error fetching admin with ID ${req.params.adminId}:`, error);
    throw new APIError('Failed to fetch admin', 500);
  }
});

/**
 * Create new admin (Super Admin only)
 * @route POST /api/admin
 * @access Private (Super Admin)
 */
exports.createAdmin = asyncHandler(async (req, res) => {
  try {
    const { userId, adminRole, department, permissions } = req.body;

    // Validate input
    if (!userId || !adminRole) {
      throw new APIError('User ID and admin role are required', 400);
    }

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new APIError('User not found', 404);
    }

    // Check if user is already an admin
    const existingAdmin = await Admin.findOne({ user: userId });
    if (existingAdmin) {
      throw new APIError('User is already an admin', 400);
    }

    // Create admin
    const admin = await Admin.create({
      user: userId,
      adminRole,
      department: department || resolveDepartment(adminRole),
      permissions: permissions || [],
      isActive: true,
      createdBy: req.user.id
    });

    // Update user role if needed
    if (!user.roles.includes('admin')) {
      user.roles.push('admin');
      await user.save();
    }

    const populatedAdmin = await Admin.findById(admin._id)
      .populate('user', 'firstName lastName email');

    res.status(201).json({
      success: true,
      data: populatedAdmin
    });
  } catch (error) {
    logger.error('Error creating admin:', error);
    throw new APIError('Failed to create admin', 500);
  }
});

/**
 * Update admin (Super Admin only)
 * @route PUT /api/admin/:adminId
 * @access Private (Super Admin)
 */
exports.updateAdmin = asyncHandler(async (req, res) => {
  try {
    const { adminRole, department, permissions, isActive } = req.body;
    const updates = {};

    if (adminRole) updates.adminRole = adminRole;
    if (department) updates.department = department;
    if (permissions) updates.permissions = permissions;
    if (typeof isActive === 'boolean') updates.isActive = isActive;

    const admin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { $set: updates },
      { new: true, runValidators: true }
    ).populate('user', 'firstName lastName email');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Error updating admin:', error);
    throw new APIError('Failed to update admin', 500);
  }
});

/**
 * Delete admin (Super Admin only)
 * @route DELETE /api/admin/:adminId
 * @access Private (Super Admin)
 */
exports.deleteAdmin = asyncHandler(async (req, res) => {
  try {
    const admin = await Admin.findById(req.params.adminId);
    
    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    // Don't allow deleting yourself
    if (admin.user.toString() === req.user.id) {
      throw new APIError('Cannot delete your own admin account', 400);
    }

    await Admin.findByIdAndDelete(req.params.adminId);

    // Optionally, remove admin role from user
    await User.findByIdAndUpdate(admin.user, {
      $pull: { roles: 'admin' }
    });

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error('Error deleting admin:', error);
    throw new APIError('Failed to delete admin', 500);
  }
});

/**
 * Get admin activity logs
 * @route GET /api/admin/logs/activity
 * @access Private (View Logs Permission)
 */
exports.getActivityLogs = asyncHandler(async (req, res) => {
  try {
    const { action, adminId, startDate, endDate, page = 1, limit = 20 } = req.query;
    const query = {};

    // Build query based on filters
    if (action) query.action = action;
    if (adminId) query.admin = adminId;
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.timestamp.$lte = end;
      }
    }

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sort: { timestamp: -1 },
      populate: {
        path: 'admin',
        select: 'user',
        populate: {
          path: 'user',
          select: 'firstName lastName email'
        }
      }
    };

    const logs = await Admin.paginate(query, options);

    res.status(200).json({
      success: true,
      data: logs.docs,
      pagination: {
        total: logs.totalDocs,
        pages: logs.totalPages,
        page: logs.page,
        limit: logs.limit
      }
    });
  } catch (error) {
    logger.error('Error fetching activity logs:', error);
    throw new APIError('Failed to fetch activity logs', 500);
  }
});

/**
 * Get admin statistics
 * @route GET /api/admin/stats/roles
 * @access Private (View Admin Stats Permission)
 */
exports.getAdminStats = asyncHandler(async (req, res) => {
  try {
    // Get admin count by role
    const roleStats = await Admin.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$adminRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // Get admin activity stats
    const activityStats = await Admin.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          role: '$adminRole',
          lastActivity: 1,
          isActive: 1,
          daysSinceLastActivity: {
            $divide: [
              { $subtract: [new Date(), '$lastActivity'] },
              1000 * 60 * 60 * 24 // Convert to days
            ]
          }
        }
      },
      {
        $group: {
          _id: '$role',
          total: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $lt: ['$daysSinceLastActivity', 7] }, 1, 0] // Active if last activity < 7 days
            }
          },
          inactive: {
            $sum: {
              $cond: [{ $gte: ['$daysSinceLastActivity', 7] }, 1, 0]
            }
          }
        }
      }
    ]);

    res.status(200).json({
      success: true,
      data: {
        roleStats,
        activityStats
      }
    });
  } catch (error) {
    logger.error('Error fetching admin statistics:', error);
    throw new APIError('Failed to fetch admin statistics', 500);
  }
});

/**
 * Update admin status (activate/deactivate)
 * @route PATCH /api/admin/:adminId/status
 * @access Private (Manage Admins Permission)
 */
exports.updateAdminStatus = asyncHandler(async (req, res) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== 'boolean') {
      throw new APIError('Invalid status value', 400);
    }

    // Don't allow deactivating yourself
    if (req.params.adminId === req.user.id) {
      throw new APIError('Cannot deactivate your own account', 400);
    }

    const admin = await Admin.findByIdAndUpdate(
      req.params.adminId,
      { isActive },
      { new: true }
    ).populate('user', 'firstName lastName email');

    if (!admin) {
      throw new APIError('Admin not found', 404);
    }

    res.status(200).json({
      success: true,
      data: admin
    });
  } catch (error) {
    logger.error('Error updating admin status:', error);
    throw new APIError('Failed to update admin status', 500);
  }
});
};

/**
 * Get admin dashboard statistics
 * @route GET /api/admin/dashboard/stats
 * @access Private (Admin)
 * @returns {Object} Dashboard statistics including user counts, event counts, etc.
 */
exports.getDashboardStats = asyncHandler(async (req, res) => {
  // Use req.admin if available (from ensureAdminProfile middleware), otherwise fetch
  const admin = req.admin || await Admin.findOne({ user: req.user._id }).lean();

  if (!admin) {
    throw new APIError('Admin profile not found', 404);
  }

  // Get count of various resources in parallel for better performance
  const [
    totalUsers,
    totalEvents,
    totalPosts,
    activeAdminsCount
  ] = await Promise.all([
    User.countDocuments().lean(),
    Event.countDocuments().lean(),
    Post.countDocuments().lean(),
    Admin.countDocuments({ isActive: true }).lean()
  ]);

  // Get recent activity from admin instance (need populated admin for this)
  const adminInstance = req.admin || await Admin.findOne({ user: req.user._id });
  const recentActivity = adminInstance ? adminInstance.getRecentActivity(10) : [];

  res.status(200).json({
    success: true,
    data: {
      totalUsers,
      totalEvents,
      totalPosts,
      activeAdmins: activeAdminsCount,
      recentActivity
    }
  });
});

/**
 * Get admin profile
 * @route GET /api/admin/profile
 * @access Private (Admin)
 * @returns {Object} Admin profile with populated user data
 */
exports.getAdminProfile = asyncHandler(async (req, res) => {
  // Use req.admin if available (from ensureAdminProfile middleware), otherwise fetch
  let admin = req.admin;
  if (!admin) {
    admin = await Admin.findOne({ user: req.user._id })
      .populate('user', '-password')
      .lean();
  } else {
    // Convert to plain object if needed for consistent response
    admin = admin.toObject ? admin.toObject() : admin;
    if (!admin.user || typeof admin.user === 'string') {
      await admin.populate('user', '-password');
      admin = admin.toObject ? admin.toObject() : admin;
    }
  }

  if (!admin) {
    throw new APIError('Admin profile not found', 404);
  }

  res.status(200).json({
    success: true,
    data: admin
  });
});

/**
 * Update admin profile
 * @route PUT /api/admin/profile
 * @access Private (Admin)
 * @param {string} [department] - Department name (must be valid enum value)
 * @param {string} [notes] - Admin notes
 * @returns {Object} Updated admin profile
 */
exports.updateAdminProfile = asyncHandler(async (req, res) => {
  const { department, notes } = req.body;

  // Use req.admin if available (from ensureAdminProfile middleware), otherwise fetch
  const admin = req.admin || await Admin.findOne({ user: req.user._id });

  if (!admin) {
    throw new APIError('Admin profile not found', 404);
  }

  // Validate department is a valid enum value if provided
  const validDepartments = ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'];
  if (department !== undefined) {
    if (validDepartments.includes(department)) {
      admin.department = department;
    } else {
      throw new APIError(
        `Invalid department. Must be one of: ${validDepartments.join(', ')}`,
        400
      );
    }
  }

  if (notes !== undefined) {
    admin.notes = notes;
  }

  await admin.save();

  // Populate user data for response
  await admin.populate('user', '-password');

  res.status(200).json({
    success: true,
    message: 'Admin profile updated successfully',
    data: admin
  });
});

/**
 * Get all admins (Super Admin only)
 * By default shows all admins (active and inactive) for debugging
 * @route GET /api/admin
 * @access Private (Super Admin)
 * @param {string} [role] - Filter by admin role
 * @param {boolean} [isActive] - Filter by active status
 * @returns {Object} List of admins with statistics
 */
exports.getAllAdmins = asyncHandler(async (req, res) => {
  const { role, isActive, page = 1, limit = 50 } = req.query;

  const filter = {};
  if (role) {filter.adminRole = role;}
  if (isActive !== undefined) {filter.isActive = isActive === 'true';}

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  // Get admins with pagination
  const [admins, totalCount] = await Promise.all([
    Admin.find(filter)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean(),
    Admin.countDocuments(filter)
  ]);

  // Get counts for statistics
  const [activeCount, inactiveCount] = await Promise.all([
    Admin.countDocuments({ ...filter, isActive: true }),
    Admin.countDocuments({ ...filter, isActive: false })
  ]);

  res.status(200).json({
    success: true,
    count: admins.length,
    total: totalCount,
    page: pageNum,
    pages: Math.ceil(totalCount / limitNum),
    stats: {
      active: activeCount,
      inactive: inactiveCount,
      total: totalCount
    },
    data: admins
  });
});

/**
 * Get admin by ID (Super Admin only)
 * @route GET /api/admin/:adminId
 * @access Private (Super Admin)
 * @param {string} adminId - Admin ID
 * @returns {Object} Admin profile with populated user data
 */
exports.getAdminById = asyncHandler(async (req, res) => {
  const { adminId } = req.params;

  const admin = await Admin.findById(adminId)
    .populate('user', '-password')
    .lean();

  if (!admin) {
    throw new APIError('Admin not found', 404);
  }

  res.status(200).json({
    success: true,
    data: admin
  });
});

/**
 * Create new admin (Super Admin only)
 * @route POST /api/admin
 * @access Private (Super Admin)
 * @param {string} userId - User ID to promote to admin
 * @param {string} adminRole - Admin role (must be valid role from ROLE_PERMISSIONS)
 * @param {string} [department] - Department name (optional, will be resolved from role if not provided)
 * @param {string} [notes] - Admin notes
 * @returns {Object} Created admin profile
 */
exports.createAdmin = asyncHandler(async (req, res) => {
  const { userId, adminRole, department, notes } = req.body;

  // Validate required input
  if (!userId || !adminRole) {
    throw new APIError('User ID and admin role are required', 400);
  }

  const permissions = ROLE_PERMISSIONS[adminRole];
  if (!permissions) {
    throw new APIError(`Invalid admin role. Valid roles: ${Object.keys(ROLE_PERMISSIONS).join(', ')}`, 400);
  }

  // Check if user exists
  const user = await User.findById(userId).lean();
  if (!user) {
    throw new APIError('User not found', 404);
  }

  // Check if admin already exists for this user
  const existingAdmin = await Admin.findOne({ user: userId }).lean();
  if (existingAdmin) {
    throw new APIError(
      'This user is already an admin. Each user can only have one admin profile.',
      400
    );
  }

  // Check for active admins - allow creation if all existing admins are inactive
  const activeAdminsCount = await Admin.countDocuments({ isActive: true }).lean();
  if (activeAdminsCount >= 1) {
    // Get details of active admins for better error message
    const activeAdminList = await Admin.find({ isActive: true })
      .select('_id adminRole user')
      .populate('user', 'email')
      .lean();

    logger.warn(`Attempted to create admin when ${activeAdminsCount} active admin(s) exist`, {
      userId,
      adminRole,
      activeAdmins: activeAdminList
    });

    throw new APIError(
      `Only one active admin can exist in the system. Found ${activeAdminsCount} active admin(s). Please delete or deactivate the existing active admin(s) before creating a new one.`,
      400
    );
  }

  // Validate and resolve department
  const validDepartments = ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'];
  let finalDepartment = department || resolveDepartment(adminRole);
  if (!validDepartments.includes(finalDepartment)) {
    logger.warn(`Invalid department "${finalDepartment}", falling back to Administration`);
    finalDepartment = 'Administration';
  }

  try {
    const admin = await Admin.create({
      user: userId,
      adminRole,
      department: finalDepartment,
      permissions,
      notes,
      isActive: true
    });

    await admin.populate('user', 'firstName lastName email phone');

    logger.info('Admin created successfully', {
      adminId: admin._id,
      userId,
      adminRole,
      department: finalDepartment
    });

    res.status(201).json({
      success: true,
      message: 'Admin created successfully',
      data: admin
    });
  } catch (error) {
    // Handle unique index constraint errors
    if (error.code === 11000 || error.name === 'MongoServerError') {
      if (error.message && error.message.includes('isActive')) {
        throw new APIError(
          'Cannot create admin: Unique constraint violation. There is already an active admin in the system. Please delete or deactivate existing active admin(s) first.',
          400
        );
      }
    }
    logger.error('Error creating admin:', error);
    throw error;
  }
});

/**
 * Update admin role (Super Admin only)
 */
exports.updateAdminRole = asyncHandler(async (req, res) => {
  const { adminRole, department, notes } = req.body;

  if (!adminRole) {
    throw new APIError('Admin role is required', 400);
  }

  const permissions = ROLE_PERMISSIONS[adminRole];
  if (!permissions) {
    throw new APIError('Invalid admin role', 400);
  }

  // Validate department is a valid enum value
  const validDepartments = ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'];
  let finalDepartment = department || resolveDepartment(adminRole);
  if (!validDepartments.includes(finalDepartment)) {
    finalDepartment = 'Administration'; // Fallback to valid enum value
  }

  const admin = await Admin.findByIdAndUpdate(
    req.params.adminId,
    {
      adminRole,
      department: finalDepartment,
      notes,
      permissions
    },
    { new: true, runValidators: true }
  ).populate('user', 'firstName lastName email phone');

  if (!admin) {
    throw new APIError('Admin not found', 404);
  }

  // Log action
  const superAdmin = await Admin.findOne({ user: req.user._id });
  if (superAdmin) {
    await superAdmin.logAction('update_admin_role', 'admin_management', {
      targetAdminId: admin._id,
      newRole: adminRole
    });
  }

  res.status(200).json({
    success: true,
    message: 'Admin role updated successfully',
    data: admin
  });
});

/**
 * Deactivate admin (Super Admin only)
 * Deletes admin and user details from database but preserves their uploads (posts, events, gallery items)
 */
exports.deactivateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.adminId);

  if (!admin) {
    throw new APIError('Admin not found', 404);
  }

  const userId = admin.user;

  // Delete admin record
  await Admin.findByIdAndDelete(req.params.adminId);

  // Delete user account (this also deletes the email, making it available for reuse)
  await User.findByIdAndDelete(userId);

  // Delete member profile if exists
  const Member = require('../models/Member');
  await Member.deleteOne({ user: userId });

  // Delete comments by this user in posts (but keep posts)
  const Post = require('../models/Post');
  await Post.updateMany(
    { 'comments.user': userId },
    { $pull: { comments: { user: userId } } }
  );

  // Delete other related records
  const Notification = require('../models/Notification');
  await Notification.deleteMany({ user: userId });

  const TwoFactorAuth = require('../models/TwoFactorAuth');
  await TwoFactorAuth.deleteOne({ user: userId });

  // NOTE: Posts, Events, and Gallery items are preserved (not deleted)

  res.status(200).json({
    success: true,
    message: 'Admin deactivated and details deleted from database. Email is now available for reuse. Uploads (posts, events, gallery items) have been preserved.'
  });
});

/**
 * Activate admin (Super Admin only)
 */
exports.activateAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findByIdAndUpdate(
    req.params.adminId,
    { isActive: true },
    { new: true }
  );

  if (!admin) {
    throw new APIError('Admin not found', 404);
  }

  res.status(200).json({
    success: true,
    message: 'Admin activated successfully',
    data: admin
  });
});

/**
 * Delete admin (Super Admin only)
 * Permanently deletes admin and associated user from database
 */
exports.deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.adminId);

  if (!admin) {
    throw new APIError('Admin not found', 404);
  }

  const userId = admin.user;

  // Delete admin record
  await Admin.findByIdAndDelete(req.params.adminId);

  // Delete associated user and all related records
  await User.findByIdAndDelete(userId);

  // Delete member profile if exists
  const Member = require('../models/Member');
  await Member.deleteOne({ user: userId });

  // Delete all posts by this user
  const Post = require('../models/Post');
  await Post.deleteMany({ author: userId });

  // Delete all events by this user
  const Event = require('../models/Event');
  await Event.deleteMany({ organizer: userId });

  // Delete all gallery items by this user
  const GalleryItem = require('../models/GalleryItem');
  await GalleryItem.deleteMany({ uploadedBy: userId });

  // Delete comments by this user in posts
  await Post.updateMany(
    { 'comments.user': userId },
    { $pull: { comments: { user: userId } } }
  );

  // Delete other related records
  const Notification = require('../models/Notification');
  await Notification.deleteMany({ user: userId });

  const TwoFactorAuth = require('../models/TwoFactorAuth');
  await TwoFactorAuth.deleteOne({ user: userId });

  res.status(200).json({
    success: true,
    message: 'Admin and all associated records deleted successfully from database'
  });
});

/**
 * Get admin activity logs (Super Admin only)
 */
exports.getActivityLogs = asyncHandler(async (req, res) => {
  const { adminId, limit = 100, page = 1 } = req.query;

  let query = Admin.find({ isActive: true });

  if (adminId) {
    query = query.where('_id').equals(adminId);
  }

  const admins = await query.select('user adminRole activityLog').limit(limit);

  // Combine all logs and sort by timestamp
  const allLogs = [];
  admins.forEach(admin => {
    admin.activityLog.forEach(log => {
      allLogs.push({
        admin: admin._id,
        adminRole: admin.adminRole,
        ...log.toObject()
      });
    });
  });

  const sortedLogs = allLogs.sort((a, b) => b.timestamp - a.timestamp);
  const paginatedLogs = sortedLogs.slice((page - 1) * limit, page * limit);

  res.status(200).json({
    success: true,
    count: paginatedLogs.length,
    total: sortedLogs.length,
    page: parseInt(page),
    data: paginatedLogs
  });
});

/**
 * Log admin action
 */
exports.logAdminAction = asyncHandler(async (req, res) => {
  // Use req.admin if available (from ensureAdminProfile middleware), otherwise fetch
  const admin = req.admin || await Admin.findOne({ user: req.user._id });

  if (!admin) {
    throw new APIError('Admin profile not found', 404);
  }

  const { action, module, details } = req.body;

  await admin.logAction(action, module, details);

  res.status(200).json({
    success: true,
    message: 'Action logged successfully'
  });
});

/**
 * Export activity logs to CSV (Super Admin only)
 */
exports.exportActivityLogs = asyncHandler(async (req, res) => {
  const { adminId } = req.query;

  let query = Admin.find({ isActive: true });

  if (adminId) {
    query = query.where('_id').equals(adminId);
  }

  const admins = await query.select('user adminRole activityLog');

  // Build CSV content
  let csvContent = 'Admin ID,Admin Role,Action,Module,Timestamp,Details\n';

  admins.forEach(admin => {
    admin.activityLog.forEach(log => {
      const details = JSON.stringify(log.details || {}).replace(/"/g, '""');
      csvContent += `${admin._id},"${admin.adminRole}","${log.action}","${log.module}","${log.timestamp}","${details}"\n`;
    });
  });

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename="admin-logs.csv"');
  res.send(csvContent);
});

/**
 * Get statistics for each admin role
 */
exports.getAdminStats = asyncHandler(async (req, res) => {
  const stats = await Admin.aggregate([
    { $match: { isActive: true } },
    {
      $group: {
        _id: '$adminRole',
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: stats
  });
});

