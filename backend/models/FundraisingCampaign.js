/**
 * Fundraising Campaign Model
 * Fundraising campaign management
 */

const mongoose = require('mongoose');

const fundraisingCampaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,

  // Goals
  targetAmount: {
    type: Number,
    required: true,
    min: 0
  },
  currentAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },

  // Dates
  startDate: {
    type: Date,
    required: true
  },
  endDate: Date,

  // Status
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'cancelled'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Media
  coverImage: String,
  images: [String],
  videoUrl: String,

  // Organizer
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Purpose
  purpose: {
    type: String,
    enum: ['scholarship', 'program', 'infrastructure', 'emergency', 'general', 'other'],
    required: true
  },
  purposeDetails: String,

  // Updates
  updates: [{
    title: String,
    content: String,
    image: String,
    postedAt: {
      type: Date,
      default: Date.now
    },
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Donors
  donors: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Donation'
  }],
  donorCount: {
    type: Number,
    default: 0
  },

  // Milestones
  milestones: [{
    amount: Number,
    title: String,
    description: String,
    achieved: {
      type: Boolean,
      default: false
    },
    achievedAt: Date
  }],

  // Sharing
  shareCount: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },

  // Metadata
  tags: [String],
  slug: String
}, {
  timestamps: true
});

// Indexes
fundraisingCampaignSchema.index({ status: 1, isFeatured: 1 });
fundraisingCampaignSchema.index({ organizer: 1 });
fundraisingCampaignSchema.index({ startDate: 1, endDate: 1 });
fundraisingCampaignSchema.index({ currentAmount: -1 });

module.exports = mongoose.model('FundraisingCampaign', fundraisingCampaignSchema);

