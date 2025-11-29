/**
 * Newsletter Model
 * Automated newsletter system
 */

const mongoose = require('mongoose');

const newsletterSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },

  // Content
  content: {
    type: String,
    required: true
  },
  htmlContent: String,
  plainTextContent: String,

  // Template
  template: {
    type: String,
    enum: ['default', 'event_focus', 'achievement', 'monthly_digest', 'custom'],
    default: 'default'
  },

  // Scheduling
  scheduledFor: Date,
  sentAt: Date,
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sending', 'sent', 'failed', 'cancelled'],
    default: 'draft'
  },

  // Recipients
  recipientType: {
    type: String,
    enum: ['all', 'active', 'alumni', 'specific', 'segment'],
    default: 'all'
  },
  recipients: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  segments: [String],

  // Statistics
  stats: {
    totalRecipients: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    bounced: { type: Number, default: 0 },
    unsubscribed: { type: Number, default: 0 }
  },

  // Recurring
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'quarterly']
  },
  nextScheduledDate: Date,

  // Author
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Features
  includeEvents: {
    type: Boolean,
    default: true
  },
  includePosts: {
    type: Boolean,
    default: true
  },
  includeAchievements: {
    type: Boolean,
    default: true
  },
  includeStats: {
    type: Boolean,
    default: false
  },

  // Metadata
  tags: [String],
  notes: String
}, {
  timestamps: true
});

// Indexes
newsletterSchema.index({ scheduledFor: 1, status: 1 });
newsletterSchema.index({ createdBy: 1 });
newsletterSchema.index({ status: 1 });
newsletterSchema.index({ isRecurring: 1 });

module.exports = mongoose.model('Newsletter', newsletterSchema);

