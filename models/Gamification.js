/**
 * Gamification Model
 * Tracks points, badges, achievements, and leaderboards
 */

const mongoose = require('mongoose');

const gamificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Points System
  totalPoints: {
    type: Number,
    default: 0,
    min: 0
  },
  pointsHistory: [{
    points: Number,
    source: {
      type: String,
      enum: ['event_attendance', 'event_organization', 'post_creation', 'comment', 'volunteer', 'mentorship', 'achievement', 'daily_login', 'referral', 'other']
    },
    description: String,
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    earnedAt: {
      type: Date,
      default: Date.now
    }
  }],

  // Badges & Achievements
  badges: [{
    badgeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Badge'
    },
    name: String,
    description: String,
    icon: String,
    category: String,
    earnedAt: {
      type: Date,
      default: Date.now
    },
    level: {
      type: Number,
      default: 1
    }
  }],

  achievements: [{
    achievementId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Achievement'
    },
    name: String,
    description: String,
    icon: String,
    category: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    progress: {
      type: Number,
      default: 100,
      min: 0,
      max: 100
    }
  }],

  // Levels & Tiers
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  experienceToNextLevel: {
    type: Number,
    default: 100
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum', 'diamond'],
    default: 'bronze'
  },

  // Learning Modules
  learningModules: [{
    moduleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'LearningModule'
    },
    title: String,
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completed: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    startedAt: Date,
    lastAccessedAt: Date,
    quizScores: [{
      quizId: String,
      score: Number,
      maxScore: Number,
      completedAt: Date
    }]
  }],

  // Streaks
  loginStreak: {
    type: Number,
    default: 0
  },
  lastLoginDate: Date,
  longestStreak: {
    type: Number,
    default: 0
  },

  // Leaderboard Position
  leaderboardRank: Number,
  categoryRanks: {
    events: Number,
    posts: Number,
    volunteer: Number,
    mentorship: Number,
    overall: Number
  },

  // Statistics
  stats: {
    eventsAttended: { type: Number, default: 0 },
    eventsOrganized: { type: Number, default: 0 },
    postsCreated: { type: Number, default: 0 },
    commentsMade: { type: Number, default: 0 },
    volunteerHours: { type: Number, default: 0 },
    mentorshipSessions: { type: Number, default: 0 },
    badgesEarned: { type: Number, default: 0 },
    achievementsUnlocked: { type: Number, default: 0 }
  },

  // Preferences
  showOnLeaderboard: {
    type: Boolean,
    default: true
  },
  notificationsEnabled: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
gamificationSchema.index({ totalPoints: -1 });
gamificationSchema.index({ level: -1 });
gamificationSchema.index({ tier: 1 });
gamificationSchema.index({ 'stats.eventsAttended': -1 });

module.exports = mongoose.model('Gamification', gamificationSchema);

