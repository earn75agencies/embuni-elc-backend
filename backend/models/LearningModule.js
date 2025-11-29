/**
 * Learning Module Model
 * Gamified learning modules with quizzes and progress tracking
 */

const mongoose = require('mongoose');

const learningModuleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  shortDescription: String,

  // Content
  content: {
    type: String,
    required: true
  },
  videoUrl: String,
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document']
    }
  }],

  // Category
  category: {
    type: String,
    enum: ['leadership', 'communication', 'project_management', 'networking', 'personal_development', 'technical', 'other'],
    required: true
  },
  tags: [String],

  // Difficulty & Duration
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedDuration: Number, // in minutes
  pointsAward: {
    type: Number,
    default: 0
  },

  // Quizzes
  quizzes: [{
    question: {
      type: String,
      required: true
    },
    options: [String],
    correctAnswer: Number,
    explanation: String,
    points: {
      type: Number,
      default: 1
    }
  }],

  // Prerequisites
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'LearningModule'
  }],

  // Badge/Achievement
  badgeAward: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Badge'
  },

  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  publishedAt: Date,

  // Author
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Statistics
  stats: {
    completions: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    averageTime: { type: Number, default: 0 }
  },

  // Order
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
learningModuleSchema.index({ category: 1, isPublished: 1 });
learningModuleSchema.index({ difficulty: 1 });
learningModuleSchema.index({ isActive: 1 });
learningModuleSchema.index({ order: 1 });

module.exports = mongoose.model('LearningModule', learningModuleSchema);

