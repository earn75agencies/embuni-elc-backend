/**
 * Position Model
 * Represents a position in an election (e.g., Chairperson, Secretary)
 */

const mongoose = require('mongoose');

const positionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Position name is required'],
    trim: true,
    maxlength: [100, 'Position name cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Election Reference
  electionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Election',
    required: true
  },
  chapter: {
    type: String,
    required: true
  },

  // Ordering
  order: {
    type: Number,
    default: 0
  },

  // Statistics
  totalCandidates: {
    type: Number,
    default: 0
  },
  totalVotes: {
    type: Number,
    default: 0
  },

  // Metadata
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
positionSchema.index({ electionId: 1, order: 1 });
positionSchema.index({ chapter: 1 });
positionSchema.index({ electionId: 1 });

// Update candidate count when candidates are added/removed
positionSchema.methods.updateCandidateCount = async function() {
  const Candidate = mongoose.model('Candidate');
  const count = await Candidate.countDocuments({ positionId: this._id });
  this.totalCandidates = count;
  await this.save();
};

// Update vote count
positionSchema.methods.updateVoteCount = async function() {
  const Vote = mongoose.model('Vote');
  const count = await Vote.countDocuments({ positionId: this._id });
  this.totalVotes = count;
  await this.save();
};

module.exports = mongoose.model('Position', positionSchema);

