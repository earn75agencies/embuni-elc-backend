const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    adminRole: {
      type: String,
      enum: [
        'super_admin',
        'design_admin',      // Home page
        'about_admin',        // About page
        'programs_admin',     // Programs page
        'events_admin',       // Events page
        'content_admin',      // News page
        'gallery_admin',     // Gallery page
        'resources_admin',    // Resources page
        'contact_admin'       // Contact page
      ],
      required: true
    },
    department: {
      type: String,
      enum: ['Executive', 'Leadership', 'Communications', 'Events', 'Membership', 'Administration'],
      default: 'Administration'
    },
    permissions: {
      type: [String],
      default: []
    },
    preferences: {
      theme: { 
        type: String, 
        enum: ['light', 'dark', 'system'], 
        default: 'system' 
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        inApp: { type: Boolean, default: true }
      },
      language: { 
        type: String, 
        default: 'en',
        enum: ['en', 'es', 'fr', 'sw']
      },
      dashboard: {
        layout: { type: String, default: 'default' },
        widgets: { type: [String], default: ['stats', 'recentActivity'] }
      }
    },
    activityLog: [
      {
        action: String,
        module: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        details: mongoose.Schema.Types.Mixed,
        ipAddress: String,
        userAgent: String
      }
    ],
    lastLogin: {
      timestamp: Date,
      ipAddress: String,
      userAgent: String
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    notes: String,
    metadata: {
      timezone: String,
      lastActive: Date,
      loginCount: { type: Number, default: 0 }
    }
  },
  { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Indexes for faster queries
adminSchema.index({ user: 1 });
adminSchema.index({ adminRole: 1 });
adminSchema.index({ isActive: 1 });
adminSchema.index({ 'activityLog.timestamp': -1 });
adminSchema.index({ 'metadata.lastActive': -1 });

/**
 * Virtuals
 */
adminSchema.virtual('fullName').get(function() {
  return this.user?.name || 'Unknown Admin';
});

adminSchema.virtual('email').get(function() {
  return this.user?.email || '';
});

/**
 * Methods
 */

// Log admin action with additional context
adminSchema.methods.logAction = async function(action, module, details = {}, req = {}) {
  const logEntry = {
    action,
    module,
    details,
    timestamp: new Date(),
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent')
  };

  this.activityLog.push(logEntry);
  this.metadata.lastActive = new Date();

  // Keep only last 1000 logs per admin
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }

  await this.save();
  return logEntry;
};

// Update last login with additional context
adminSchema.methods.updateLastLogin = async function(req = {}) {
  this.lastLogin = {
    timestamp: new Date(),
    ipAddress: req.ip || req.connection?.remoteAddress,
    userAgent: req.get('user-agent')
  };
  
  this.metadata.lastActive = new Date();
  this.metadata.loginCount = (this.metadata.loginCount || 0) + 1;
  
  if (req.headers['timezone']) {
    this.metadata.timezone = req.headers['timezone'];
  }
  
  await this.save();
  return this;
};

// Get recent activity with pagination
adminSchema.methods.getRecentActivity = function(limit = 50, page = 1) {
  const skip = (page - 1) * limit;
  const total = this.activityLog.length;
  const activities = this.activityLog
    .slice()
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(skip, skip + limit);
    
  return {
    data: activities,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  };
};

// Check if admin has specific permission
adminSchema.methods.hasPermission = function(permission) {
  if (this.adminRole === 'super_admin') return true;
  return this.permissions.includes(permission);
};

// Get dashboard widgets based on role
adminSchema.methods.getDashboardWidgets = function() {
  const defaultWidgets = ['stats', 'recentActivity'];
  
  // Add role-specific widgets
  if (this.adminRole === 'super_admin') {
    defaultWidgets.push('systemHealth', 'recentLogs');
  }
  
  if (this.adminRole === 'events_admin') {
    defaultWidgets.push('upcomingEvents');
  }
  
  if (this.adminRole === 'content_admin') {
    defaultWidgets.push('recentContent', 'contentStats');
  }
  
  return [...new Set([...defaultWidgets, ...(this.preferences.dashboard?.widgets || [])])];
};

/**
 * Statics
 */

// Get active admins by role with pagination
adminSchema.statics.getAdminsByRole = function(role, { page = 1, limit = 20 } = {}) {
  const skip = (page - 1) * limit;
  
  return Promise.all([
    this.find({ adminRole: role, isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments({ adminRole: role, isActive: true })
  ]).then(([admins, total]) => ({
    data: admins,
    pagination: {
      total,
      page,
      pages: Math.ceil(total / limit),
      limit
    }
  }));
};

// Deactivate admin with logging
adminSchema.statics.deactivateAdmin = async function(adminId, deactivatedBy) {
  const admin = await this.findById(adminId);
  if (!admin) throw new Error('Admin not found');
  
  admin.isActive = false;
  await admin.logAction('admin_deactivated', 'admin', { deactivatedBy });
  
  return admin.save();
};

// Activate admin with logging
adminSchema.statics.activateAdmin = async function(adminId, activatedBy) {
  const admin = await this.findById(adminId);
  if (!admin) throw new Error('Admin not found');
  
  admin.isActive = true;
  await admin.logAction('admin_activated', 'admin', { activatedBy });
  
  return admin.save();
};

// Find admin by user ID with population
adminSchema.statics.findByUserId = function(userId) {
  return this.findOne({ user: userId })
    .populate('user', 'name email avatar')
    .lean();
};

// Get admin statistics
adminSchema.statics.getAdminStats = async function() {
  const [
    totalAdmins,
    activeAdmins,
    adminsByRole,
    recentActivity
  ] = await Promise.all([
    this.countDocuments(),
    this.countDocuments({ isActive: true }),
    this.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$adminRole', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]),
    this.aggregate([
      { $unwind: '$activityLog' },
      { $sort: { 'activityLog.timestamp': -1 } },
      { $limit: 10 },
      { 
        $project: {
          _id: 0,
          admin: '$user',
          action: '$activityLog.action',
          module: '$activityLog.module',
          timestamp: '$activityLog.timestamp'
        }
      }
    ])
  ]);

  return {
    totalAdmins,
    activeAdmins,
    adminsByRole,
    recentActivity
  };
};

module.exports = mongoose.model('Admin', adminSchema);
