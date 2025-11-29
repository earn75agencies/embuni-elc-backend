const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  provider: {
    name: {
      type: String,
      required: true
    },
    logo: String,
    website: String,
    contactEmail: String,
    type: {
      type: String,
      enum: ['University', 'Government', 'Private', 'Non-profit', 'Corporate'],
      required: true
    }
  },
  category: {
    type: String,
    required: true,
    enum: ['Undergraduate', 'Graduate', 'Postgraduate', 'Research', 'Professional Development', 'Technical', 'Arts', 'Sports']
  },
  level: {
    type: String,
    required: true,
    enum: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate', 'Professional']
  },
  fieldOfStudy: [{
    type: String,
    trim: true
  }],
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  awardType: {
    type: String,
    enum: ['Full Tuition', 'Partial Tuition', 'Living Expenses', 'Research Grant', 'Travel Grant', 'Book Allowance', 'Full Package'],
    required: true
  },
  duration: {
    type: String,
    enum: ['One-time', 'Semesterly', 'Annually', 'Multi-year'],
    required: true
  },
  location: {
    country: {
      type: String,
      required: true
    },
    city: String,
    remote: {
      type: Boolean,
      default: false
    }
  },
  eligibility: {
    nationality: [{
      type: String,
      trim: true
    }],
    ageRange: {
      min: Number,
      max: Number
    },
    academicRequirements: [{
      type: String,
      trim: true
    }],
    gpaMinimum: Number,
    financialNeed: {
      required: {
        type: Boolean,
        default: false
      },
      description: String
    },
    specificRequirements: [{
      type: String,
      trim: true
    }]
  },
  application: {
    openingDate: {
      type: Date,
      required: true
    },
    deadline: {
      type: Date,
      required: true
    },
    applicationUrl: String,
    applicationMethod: {
      type: String,
      enum: ['Online Portal', 'Email', 'Mail', 'In-person'],
      required: true
    },
    requiredDocuments: [{
      type: String,
      trim: true
    }],
    applicationFee: {
      type: Number,
      default: 0
    },
    interviewRequired: {
      type: Boolean,
      default: false
    },
    selectionProcess: String
  },
  statistics: {
    totalAwards: {
      type: Number,
      default: 1
    },
    applicationsPerYear: {
      type: Number,
      default: 0
    },
    successRate: {
      type: Number,
      default: 0
    },
    averageAwardAmount: Number
  },
  benefits: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  featured: {
    type: Boolean,
    default: false
  },
  active: {
    type: Boolean,
    default: true
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
scholarshipSchema.index({ title: 'text', description: 'text', tags: 'text', 'provider.name': 'text' });
scholarshipSchema.index({ category: 1, level: 1 });
scholarshipSchema.index({ amount: -1 });
scholarshipSchema.index({ 'application.deadline': 1 });
scholarshipSchema.index({ featured: -1, active: -1 });

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scholarship: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Scholarship',
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'shortlisted', 'accepted', 'rejected', 'withdrawn'],
    default: 'draft'
  },
  personalInformation: {
    fullName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    phone: String,
    dateOfBirth: Date,
    nationality: {
      type: String,
      required: true
    },
    currentResidence: String,
    gender: String
  },
  academicBackground: {
    currentInstitution: String,
    levelOfStudy: {
      type: String,
      enum: ['High School', 'Undergraduate', 'Graduate', 'Postgraduate'],
      required: true
    },
    fieldOfStudy: {
      type: String,
      required: true
    },
    gpa: Number,
    gpaScale: Number,
    graduationYear: Number,
    achievements: [{
      type: String,
      trim: true
    }]
  },
  financialInformation: {
    annualIncome: Number,
    familyIncome: Number,
    financialNeedStatement: String,
    otherScholarships: [{
      name: String,
      amount: Number,
      duration: String
    }]
  },
  documents: [{
    name: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['Transcript', 'Resume', 'Essay', 'Recommendation', 'Portfolio', 'Certificate', 'ID', 'Financial Statement'],
      required: true
    },
    url: {
      type: String,
      required: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  essays: [{
    question: {
      type: String,
      required: true
    },
    answer: {
      type: String,
      required: true
    },
    wordCount: Number
  }],
  recommendations: [{
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    position: String,
    institution: String,
    relationship: String,
    status: {
      type: String,
      enum: ['pending', 'submitted', 'declined'],
      default: 'pending'
    },
    submittedAt: Date,
    letter: String
  }],
  submissionDate: Date,
  reviewDate: Date,
  reviewerNotes: String,
  finalDecision: {
    status: {
      type: String,
      enum: ['accepted', 'rejected', 'waitlisted'],
      default: 'rejected'
    },
    amount: Number,
    duration: String,
    conditions: String,
    notifiedAt: Date
  },
  notifications: [{
    type: {
      type: String,
      enum: ['application_received', 'under_review', 'interview_scheduled', 'decision_made', 'additional_info_required'],
      required: true
    },
    message: String,
    sentAt: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    }
  }]
}, {
  timestamps: true
});

// Compound index to prevent duplicate applications
applicationSchema.index({ user: 1, scholarship: 1 }, { unique: true });

const Scholarship = mongoose.model('Scholarship', scholarshipSchema);
const Application = mongoose.model('Application', applicationSchema);

module.exports = {
  Scholarship,
  Application
};