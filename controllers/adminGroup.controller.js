const AdminGroup = require('../models/AdminGroup');
const Admin = require('../models/Admin');
const { APIError, asyncHandler } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Create a new admin group
 * @route   POST /api/admin/groups
 * @access  Private/Admin
 */
exports.createGroup = asyncHandler(async (req, res) => {
  const { name, description, permissions, settings } = req.body;

  // Check if group with name already exists
  const existingGroup = await AdminGroup.findOne({ name });
  if (existingGroup) {
    throw new APIError('Group with this name already exists', 400);
  }

  const group = await AdminGroup.create({
    name,
    description,
    permissions,
    settings: {
      ...settings,
      maxMembers: settings?.maxMembers || 50,
      defaultRole: settings?.defaultRole || 'member',
    },
    'metadata.createdBy': req.admin._id,
    members: [{
      member: req.admin._id,
      role: 'admin',
      addedBy: req.admin._id,
      joinedAt: new Date()
    }]
  });

  // Log the action
  await group.logAction('group_created', 'admin_group', {
    name: group.name,
    createdBy: req.admin._id
  });

  res.status(201).json({
    success: true,
    data: group
  });
});

/**
 * @desc    Get all admin groups
 * @route   GET /api/admin/groups
 * @access  Private/Admin
 */
exports.getAllGroups = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search, isActive } = req.query;
  const skip = (page - 1) * limit;

  const query = {};
  
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  // If not super admin, only show groups the admin is a member of
  if (req.admin.adminRole !== 'super_admin') {
    query['members.member'] = req.admin._id;
  }

  const [groups, total] = await Promise.all([
    AdminGroup.find(query)
      .populate('metadata.createdBy', 'user')
      .populate('members.member', 'user')
      .sort({ 'metadata.updatedAt': -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    AdminGroup.countDocuments(query)
  ]);

  // Populate user details for createdBy and members
  await Promise.all(groups.map(async group => {
    if (group.metadata?.createdBy?.user) {
      const user = await Admin.populate(group.metadata.createdBy, {
        path: 'user',
        select: 'name email'
      });
      group.createdBy = user.user;
    }
    
    if (group.members && group.members.length > 0) {
      await Promise.all(group.members.map(async (member, index) => {
        if (member.member?.user) {
          const memberUser = await Admin.populate(member.member, {
            path: 'user',
            select: 'name email'
          });
          group.members[index].member = memberUser;
        }
      }));
    }
  }));

  res.status(200).json({
    success: true,
    count: groups.length,
    pagination: {
      total,
      page: Number(page),
      pages: Math.ceil(total / limit)
    },
    data: groups
  });
});

/**
 * @desc    Get single group by ID
 * @route   GET /api/admin/groups/:id
 * @access  Private/Admin
 */
exports.getGroupById = asyncHandler(async (req, res) => {
  const group = await AdminGroup.findById(req.params.id)
    .populate('metadata.createdBy', 'user')
    .populate('members.member', 'user')
    .lean();

  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if admin is a member or super admin
  if (req.admin.adminRole !== 'super_admin' && 
      !group.members.some(m => m.member._id.toString() === req.admin._id.toString())) {
    throw new APIError('Not authorized to access this group', 403);
  }

  // Populate user details
  if (group.metadata?.createdBy?.user) {
    const user = await Admin.populate(group.metadata.createdBy, {
      path: 'user',
      select: 'name email'
    });
    group.createdBy = user.user;
  }
  
  if (group.members && group.members.length > 0) {
    await Promise.all(group.members.map(async (member, index) => {
      if (member.member?.user) {
        const memberUser = await Admin.populate(member.member, {
          path: 'user',
          select: 'name email'
        });
        group.members[index].member = memberUser;
      }
    }));
  }

  res.status(200).json({
    success: true,
    data: group
  });
});

/**
 * @desc    Update group
 * @route   PUT /api/admin/groups/:id
 * @access  Private/Admin
 */
exports.updateGroup = asyncHandler(async (req, res) => {
  const { name, description, permissions, settings } = req.body;
  
  const group = await AdminGroup.findById(req.params.id);
  
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if user is group admin or super admin
  const isGroupAdmin = group.members.some(
    m => m.member.toString() === req.admin._id.toString() && 
         (m.role === 'admin' || req.admin.adminRole === 'super_admin')
  );

  if (!isGroupAdmin) {
    throw new APIError('Not authorized to update this group', 403);
  }

  // Check if name is being changed and if it's already taken
  if (name && name !== group.name) {
    const existingGroup = await AdminGroup.findOne({ name });
    if (existingGroup && existingGroup._id.toString() !== group._id.toString()) {
      throw new APIError('Group with this name already exists', 400);
    }
    group.name = name;
  }

  if (description !== undefined) group.description = description;
  if (permissions) group.permissions = permissions;
  if (settings) {
    group.settings = {
      ...group.settings,
      ...settings,
      maxMembers: settings.maxMembers || group.settings.maxMembers,
      defaultRole: settings.defaultRole || group.settings.defaultRole
    };
  }

  group.metadata.updatedAt = new Date();
  group.metadata.updatedBy = req.admin._id;

  await group.save();

  // Log the action
  await group.logAction('group_updated', 'admin_group', {
    updatedBy: req.admin._id,
    changes: Object.keys(req.body)
  });

  res.status(200).json({
    success: true,
    data: group
  });
});

/**
 * @desc    Delete group
 * @route   DELETE /api/admin/groups/:id
 * @access  Private/Admin
 */
exports.deleteGroup = asyncHandler(async (req, res) => {
  const group = await AdminGroup.findById(req.params.id);
  
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Only group creator or super admin can delete
  if (group.metadata.createdBy.toString() !== req.admin._id.toString() && 
      req.admin.adminRole !== 'super_admin') {
    throw new APIError('Not authorized to delete this group', 403);
  }

  await group.remove();

  // Log the action
  await group.logAction('group_deleted', 'admin_group', {
    deletedBy: req.admin._id,
    name: group.name
  });

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Add member to group
 * @route   POST /api/admin/groups/:id/members
 * @access  Private/Admin
 */
exports.addGroupMember = asyncHandler(async (req, res) => {
  const { adminId, role } = req.body;
  
  const group = await AdminGroup.findById(req.params.id);
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if user has permission to add members
  const isGroupAdmin = group.members.some(
    m => m.member.toString() === req.admin._id.toString() && 
         (m.role === 'admin' || req.admin.adminRole === 'super_admin')
  );

  if (!isGroupAdmin) {
    throw new APIError('Not authorized to add members to this group', 403);
  }

  // Check if admin exists
  const adminToAdd = await Admin.findById(adminId);
  if (!adminToAdd) {
    throw new APIError('Admin not found', 404);
  }

  // Add member to group
  await group.addMember(adminId, role || group.settings.defaultRole, req.admin._id);

  // Add group to admin's groups array
  adminToAdd.groups = adminToAdd.groups || [];
  if (!adminToAdd.groups.includes(group._id)) {
    adminToAdd.groups.push(group._id);
    await adminToAdd.save();
  }

  // Get updated group with populated members
  const updatedGroup = await AdminGroup.findById(group._id)
    .populate('members.member', 'user')
    .lean();

  // Populate user details
  if (updatedGroup.members && updatedGroup.members.length > 0) {
    await Promise.all(updatedGroup.members.map(async (member, index) => {
      if (member.member?.user) {
        const memberUser = await Admin.populate(member.member, {
          path: 'user',
          select: 'name email'
        });
        updatedGroup.members[index].member = memberUser;
      }
    }));
  }

  res.status(200).json({
    success: true,
    data: updatedGroup
  });
});

/**
 * @desc    Remove member from group
 * @route   DELETE /api/admin/groups/:id/members/:memberId
 * @access  Private/Admin
 */
exports.removeGroupMember = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  
  const group = await AdminGroup.findById(id);
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if user has permission to remove members
  const isGroupAdmin = group.members.some(
    m => m.member.toString() === req.admin._id.toString() && 
         (m.role === 'admin' || req.admin.adminRole === 'super_admin')
  );

  // Allow self-removal if not the last admin
  const isSelfRemoval = memberId === req.admin._id.toString();
  const isRemovingSelf = isSelfRemoval && 
    group.members.filter(m => m.role === 'admin').length > 1;

  if (!isGroupAdmin && !isRemovingSelf) {
    throw new APIError('Not authorized to remove members from this group', 403);
  }

  // Prevent removing the last admin
  const memberToRemove = group.members.find(m => m.member.toString() === memberId);
  if (memberToRemove?.role === 'admin') {
    const adminCount = group.members.filter(m => m.role === 'admin').length;
    if (adminCount <= 1) {
      throw new APIError('Cannot remove the last admin from the group', 400);
    }
  }

  // Remove member from group
  await group.removeMember(memberId, req.admin._id);

  // Remove group from admin's groups array
  const admin = await Admin.findById(memberId);
  if (admin) {
    admin.groups = admin.groups.filter(g => g.toString() !== group._id.toString());
    await admin.save();
  }

  res.status(200).json({
    success: true,
    data: {}
  });
});

/**
 * @desc    Update member role
 * @route   PUT /api/admin/groups/:id/members/:memberId/role
 * @access  Private/Admin
 */
exports.updateMemberRole = asyncHandler(async (req, res) => {
  const { id, memberId } = req.params;
  const { role } = req.body;
  
  if (!role || !['member', 'moderator', 'admin'].includes(role)) {
    throw new APIError('Invalid role provided', 400);
  }

  const group = await AdminGroup.findById(id);
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Only group admins can update roles
  const isGroupAdmin = group.members.some(
    m => m.member.toString() === req.admin._id.toString() && 
         (m.role === 'admin' || req.admin.adminRole === 'super_admin')
  );

  if (!isGroupAdmin) {
    throw new APIError('Not authorized to update roles in this group', 403);
  }

  // Prevent modifying own role
  if (memberId === req.admin._id.toString() && req.admin.adminRole !== 'super_admin') {
    throw new APIError('Cannot modify your own role', 400);
  }

  // Prevent removing the last admin
  if (role !== 'admin') {
    const member = group.members.find(m => m.member.toString() === memberId);
    if (member?.role === 'admin') {
      const adminCount = group.members.filter(m => m.role === 'admin').length;
      if (adminCount <= 1) {
        throw new APIError('Cannot remove the last admin from the group', 400);
      }
    }
  }

  // Update member role
  await group.updateMemberRole(memberId, role, req.admin._id);

  res.status(200).json({
    success: true,
    data: { role }
  });
});

/**
 * @desc    Get group activity
 * @route   GET /api/admin/groups/:id/activity
 * @access  Private/Admin
 */
exports.getGroupActivity = asyncHandler(async (req, res) => {
  const { limit = 50, before } = req.query;
  
  const group = await AdminGroup.findById(req.params.id);
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if user is a member or super admin
  if (req.admin.adminRole !== 'super_admin' && 
      !group.members.some(m => m.member.toString() === req.admin._id.toString())) {
    throw new APIError('Not authorized to view this group\'s activity', 403);
  }

  const activities = await AdminGroup.getGroupActivity(
    group._id, 
    { 
      limit: Number(limit),
      before: before ? new Date(before) : new Date()
    }
  );

  res.status(200).json({
    success: true,
    count: activities.length,
    data: activities
  });
});

/**
 * @desc    Get group members
 * @route   GET /api/admin/groups/:id/members
 * @access  Private/Admin
 */
exports.getGroupMembers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 50, role, search } = req.query;
  
  const group = await AdminGroup.findById(req.params.id);
  if (!group) {
    throw new APIError('Group not found', 404);
  }

  // Check if user is a member or super admin
  if (req.admin.adminRole !== 'super_admin' && 
      !group.members.some(m => m.member.toString() === req.admin._id.toString())) {
    throw new APIError('Not authorized to view this group\'s members', 403);
  }

  const result = await AdminGroup.getGroupMembers(
    group._id,
    { 
      page: Number(page),
      limit: Number(limit),
      role,
      search
    }
  );

  res.status(200).json({
    success: true,
    ...result
  });
});
