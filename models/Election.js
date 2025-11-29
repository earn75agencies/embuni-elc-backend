/**
 * Election Model
 * Manages election windows and lifecycle
 */

const mongoose = require('mongoose');

const electionSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Election title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },

  // Chapter Information
  chapter: {
    type: String,
    required: [true, 'Chapter is required'],
    trim: true
  },
  isNational: {
    type: Boolean,
    default: false
  },

  // Status & Timeline
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'closed', 'cancelled'],
    default: 'pending'
  },
  startTime: {
    type: Date,
    required: [true, 'Start time is required']
  },
  endTime: {
    type: Date,
    required: [true, 'End time is required'],
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'End time must be after start time'
    }
  },

  // Approval
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,

  // Voting Configuration
  allowMultiplePositions: {
    type: Boolean,
    default: true
  },
  requireVerification: {
    type: Boolean,
    default: true
  },
  publicResults: {
    type: Boolean,
    default: false
  },

  // Statistics
  totalEligibleVoters: {
    type: Number,
    default: 0
  },
  totalVotesCast: {
    type: Number,
    default: 0
  },
  turnoutPercentage: {
    type: Number,
    default: 0
  },

  // Metadata
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes
electionSchema.index({ chapter: 1, status: 1 });
electionSchema.index({ status: 1 });
electionSchema.index({ startTime: 1, endTime: 1 });
electionSchema.index({ createdAt: -1 });

// Virtual: Check if election is currently active
electionSchema.virtual('isActive').get(function() {
  const now = new Date();
  return this.status === 'active' &&
         now >= this.startTime &&
         now <= this.endTime;
});

// Method: Start election
electionSchema.methods.start = async function(adminId) {
  if (this.status !== 'approved') {
    throw new Error('Only approved elections can be started');
  }
  this.status = 'active';
  await this.save();
  return this;
};

// Method: Close election
electionSchema.methods.close = async function() {
  if (this.status !== 'active') {
    throw new Error('Only active elections can be closed');
  }
  this.status = 'closed';
  await this.save();
  return this;
};

// Method: Calculate turnout
electionSchema.methods.calculateTurnout = async function() {
  const Vote = mongoose.model('Vote');
  const votesCount = await Vote.countDocuments({
    electionId: this._id
  });

  this.totalVotesCast = votesCount;
  if (this.totalEligibleVoters > 0) {
    this.turnoutPercentage = (votesCount / this.totalEligibleVoters * 100).toFixed(2);
  }
  await this.save();
  return this.turnoutPercentage;
};

module.exports = mongoose.model('Election', electionSchema);

