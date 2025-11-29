/**
 * Notification Model
 * Real-time notifications for users and admins
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Notification Details
  type: {
    type: String,
    enum: [
      'event_reminder',
      'event_registration',
      'new_post',
      'comment_reply',
      'mention',
      'badge_earned',
      'achievement_unlocked',
      'mentorship_request',
      'admin_action',
      'security_alert',
      'system_update',
      'message',
      'feedback_request',
      'task_assigned',
      'approval_required',
      'other'
    ],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },

  // Target
  targetType: {
    type: String,
    enum: ['event', 'post', 'user', 'system', 'admin', 'other']
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId
  },
  targetUrl: String,

  // Status
  read: {
    type: Boolean,
    default: false
  },
  readAt: Date,
  archived: {
    type: Boolean,
    default: false
  },
  archivedAt: Date,

  // Priority
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },

  // Action
  actionRequired: {
    type: Boolean,
    default: false
  },
  actionUrl: String,
  actionLabel: String,

  // Metadata
  icon: String,
  image: String,
  data: {
    type: mongoose.Schema.Types.Mixed
  },

  // Delivery
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,
  pushSent: {
    type: Boolean,
    default: false
  },
  pushSentAt: Date,
  smsSent: {
    type: Boolean,
    default: false
  },
  smsSentAt: Date
}, {
  timestamps: true
});

// Indexes
notificationSchema.index({ user: 1, read: 1, createdAt: -1 });
notificationSchema.index({ user: 1, archived: 1 });
notificationSchema.index({ type: 1 });
notificationSchema.index({ priority: 1 });
notificationSchema.index({ createdAt: -1 });

// Auto-archive old notifications after 90 days
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 }); // 90 days

module.exports = mongoose.model('Notification', notificationSchema);

