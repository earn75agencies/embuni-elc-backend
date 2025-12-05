const mongoose = require('mongoose');

const adminGroupSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true, 
    trim: true,
    unique: true,
    index: true
  },
  description: {
    type: String,
    trim: true
  },
  members: [{
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    role: {
      type: String,
      enum: ['member', 'moderator', 'admin'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  }],
  permissions: [{
    type: String,
    trim: true
  }],
  settings: {
    isPublic: {
      type: Boolean,
      default: false
    },
    approvalRequired: {
      type: Boolean,
      default: true
    },
    maxMembers: {
      type: Number,
      default: 50,
      min: 1,
      max: 1000
    },
    defaultRole: {
      type: String,
      enum: ['member', 'moderator'],
      default: 'member'
    },
    allowMemberInvites: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    createdAt: {
      type: Date,
      default: Date.now
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    memberCount: {
      type: Number,
      default: 0
    }
  },
  activityLog: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    },
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
      type: Date,
      default: Date.now
    },
    ipAddress: String
  }],
  isActive: {
    type: Boolean,
    default: true,
    index: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes
adminGroupSchema.index({ 'members.member': 1 });
adminGroupSchema.index({ 'members.role': 1 });
adminGroupSchema.index({ 'metadata.createdBy': 1 });
adminGroupSchema.index({ isActive: 1, 'settings.isPublic': 1 });

/**
 * Virtuals
 */

// Virtual for member count
adminGroupSchema.virtual('memberCount').get(function() {
  return this.members.length;
});

// Virtual for creator info
adminGroupSchema.virtual('creator', {
  ref: 'Admin',
  localField: 'metadata.createdBy',
  foreignField: '_id',
  justOne: true
});

/**
 * Methods
 */

// Add member to group
adminGroupSchema.methods.addMember = async function(adminId, role = 'member', addedById) {
  // Check if already a member
  const isMember = this.members.some(m => m.member.equals(adminId));
  if (isMember) {
    throw new Error('Admin is already a member of this group');
  }

  // Check member limit
  if (this.members.length >= this.settings.maxMembers) {
    throw new Error('Group has reached maximum member limit');
  }

  this.members.push({
    member: adminId,
    role: role || this.settings.defaultRole,
    addedBy: addedById,
    joinedAt: new Date()
  });

  // Log the action
  this.activityLog.push({
    action: 'member_added',
    performedBy: addedById,
    details: { memberId: adminId, role },
    timestamp: new Date()
  });

  return this.save();
};

// Remove member from group
adminGroupSchema.methods.removeMember = async function(adminId, removedById) {
  const initialLength = this.members.length;
  this.members = this.members.filter(m => !m.member.equals(adminId));
  
  if (this.members.length === initialLength) {
    throw new Error('Member not found in group');
  }

  // Log the action
  this.activityLog.push({
    action: 'member_removed',
    performedBy: removedById,
    details: { memberId: adminId },
    timestamp: new Date()
  });

  return this.save();
};

// Update member role
adminGroupSchema.methods.updateMemberRole = async function(adminId, newRole, updatedById) {
  const member = this.members.find(m => m.member.equals(adminId));
  if (!member) {
    throw new Error('Member not found in group');
  }

  const oldRole = member.role;
  member.role = newRole;

  // Log the action
  this.activityLog.push({
    action: 'member_role_updated',
    performedBy: updatedById,
    details: { 
      memberId: adminId,
      oldRole,
      newRole
    },
    timestamp: new Date()
  });

  return this.save();
};

// Check if admin is member
adminGroupSchema.methods.isMember = function(adminId) {
  return this.members.some(m => m.member.equals(adminId));
};

// Check if admin has specific role
adminGroupSchema.methods.hasRole = function(adminId, roles) {
  if (!Array.isArray(roles)) {
    roles = [roles];
  }
  const member = this.members.find(m => m.member.equals(adminId));
  return member && roles.includes(member.role);
};

// Get member role
adminGroupSchema.methods.getMemberRole = function(adminId) {
  const member = this.members.find(m => m.member.equals(adminId));
  return member ? member.role : null;
};

/**
 * Statics
 */

// Find groups by member
adminGroupSchema.statics.findByMember = function(adminId, options = {}) {
  const { 
    page = 1, 
    limit = 20, 
    isActive = true,
    populate = []
  } = options;

  const query = {
    'members.member': adminId,
    isActive
  };

  return Promise.all([
    this.find(query)
      .populate(populate)
      .sort({ 'metadata.updatedAt': -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]).then(([groups, total]) => ({
    data: groups,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  }));
};

// Get group members with pagination
adminGroupSchema.statics.getGroupMembers = function(groupId, options = {}) {
  const { 
    page = 1, 
    limit = 50,
    role,
    search
  } = options;

  const match = { _id: mongoose.Types.ObjectId(groupId) };
  if (role) {
    match['members.role'] = role;
  }

  return this.aggregate([
    { $match: match },
    { $unwind: '$members' },
    {
      $lookup: {
        from: 'admins',
        localField: 'members.member',
        foreignField: '_id',
        as: 'memberInfo'
      }
    },
    { $unwind: '$memberInfo' },
    {
      $lookup: {
        from: 'users',
        localField: 'memberInfo.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: '$userInfo' },
    {
      $project: {
        _id: '$memberInfo._id',
        role: '$members.role',
        joinedAt: '$members.joinedAt',
        addedBy: '$members.addedBy',
        user: {
          _id: '$userInfo._id',
          name: '$userInfo.name',
          email: '$userInfo.email',
          avatar: '$userInfo.avatar'
        },
        isActive: '$memberInfo.isActive',
        lastActive: '$memberInfo.lastLogin'
      }
    },
    { $sort: { role: 1, 'user.name': 1 } },
    { 
      $group: {
        _id: null,
        members: { $push: '$$ROOT' },
        total: { $sum: 1 }
      }
    },
    {
      $project: {
        _id: 0,
        data: {
          $slice: [
            '$members',
            (page - 1) * limit,
            limit
          ]
        },
        pagination: {
          total: '$total',
          page: Number(page),
          pages: { $ceil: { $divide: ['$total', limit] } },
          limit: Number(limit)
        }
      }
    }
  ]).then(results => results[0] || { data: [], pagination: { total: 0, page, pages: 0, limit } });
};

// Get group activity feed
adminGroupSchema.statics.getGroupActivity = function(groupId, options = {}) {
  const { 
    limit = 50,
    before = new Date(),
    action
  } = options;

  const match = { 
    _id: mongoose.Types.ObjectId(groupId) 
  };

  if (action) {
    match['activityLog.action'] = action;
  }

  return this.aggregate([
    { $match: match },
    { $unwind: '$activityLog' },
    { 
      $match: {
        'activityLog.timestamp': { $lt: new Date(before) }
      }
    },
    { $sort: { 'activityLog.timestamp': -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'admins',
        localField: 'activityLog.performedBy',
        foreignField: '_id',
        as: 'performedBy'
      }
    },
    { $unwind: { path: '$performedBy', preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: 'users',
        localField: 'performedBy.user',
        foreignField: '_id',
        as: 'userInfo'
      }
    },
    { $unwind: { path: '$userInfo', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        _id: '$activityLog._id',
        action: '$activityLog.action',
        details: '$activityLog.details',
        timestamp: '$activityLog.timestamp',
        ipAddress: '$activityLog.ipAddress',
        performedBy: {
          $cond: {
            if: { $eq: ['$performedBy', null] },
            then: null,
            else: {
              _id: '$performedBy._id',
              name: '$userInfo.name',
              email: '$userInfo.email',
              avatar: '$userInfo.avatar'
            }
          }
        }
      }
    },
    { $sort: { timestamp: -1 } }
  ]);
};

// Pre-save hook to update metadata
adminGroupSchema.pre('save', function(next) {
  if (this.isNew) {
    this.metadata = this.metadata || {};
    this.metadata.createdAt = new Date();
    this.metadata.memberCount = 1; // Creator is the first member
  } else {
    this.metadata = this.metadata || {};
    this.metadata.updatedAt = new Date();
    this.metadata.memberCount = this.members.length;
  }
  next();
});

// Pre-remove hook to clean up references
adminGroupSchema.pre('remove', async function(next) {
  // Remove group reference from all member admins
  await mongoose.model('Admin').updateMany(
    { _id: { $in: this.members.map(m => m.member) } },
    { $pull: { groups: this._id } }
  );
  next();
});

module.exports = mongoose.model('AdminGroup', adminGroupSchema);
