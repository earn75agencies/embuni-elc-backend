const mongoose = require('mongoose');

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    unique: true
  },

  // Membership Details
  membershipNumber: {
    type: String,
    unique: true,
    required: true
  },
  membershipStatus: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'alumni'],
    default: 'active'
  },
  membershipTier: {
    type: String,
    enum: ['basic', 'active', 'leader', 'vip'],
    default: 'basic'
  },

  // Leadership
  leadershipRole: {
    type: String,
    enum: ['chairman', 'vice-chairman', 'secretary', 'treasurer', 'patron', 'advisor', 'none'],
    default: 'none'
  },
  leadershipDepartment: String,
  leadershipStartDate: Date,
  leadershipEndDate: Date,

  // Engagement Metrics
  volunteerHours: {
    type: Number,
    default: 0,
    min: 0
  },
  eventsAttended: {
    type: Number,
    default: 0,
    min: 0
  },
  eventsOrganized: {
    type: Number,
    default: 0,
    min: 0
  },
  postsCreated: {
    type: Number,
    default: 0,
    min: 0
  },

  // Badges & Achievements
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedDate: Date
  }],

  // Skills & Interests
  skills: [String],
  interests: [String],

  // Dates
  joinedDate: {
    type: Date,
    default: Date.now
  },
  lastActivityDate: {
    type: Date,
    default: null
  },

  // Additional Info
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },
  portfolio: String, // URL to portfolio or website

  // Engagement Preference
  emailNotifications: {
    type: Boolean,
    default: true
  },
  eventNotifications: {
    type: Boolean,
    default: true
  },

  // Compliance
  agreedToTerms: {
    type: Boolean,
    default: false
  },
  agreeTermsDate: Date,

  // Stats
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  rank: {
    type: String,
    default: 'Novice'
  }

}, {
  timestamps: true
});

// Index for faster queries
memberSchema.index({ user: 1 });
memberSchema.index({ membershipStatus: 1 });
memberSchema.index({ leadershipRole: 1 });
memberSchema.index({ joinedDate: -1 });

// Method to update activity
memberSchema.methods.updateLastActivity = async function() {
  this.lastActivityDate = new Date();
  return await this.save();
};

// Method to add volunteer hours
memberSchema.methods.addVolunteerHours = async function(hours) {
  this.volunteerHours += hours;
  this.totalPoints += hours * 10; // 10 points per hour
  return await this.save();
};

// Method to increment attended events
memberSchema.methods.addEventAttendance = async function() {
  this.eventsAttended += 1;
  this.totalPoints += 5; // 5 points per event
  return await this.save();
};

// Method to promote to leadership
memberSchema.methods.promoteToLeadership = async function(role, department) {
  this.leadershipRole = role;
  this.leadershipDepartment = department;
  this.leadershipStartDate = new Date();
  this.membershipTier = 'leader';
  this.totalPoints += 100; // 100 points for leadership
  return await this.save();
};

// Method to award badge
memberSchema.methods.awardBadge = async function(badge) {
  this.badges.push({
    ...badge,
    earnedDate: new Date()
  });
  this.totalPoints += 20; // 20 points per badge
  return await this.save();
};

memberSchema.set('toJSON', { virtuals: true });
memberSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Member', memberSchema);
