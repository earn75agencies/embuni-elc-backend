const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  instructor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Leadership', 'Technical Skills', 'Professional Development', 'Entrepreneurship', 'Communication', 'Project Management']
  },
  level: {
    type: String,
    required: true,
    enum: ['Beginner', 'Intermediate', 'Advanced']
  },
  duration: {
    type: Number, // in hours
    required: true
  },
  thumbnail: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    default: 0
  },
  isFree: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  learningObjectives: [{
    type: String,
    trim: true
  }],
  syllabus: [{
    week: {
      type: Number,
      required: true
    },
    title: {
      type: String,
      required: true
    },
    description: String,
    lessons: [{
      title: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['video', 'reading', 'quiz', 'assignment', 'project'],
        required: true
      },
      duration: Number, // in minutes
      content: String, // URL or text content
      isRequired: {
        type: Boolean,
        default: true
      },
      order: Number
    }]
  }],
  resources: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['pdf', 'video', 'link', 'document'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    description: String
  }],
  assessments: [{
    title: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['quiz', 'assignment', 'project', 'exam'],
      required: true
    },
    week: Number,
    questions: [{
      question: {
        type: String,
        required: true
      },
      type: {
        type: String,
        enum: ['multiple-choice', 'true-false', 'short-answer', 'essay'],
        required: true
      },
      options: [String], // for multiple choice
      correctAnswer: String,
      points: {
        type: Number,
        default: 1
      }
    }],
    passingScore: {
      type: Number,
      default: 70
    },
    timeLimit: Number, // in minutes
    attempts: {
      type: Number,
      default: 3
    }
  }],
  enrollment: {
    maxStudents: {
      type: Number,
      default: 100
    },
    currentStudents: {
      type: Number,
      default: 0
    },
    startDate: Date,
    endDate: Date,
    isSelfPaced: {
      type: Boolean,
      default: true
    }
  },
  ratings: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for search functionality
courseSchema.index({ title: 'text', description: 'text', tags: 'text' });
courseSchema.index({ category: 1, level: 1 });
courseSchema.index({ 'ratings.average': -1 });

const enrollmentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrolledAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  progress: {
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    completedLessons: [{
      lessonId: String,
      completedAt: {
        type: Date,
        default: Date.now
      },
      timeSpent: Number // in minutes
    }],
    currentWeek: {
      type: Number,
      default: 1
    }
  },
  assessmentScores: [{
    assessmentId: String,
    score: Number,
    maxScore: Number,
    percentage: Number,
    attempts: Number,
    completedAt: {
      type: Date,
      default: Date.now
    }
  }],
  certificate: {
    issued: {
      type: Boolean,
      default: false
    },
    issuedAt: Date,
    certificateUrl: String
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'dropped', 'suspended'],
    default: 'active'
  },
  notes: String
}, {
  timestamps: true
});

// Compound index to prevent duplicate enrollments
enrollmentSchema.index({ user: 1, course: 1 }, { unique: true });

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  lesson: {
    lessonId: {
      type: String,
      required: true
    },
    type: {
      type: String,
      required: true
    }
  },
  startedAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date,
  timeSpent: {
    type: Number,
    default: 0
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  notes: String,
  bookmarks: [{
    timestamp: Number, // for videos
    note: String,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Compound index for unique user-course-lesson combinations
progressSchema.index({ user: 1, course: 1, 'lesson.lessonId': 1 }, { unique: true });

const Course = mongoose.model('Course', courseSchema);
const Enrollment = mongoose.model('Enrollment', enrollmentSchema);
const Progress = mongoose.model('Progress', progressSchema);

module.exports = {
  Course,
  Enrollment,
  Progress
};