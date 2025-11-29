/**
 * Voting Link Model
 * Manages one-time voting link tokens
 */

const mongoose = require('mongoose');

const votingLinkSchema = new mongoose.Schema({
  // Member Information
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberEmail: {
    type: String,
    required: true
  },

  // Election Information
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  chapter: {
    type: String,
    required: true
  },

  // Token Information
  token: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  tokenHash: {
    type: String,
    required: true,
    unique: true,
    index: true
  },

  // Status
  status: {
    type: String,
    enum: ['pending', 'sent', 'used', 'expired', 'revoked'],
    default: 'pending'
  },

  // Usage Tracking
  usedAt: Date,
  usedForPositions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position'
  }],

  // Expiration
  expiresAt: {
    type: Date,
    required: true,
    index: { expireAfterSeconds: 0 }
  },

  // Generation Information
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  generatedAt: {
    type: Date,
    default: Date.now
  },

  // Email Information
  emailSent: {
    type: Boolean,
    default: false
  },
  emailSentAt: Date,

  // Access Tracking
  accessedAt: Date,
  accessCount: {
    type: Number,
    default: 0
  },
  lastAccessIp: String
}, {
  timestamps: true
});

// Indexes
votingLinkSchema.index({ memberId: 1, electionId: 1 });
votingLinkSchema.index({ tokenHash: 1 });
votingLinkSchema.index({ status: 1 });
votingLinkSchema.index({ expiresAt: 1 });

// Method: Mark as used
votingLinkSchema.methods.markAsUsed = async function(positionIds = []) {
  this.status = 'used';
  this.usedAt = new Date();
  this.usedForPositions = positionIds;
  await this.save();
};

// Method: Check if valid
votingLinkSchema.methods.isValid = function() {
  const now = new Date();
  return this.status === 'pending' || this.status === 'sent' &&
         now < this.expiresAt;
};

// Static method: Find by token hash
votingLinkSchema.statics.findByTokenHash = function(tokenHash) {
  return this.findOne({ tokenHash, status: { $in: ['pending', 'sent'] } });
};

module.exports = mongoose.model('VotingLink', votingLinkSchema);

