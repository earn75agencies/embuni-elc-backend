/**
 * Badge Model
 * Defines available badges that can be earned
 */

const mongoose = require('mongoose');

const badgeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  icon: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['events', 'posts', 'volunteer', 'mentorship', 'learning', 'social', 'achievement', 'special'],
    required: true
  },

  // Requirements
  requirements: {
    type: {
      type: String,
      enum: ['points', 'count', 'streak', 'custom'],
      required: true
    },
    value: Number,
    metric: String, // e.g., 'events_attended', 'posts_created'
    condition: {
      type: String,
      enum: ['equals', 'greater_than', 'less_than', 'between']
    }
  },

  // Levels
  hasLevels: {
    type: Boolean,
    default: false
  },
  levels: [{
    level: Number,
    name: String,
    description: String,
    icon: String,
    requirement: Number
  }],

  // Points Awarded
  pointsAward: {
    type: Number,
    default: 0
  },

  // Visibility
  isActive: {
    type: Boolean,
    default: true
  },
  isRare: {
    type: Boolean,
    default: false
  },
  rarity: {
    type: String,
    enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
    default: 'common'
  },

  // Metadata
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [String]
}, {
  timestamps: true
});

// Indexes
badgeSchema.index({ category: 1 });
badgeSchema.index({ isActive: 1 });
badgeSchema.index({ rarity: 1 });

module.exports = mongoose.model('Badge', badgeSchema);

