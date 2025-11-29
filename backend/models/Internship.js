const mongoose = require('mongoose');

const internshipSchema = new mongoose.Schema({
  // Company Information
  company: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    logo: String,
    website: String,
    description: String,
    industry: {
      type: String,
      enum: ['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'other'],
      required: true
    },
    size: {
      type: String,
      enum: ['startup', 'small', 'medium', 'large', 'enterprise']
    },
    location: {
      address: String,
      city: String,
      country: String,
      remote: {
        type: Boolean,
        default: false
      },
      hybrid: {
        type: Boolean,
        default: false
      }
    },
    contact: {
      name: String,
      email: String,
      phone: String,
      department: String
    }
  },

  // Internship Details
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  requirements: [{
    type: String,
    required: true
  }],
  responsibilities: [{
    type: String,
    required: true
  }],
  skills: [{
    type: String,
    required: true
  }],
  
  // Duration and Schedule
  duration: {
    type: Number,
    required: true, // in weeks
    min: 1,
    max: 52
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  schedule: {
    type: String,
    enum: ['full_time', 'part_time', 'flexible'],
    default: 'full_time'
  },
  hoursPerWeek: {
    type: Number,
    min: 1,
    max: 40
  },

  // Compensation
  isPaid: {
    type: Boolean,
    default: false
  },
  stipend: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    frequency: {
      type: String,
      enum: ['weekly', 'monthly', 'stipend']
    }
  },
  benefits: [String],

  // Application Process
  applicationDeadline: {
    type: Date,
    required: true
  },
  applicationMethod: {
    type: String,
    enum: ['portal', 'email', 'external', 'custom'],
    default: 'portal'
  },
  applicationUrl: String,
  applicationEmail: String,
  requiredDocuments: [{
    type: String,
    enum: ['resume', 'cover_letter', 'transcript', 'portfolio', 'references']
  }],

  // Target Audience
  targetAudience: {
    educationLevels: [{
      type: String,
      enum: ['undergraduate', 'graduate', 'phd', 'recent_graduate']
    }],
    fieldsOfStudy: [String],
    experienceLevel: {
      type: String,
      enum: ['entry_level', 'some_experience', 'experienced']
    },
    minGpa: Number,
    citizenshipRequirements: [String],
    languageRequirements: [String]
  },

  // Status and Metadata
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'filled', 'cancelled'],
    default: 'draft'
  },
  featured: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },

  // Applications
  applications: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'shortlisted', 'interview_scheduled', 'interview_completed', 'offered', 'accepted', 'rejected', 'withdrawn'],
      default: 'submitted'
    },
    resume: String,
    coverLetter: String,
    portfolio: String,
    transcript: String,
    notes: String,
    interviewDates: [Date],
    feedback: String,
    rejectionReason: String,
    offerDetails: {
      salary: Number,
      startDate: Date,
      benefits: [String]
    }
  }],

  // Partnership Information
  partnership: {
    isPartner: {
      type: Boolean,
      default: false
    },
    partnershipLevel: {
      type: String,
      enum: ['bronze', 'silver', 'gold', 'platinum'],
      default: 'bronze'
    },
    partnershipStartDate: Date,
    partnershipEndDate: Date,
    benefits: [String],
    contactPerson: {
      name: String,
      email: String,
      phone: String,
      title: String
    }
  },

  // Analytics
  views: {
    type: Number,
    default: 0
  },
  clicks: {
    type: Number,
    default: 0
  },
  applicationsCount: {
    type: Number,
    default: 0
  },

  // SEO and Marketing
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  tags: [String],

  // Created by
  postedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Approval workflow
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  approvedAt: Date,
  rejectionReason: String

}, {
  timestamps: true
});

// Indexes for performance
internshipSchema.index({ 'company.name': 1, status: 1 });
internshipSchema.index({ status: 1, featured: 1 });
internshipSchema.index({ applicationDeadline: 1 });
internshipSchema.index({ 'company.industry': 1 });
internshipSchema.index({ skills: 1 });
internshipSchema.index({ 'targetAudience.fieldsOfStudy': 1 });
internshipSchema.index({ 'applications.student': 1, 'applications.status': 1 });

// Virtual for checking if application is still open - Fixed syntax
internshipSchema.virtual('isAcceptingApplications').get(function() {
  return this.status === 'active' && new Date(this.applicationDeadline) > new Date();
});

// Virtual for days until deadline
internshipSchema.virtual('daysUntilDeadline').get(function() {
  const deadline = new Date(this.applicationDeadline);
  const now = new Date();
  const diffTime = deadline - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Method to add application
internshipSchema.methods.addApplication = function(studentId, applicationData) {
  // Check if student has already applied
  const existingApplication = this.applications.find(app => 
    app.student.toString() === studentId.toString()
  );

  if (existingApplication) {
    throw new Error('Student has already applied to this internship');
  }

  this.applications.push({
    student: studentId,
    ...applicationData
  });
  this.applicationsCount += 1;
  return this.save();
};

// Method to update application status
internshipSchema.methods.updateApplicationStatus = function(studentId, status, updateData = {}) {
  const application = this.applications.find(app => 
    app.student.toString() === studentId.toString()
  );

  if (!application) {
    throw new Error('Application not found');
  }

  application.status = status;
  Object.assign(application, updateData);
  return this.save();
};

// Static method to find active internships
internshipSchema.statics.findActive = function(filters = {}) {
  const query = {
    status: 'active',
    applicationDeadline: { $gt: new Date() },
    ...filters
  };

  return this.find(query)
    .populate('postedBy', 'name email')
    .sort({ featured: -1, priority: -1, createdAt: -1 });
};

// Static method to find internships by student eligibility
internshipSchema.statics.findByEligibility = function(studentProfile) {
  const query = {
    status: 'active',
    applicationDeadline: { $gt: new Date() }
  };

  // Education level filter
  if (studentProfile.educationLevel) {
    query['targetAudience.educationLevels'] = studentProfile.educationLevel;
  }

  // Field of study filter
  if (studentProfile.fieldOfStudy) {
    query['targetAudience.fieldsOfStudy'] = { $in: [studentProfile.fieldOfStudy, 'any'] };
  }

  // GPA filter
  if (studentProfile.gpa && studentProfile.gpa > 0) {
    query.$or = [
      { 'targetAudience.minGpa': { $lte: studentProfile.gpa } },
      { 'targetAudience.minGpa': { $exists: false } }
    ];
  }

  return this.find(query)
    .populate('postedBy', 'name email')
    .sort({ featured: -1, priority: -1, createdAt: -1 });
};

module.exports = mongoose.model('Internship', internshipSchema);