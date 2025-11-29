/**
 * Voting Log Model
 * Comprehensive audit log for all voting-related actions
 */

const mongoose = require('mongoose');

const votingLogSchema = new mongoose.Schema({
  // Actor Information
  actorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  actorEmail: String,
  actorRole: {
    type: String,
    enum: ['superadmin', 'chapter-admin', 'member', 'system']
  },

  // Action Details
  action: {
    type: String,
    required: true,
    enum: [
      'election_created',
      'election_approved',
      'election_started',
      'election_closed',
      'position_created',
      'candidate_added',
      'candidate_updated',
      'candidate_withdrawn',
      'vote_link_generated',
      'vote_link_validated',
      'vote_cast',
      'vote_invalidated',
      'results_viewed',
      'results_exported',
      'admin_created',
      'admin_disabled'
    ]
  },

  // Resource Information
  resource: {
    type: {
      type: String,
      enum: ['election', 'position', 'candidate', 'vote', 'admin', 'link']
    },
    id: mongoose.Schema.Types.ObjectId
  },

  // Context
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election'
  },
  chapter: String,

  // Details
  details: {
    type: mongoose.Schema.Types.Mixed
  },
  message: String,

  // Request Information
  ip: String,
  userAgent: String,
  requestId: String,

  // Status
  success: {
    type: Boolean,
    default: true
  },
  errorMessage: String
}, {
  timestamps: true
});

// Indexes
votingLogSchema.index({ actorId: 1, createdAt: -1 });
votingLogSchema.index({ action: 1, createdAt: -1 });
votingLogSchema.index({ electionId: 1, createdAt: -1 });
votingLogSchema.index({ chapter: 1, createdAt: -1 });
votingLogSchema.index({ 'resource.type': 1, 'resource.id': 1 });
votingLogSchema.index({ createdAt: -1 });

// Static method: Log action
votingLogSchema.statics.log = async function(data) {
  return this.create(data);
};

module.exports = mongoose.model('VotingLog', votingLogSchema);

