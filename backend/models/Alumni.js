/**
 * Alumni Model
 * Tracks alumni members and their connection to current members
 */

const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // Alumni Information
  graduationYear: {
    type: Number,
    required: true,
    min: 2000,
    max: new Date().getFullYear() + 10
  },
  graduationDate: Date,
  degree: {
    type: String,
    required: true,
    trim: true
  },
  fieldOfStudy: {
    type: String,
    required: true,
    trim: true
  },
  honors: [String],

  // Professional Information
  currentPosition: {
    title: String,
    company: String,
    industry: {
      type: String,
      enum: ['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'government', 'other']
    },
    startDate: Date,
    description: String
  },

  // Career History
  careerHistory: [{
    title: String,
    company: String,
    industry: String,
    startDate: Date,
    endDate: Date,
    current: Boolean,
    description: String,
    achievements: [String]
  }],

  // Skills and Expertise
  skills: {
    technical: [String],
    soft: [String],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'native']
      }
    }],
    certifications: [{
      name: String,
      issuer: String,
      date: Date,
      expiryDate: Date,
      credentialId: String,
      credentialUrl: String
    }]
  },

  // Contact and Social
  contactInfo: {
    email: String,
    phone: String,
    linkedin: String,
    twitter: String,
    website: String,
    location: {
      city: String,
      country: String,
      remote: Boolean
    }
  },

  // Networking Preferences
  networking: {
    availableForMentorship: {
      type: Boolean,
      default: false
    },
    mentorshipAreas: [String],
    willingToSpeak: {
      type: Boolean,
      default: false
    },
    speakingTopics: [String],
    openToCollaboration: {
      type: Boolean,
      default: false
    },
    collaborationInterests: [String],
    jobSeeking: {
      type: Boolean,
      default: false
    },
    jobInterests: [String],
    networkingGoals: [String]
  },

  // Privacy Settings
  privacy: {
    profileVisibility: {
      type: String,
      enum: ['public', 'alumni_only', 'private'],
      default: 'public'
    },
    contactVisible: {
      type: Boolean,
      default: true
    },
    showCurrentPosition: {
      type: Boolean,
      default: true
    },
    showCareerHistory: {
      type: Boolean,
      default: true
    },
    showContactInfo: {
      type: Boolean,
      default: false
    }
  },

  // Alumni Status
  status: {
    type: String,
    enum: ['active', 'inactive', 'deceased'],
    default: 'active'
  },
  isAmbassador: {
    type: Boolean,
    default: false
  },
  ambassadorRole: {
    type: String,
    enum: ['regional', 'national', 'international', 'none'],
    default: 'none'
  },

  // Engagement
  willingToMentor: {
    type: Boolean,
    default: false
  },
  mentorshipAreas: [String],
  availableForEvents: {
    type: Boolean,
    default: false
  },
  eventParticipation: [{
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event'
    },
    role: String, // speaker, panelist, organizer
    date: Date
  }],

  // Achievements
  achievements: [{
    title: String,
    description: String,
    date: Date,
    category: String
  }],

  // Social Features
  connections: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    connectedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined'],
      default: 'pending'
    },
    initiatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],

  // Events and Activities
  events: [{
    type: {
      type: String,
      enum: ['reunion', 'conference', 'workshop', 'networking', 'speaking_engagement', 'other']
    },
    title: String,
    description: String,
    date: Date,
    location: String,
    role: String,
    organizer: String
  }],

  // Achievements and Recognition
  achievements: [{
    title: String,
    description: String,
    date: Date,
    category: {
      type: String,
      enum: ['career', 'academic', 'community', 'personal', 'other']
    },
    recognition: String
  }],

  // Testimonials and Recommendations
  testimonials: [{
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    content: String,
    rating: {
      type: Number,
      min:1,
      max: 5
    },
    relationship: String,
    date: {
      type: Date,
      default: Date.now
    },
    verified: {
      type: Boolean,
      default: false
    }
  }],

  // Resources and Contributions
  contributions: [{
    type: {
      type: String,
      enum: ['article', 'resource', 'job_posting', 'mentorship', 'speaking', 'donation']
    },
    title: String,
    description: String,
    url: String,
    date: {
      type: Date,
      default: Date.now
    },
    tags: [String]
  }],

  // Analytics
  profileViews: {
    type: Number,
    default: 0
  },
  connectionRequests: {
    type: Number,
    default: 0
  },
  lastActive: {
    type: Date,
    default: Date.now
  },

  // Verification
  isVerified: {
    type: Boolean,
    default: false
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verifiedAt: Date,

  // Featured Alumni
  featured: {
    type: Boolean,
    default: false
  },
  featuredAt: Date,
  featuredReason: String,

  // Engagement Metrics
  mentorshipSessions: {
    type: Number,
    default: 0
  },
  eventsAttended: {
    type: Number,
    default: 0
  },
  contributions: [{
    type: {
      type: String,
      enum: ['donation', 'sponsorship', 'volunteer', 'speaker', 'other']
    },
    amount: Number,
    description: String,
    date: Date
  }],

  // Preferences
  newsletterSubscription: {
    type: Boolean,
    default: true
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  publicProfile: {
    type: Boolean,
    default: true
  },

  // Additional Info
  bio: {
    type: String,
    maxlength: 1000
  },
  testimonial: String,
  photo: String,

  // Metadata
  lastContactDate: Date,
  notes: String
}, {
  timestamps: true
});

// Indexes for performance
alumniSchema.index({ user: 1 });
alumniSchema.index({ graduationYear: 1 });
alumniSchema.index({ 'currentPosition.industry': 1 });
alumniSchema.index({ 'skills.technical': 1 });
alumniSchema.index({ 'networking.availableForMentorship': 1 });
alumniSchema.index({ 'privacy.profileVisibility': 1 });
alumniSchema.index({ featured: 1 });
alumniSchema.index({ isVerified: 1 });
alumniSchema.index({ 'connections.user': 1, 'connections.status': 1 });

// Virtual for full name
alumniSchema.virtual('fullName').get(function() {
  return this.user ? `${this.user.firstName} ${this.user.lastName}` : '';
});

// Virtual for years since graduation
alumniSchema.virtual('yearsSinceGraduation').get(function() {
  return new Date().getFullYear() - this.graduationYear;
});

// Virtual for connection count
alumniSchema.virtual('connectionCount').get(function() {
  return this.connections.filter(conn => conn.status === 'accepted').length;
});

// Method to add connection
alumniSchema.methods.addConnection = function(userId, initiatedBy) {
  // Check if connection already exists
  const existingConnection = this.connections.find(conn => 
    conn.user.toString() === userId.toString()
  );

  if (existingConnection) {
    throw new Error('Connection already exists');
  }

  this.connections.push({
    user: userId,
    initiatedBy,
    status: 'pending'
  });
  this.connectionRequests += 1;
  return this.save();
};

// Method to accept connection
alumniSchema.methods.acceptConnection = function(userId) {
  const connection = this.connections.find(conn => 
    conn.user.toString() === userId.toString()
  );

  if (!connection) {
    throw new Error('Connection not found');
  }

  connection.status = 'accepted';
  return this.save();
};

// Method to decline connection
alumniSchema.methods.declineConnection = function(userId) {
  const connectionIndex = this.connections.findIndex(conn => 
    conn.user.toString() === userId.toString()
  );

  if (connectionIndex === -1) {
    throw new Error('Connection not found');
  }

  this.connections.splice(connectionIndex, 1);
  return this.save();
};

// Method to add testimonial
alumniSchema.methods.addTestimonial = function(authorId, content, rating, relationship) {
  this.testimonials.push({
    author: authorId,
    content,
    rating,
    relationship,
    date: new Date()
  });
  return this.save();
};

// Method to increment profile views
alumniSchema.methods.incrementProfileViews = function() {
  this.profileViews += 1;
  this.lastActive = new Date();
  return this.save();
};

// Static method to find alumni by filters
alumniSchema.statics.findByFilters = function(filters = {}) {
  const query = {};

  // Privacy filter - only show public profiles unless specified
  if (!filters.includePrivate) {
    query['privacy.profileVisibility'] = 'public';
  }

  // Industry filter
  if (filters.industry) {
    query['currentPosition.industry'] = filters.industry;
  }

  // Graduation year filter
  if (filters.graduationYear) {
    query.graduationYear = filters.graduationYear;
  }

  // Graduation year range
  if (filters.graduationYearRange) {
    query.graduationYear = {
      $gte: filters.graduationYearRange.min,
      $lte: filters.graduationYearRange.max
    };
  }

  // Skills filter
  if (filters.skills) {
    const skillArray = Array.isArray(filters.skills) ? filters.skills : [filters.skills];
    query.$or = [
      { 'skills.technical': { $in: skillArray } },
      { 'skills.soft': { $in: skillArray } }
    ];
  }

  // Location filter
  if (filters.location) {
    query['contactInfo.location.city'] = new RegExp(filters.location, 'i');
  }

  // Networking preferences
  if (filters.availableForMentorship) {
    query['networking.availableForMentorship'] = true;
  }

  if (filters.openToCollaboration) {
    query['networking.openToCollaboration'] = true;
  }

  // Featured filter
  if (filters.featured) {
    query.featured = true;
  }

  // Verified filter
  if (filters.verified) {
    query.isVerified = true;
  }

  return this.find(query)
    .populate('user', 'firstName lastName email avatar')
    .populate('connections.user', 'firstName lastName avatar')
    .sort({ featured: -1, isVerified: -1, graduationYear: -1 });
};

// Static method to get alumni statistics
alumniSchema.statics.getStatistics = function() {
  return this.aggregate([
    {
      $group: {
        _id: null,
        totalAlumni: { $sum: 1 },
        averageGraduationYear: { $avg: '$graduationYear' },
        industryDistribution: {
          $push: '$currentPosition.industry'
        },
        mentorshipAvailable: {
          $sum: { $cond: ['$networking.availableForMentorship', 1, 0] }
        },
        verifiedAlumni: {
          $sum: { $cond: ['$isVerified', 1, 0] }
        }
      }
    },
    {
      $project: {
        _id: 0,
        totalAlumni: 1,
        averageGraduationYear: { $round: ['$averageGraduationYear', 0] },
        industryDistribution: 1,
        mentorshipAvailable: 1,
        verifiedAlumni: 1,
        mentorshipPercentage: {
          $multiply: [
            { $divide: ['$mentorshipAvailable', '$totalAlumni'] },
            100
          ]
        },
        verificationPercentage: {
          $multiply: [
            { $divide: ['$verifiedAlumni', '$totalAlumni'] },
            100
          ]
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Alumni', alumniSchema);

