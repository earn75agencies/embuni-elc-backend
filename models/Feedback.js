/**
 * Feedback Model
 * Handles feedback and ratings for events, posts, and services
 */

const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Target of Feedback
  targetType: {
    type: String,
    enum: ['event', 'post', 'service', 'mentorship', 'admin', 'general'],
    required: true
  },
  targetId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'targetType'
  },

  // Rating
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },

  // Feedback Details
  title: String,
  comment: {
    type: String,
    maxlength: 1000
  },

  // Categories
  categories: [{
    category: String,
    rating: {
      type: Number,
      min: 1,
      max: 5
    }
  }],

  // Specific Feedback Areas
  aspects: {
    content: Number,
    organization: Number,
    value: Number,
    communication: Number,
    overall: Number
  },

  // Recommendations
  wouldRecommend: {
    type: Boolean
  },
  suggestions: String,

  // Status
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'flagged'],
    default: 'pending'
  },
  moderatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  moderatedAt: Date,
  moderationNotes: String,

  // Helpfulness
  helpfulCount: {
    type: Number,
    default: 0
  },
  helpfulUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Response
  response: {
    text: String,
    respondedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    respondedAt: Date
  },

  // Metadata
  isAnonymous: {
    type: Boolean,
    default: false
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
feedbackSchema.index({ targetType: 1, targetId: 1 });
feedbackSchema.index({ user: 1 });
feedbackSchema.index({ rating: -1 });
feedbackSchema.index({ status: 1 });
feedbackSchema.index({ createdAt: -1 });

// Prevent duplicate feedback from same user
feedbackSchema.index({ user: 1, targetType: 1, targetId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);

