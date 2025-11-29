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
    activityLog: [
      {
        action: String,
        module: String,
        timestamp: {
          type: Date,
          default: Date.now
        },
        details: mongoose.Schema.Types.Mixed
      }
    ],
    lastLogin: Date,
    isActive: {
      type: Boolean,
      default: true
    },
    notes: String
  },
  { timestamps: true }
);

// Index for faster queries
adminSchema.index({ user: 1 });
adminSchema.index({ adminRole: 1 });
adminSchema.index({ isActive: 1 });

// Ensure only one active admin exists in the system
// Partial unique index: only one document with isActive: true
adminSchema.index(
  { isActive: 1 },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
    name: 'unique_active_admin'
  }
);

// Method to log admin action
adminSchema.methods.logAction = async function(action, module, details = {}) {
  this.activityLog.push({
    action,
    module,
    details,
    timestamp: new Date()
  });

  // Keep only last 1000 logs per admin
  if (this.activityLog.length > 1000) {
    this.activityLog = this.activityLog.slice(-1000);
  }

  await this.save();
};

// Method to update last login
adminSchema.methods.updateLastLogin = async function() {
  this.lastLogin = new Date();
  await this.save();
};

// Method to get recent activity
adminSchema.methods.getRecentActivity = function(limit = 50) {
  return this.activityLog.slice(-limit).reverse();
};

// Static method to get active admins by role
adminSchema.statics.getAdminsByRole = function(adminRole) {
  return this.find({ adminRole, isActive: true }).populate('user', 'name email');
};

// Static method to deactivate admin
adminSchema.statics.deactivateAdmin = async function(adminId) {
  return this.findByIdAndUpdate(adminId, { isActive: false }, { new: true });
};

// Static method to activate admin
adminSchema.statics.activateAdmin = async function(adminId) {
  return this.findByIdAndUpdate(adminId, { isActive: true }, { new: true });
};

module.exports = mongoose.model('Admin', adminSchema);
