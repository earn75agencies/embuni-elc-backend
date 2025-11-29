/**
 * Candidate Model
 * Represents a candidate running for a position
 */

const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Candidate name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },

  // References
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

  // Candidate Information
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: String,
  bio: {
    type: String,
    maxlength: [1000, 'Bio cannot exceed 1000 characters']
  },
  manifesto: {
    type: String,
    maxlength: [5000, 'Manifesto cannot exceed 5000 characters']
  },

  // Media
  photoUrl: {
    type: String,
    default: null
  },
  photoPublicId: String, // Cloudinary public ID

  // Voting Statistics
  votesCount: {
    type: Number,
    default: 0,
    min: 0
  },
  votePercentage: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isWithdrawn: {
    type: Boolean,
    default: false
  },
  withdrawnAt: Date,

  // Ordering
  order: {
    type: Number,
    default: 0
  },

  // Additional Info
  qualifications: [String],
  achievements: [String],
  socialLinks: {
    linkedin: String,
    twitter: String,
    website: String
  }
}, {
  timestamps: true
});

// Indexes
candidateSchema.index({ positionId: 1, order: 1 });
candidateSchema.index({ electionId: 1 });
candidateSchema.index({ chapter: 1 });
candidateSchema.index({ votesCount: -1 });

// Method: Update vote count and percentage
candidateSchema.methods.updateVoteStats = async function() {
  const Vote = mongoose.model('Vote');
  const Position = mongoose.model('Position');

  // Get total votes for this position
  const position = await Position.findById(this.positionId);
  if (!position) {return;}

  // Get candidate votes
  const votes = await Vote.countDocuments({ candidateId: this._id });
  this.votesCount = votes;

  // Calculate percentage
  if (position.totalVotes > 0) {
    this.votePercentage = (votes / position.totalVotes * 100).toFixed(2);
  } else {
    this.votePercentage = 0;
  }

  await this.save();
};

// Method: Increment vote count atomically
candidateSchema.statics.incrementVote = async function(candidateId) {
  return this.findByIdAndUpdate(
    candidateId,
    { $inc: { votesCount: 1 } },
    { new: true }
  );
};

module.exports = mongoose.model('Candidate', candidateSchema);

