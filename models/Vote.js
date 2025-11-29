/**
 * Vote Model
 * Immutable vote records - once cast, cannot be modified or deleted
 */

const mongoose = require('mongoose');

const voteSchema = new mongoose.Schema({
  // Voter Information
  memberId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  memberEmail: {
    type: String,
    required: true
  },
  memberName: {
    type: String,
    required: true
  },

  // Vote Details
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true
  },
  positionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Position',
    required: true
  },
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  chapter: {
    type: String,
    required: true
  },

  // Voting Link Token (for audit)
  linkToken: {
    type: String,
    index: true
  },
  linkTokenHash: {
    type: String,
    index: true
  },

  // Timestamp
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },

  // Audit Information
  ipAddress: String,
  userAgent: String,

  // Verification
  verified: {
    type: Boolean,
    default: true
  },

  // Status (for potential disputes)
  status: {
    type: String,
    enum: ['cast', 'disputed', 'invalidated'],
    default: 'cast'
  },
  invalidatedAt: Date,
  invalidatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  invalidationReason: String
}, {
  timestamps: true
});

// Indexes - Critical for performance
voteSchema.index({ memberId: 1, positionId: 1, electionId: 1 }, { unique: true });
voteSchema.index({ electionId: 1, positionId: 1 });
voteSchema.index({ candidateId: 1 });
voteSchema.index({ timestamp: -1 });
voteSchema.index({ chapter: 1 });
voteSchema.index({ linkTokenHash: 1 });

// Prevent updates and deletes
voteSchema.pre('findOneAndUpdate', function() {
  throw new Error('Votes are immutable and cannot be updated');
});

voteSchema.pre('findOneAndDelete', function() {
  throw new Error('Votes are immutable and cannot be deleted');
});

voteSchema.pre('deleteMany', function() {
  throw new Error('Votes are immutable and cannot be deleted');
});

// Method: Check if member already voted for position
voteSchema.statics.hasVoted = async function(memberId, positionId, electionId) {
  const vote = await this.findOne({
    memberId,
    positionId,
    electionId,
    status: 'cast'
  });
  return !!vote;
};

// Method: Get vote count for candidate
voteSchema.statics.getCandidateVotes = async function(candidateId) {
  return this.countDocuments({
    candidateId,
    status: 'cast'
  });
};

// Method: Get position vote count
voteSchema.statics.getPositionVotes = async function(positionId) {
  return this.countDocuments({
    positionId,
    status: 'cast'
  });
};

module.exports = mongoose.model('Vote', voteSchema);

