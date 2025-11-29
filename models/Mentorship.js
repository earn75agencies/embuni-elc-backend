/**
 * Mentorship Model
 * Manages mentorship relationships and matching
 */

const mongoose = require('mongoose');

const mentorshipSchema = new mongoose.Schema({
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Matching Information
  matchScore: {
    type: Number,
    min: 0,
    max: 100
  },
  matchFactors: [{
    factor: String,
    weight: Number,
    score: Number
  }],
  matchedBy: {
    type: String,
    enum: ['ai', 'manual', 'self'],
    default: 'ai'
  },
  matchedAt: {
    type: Date,
    default: Date.now
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'active', 'completed', 'cancelled', 'on_hold'],
    default: 'pending'
  },
  startedAt: Date,
  completedAt: Date,

  // Goals & Objectives
  goals: [{
    title: String,
    description: String,
    targetDate: Date,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'cancelled'],
      default: 'not_started'
    },
    completedAt: Date
  }],

  // Sessions
  sessions: [{
    date: Date,
    duration: Number, // in minutes
    type: {
      type: String,
      enum: ['in_person', 'video', 'phone', 'email']
    },
    topics: [String],
    notes: String,
    menteeFeedback: {
      rating: Number,
      comment: String
    },
    mentorFeedback: {
      rating: Number,
      comment: String
    }
  }],

  // Communication
  communicationFrequency: {
    type: String,
    enum: ['weekly', 'biweekly', 'monthly', 'as_needed'],
    default: 'monthly'
  },
  preferredMethod: {
    type: String,
    enum: ['email', 'phone', 'video', 'in_person'],
    default: 'email'
  },

  // Areas of Focus
  focusAreas: [{
    area: String,
    priority: {
      type: Number,
      min: 1,
      max: 5
    }
  }],

  // Progress Tracking
  milestones: [{
    title: String,
    description: String,
    targetDate: Date,
    achievedDate: Date,
    status: {
      type: String,
      enum: ['pending', 'achieved', 'missed']
    }
  }],

  // Feedback
  menteeRating: {
    type: Number,
    min: 1,
    max: 5
  },
  menteeReview: String,
  mentorRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  mentorReview: String,

  // Metadata
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes
mentorshipSchema.index({ mentor: 1, status: 1 });
mentorshipSchema.index({ mentee: 1, status: 1 });
mentorshipSchema.index({ status: 1 });
mentorshipSchema.index({ matchScore: -1 });

// Prevent duplicate active mentorships
mentorshipSchema.index({ mentor: 1, mentee: 1, status: 1 }, { unique: true, partialFilterExpression: { status: { $in: ['pending', 'active'] } } });

module.exports = mongoose.model('Mentorship', mentorshipSchema);

