/**
 * Scheduled Post Model
 * Manages auto-scheduling of posts and content
 */

const mongoose = require('mongoose');

const scheduledPostSchema = new mongoose.Schema({
  // Post Information
  title: {
    type: String,
    required: true
  },
  content: {
    type: String,
    required: true
  },
  excerpt: String,
  category: String,
  tags: [String],

  // Author
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Scheduling
  scheduledFor: {
    type: Date,
    required: true
  },
  timezone: {
    type: String,
    default: 'Africa/Nairobi'
  },

  // Status
  status: {
    type: String,
    enum: ['scheduled', 'published', 'failed', 'cancelled'],
    default: 'scheduled'
  },
  publishedAt: Date,
  failedAt: Date,
  failureReason: String,

  // Post Type
  postType: {
    type: String,
    enum: ['post', 'event', 'announcement', 'newsletter'],
    default: 'post'
  },

  // Media
  featuredImage: String,
  images: [String],

  // Social Media
  autoShare: {
    type: Boolean,
    default: false
  },
  socialPlatforms: [{
    platform: {
      type: String,
      enum: ['facebook', 'twitter', 'linkedin', 'instagram']
    },
    enabled: {
      type: Boolean,
      default: true
    },
    shared: {
      type: Boolean,
      default: false
    },
    sharedAt: Date,
    postId: String // External post ID
  }],

  // Metadata
  slug: String,
  seoTitle: String,
  seoDescription: String,
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Recurring
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurrencePattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly', 'custom']
  },
  recurrenceEndDate: Date,
  nextScheduledDate: Date,

  // Notification
  notifyOnPublish: {
    type: Boolean,
    default: false
  },
  notificationSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
scheduledPostSchema.index({ scheduledFor: 1, status: 1 });
scheduledPostSchema.index({ author: 1 });
scheduledPostSchema.index({ status: 1 });
scheduledPostSchema.index({ postType: 1 });

module.exports = mongoose.model('ScheduledPost', scheduledPostSchema);

