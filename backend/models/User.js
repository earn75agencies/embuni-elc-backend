const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  // Basic Information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    validate: [validator.isEmail, 'Please provide a valid email']
  },

  // Authentication
  password: {
    type: String,
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  googleId: {
    type: String,
    sparse: true,
    unique: true
  },
  authProvider: {
    type: String,
    enum: ['local', 'google'],
    default: 'local'
  },

  // Profile Information
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true
  },
  studentId: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        // If studentId is provided, it must match the university format
        // Format: UOEM/YYYY/XXXXX or UOE/YY/XXX
        // Examples: UOEM/2021/12345, UOE/21/123
        if (!v) {return true;} // Optional field
        const regNumberRegex = /^(UOE|UOEM)\/(\d{2}|\d{4})\/\d{3,6}$/;
        return regNumberRegex.test(v);
      },
      message: 'Student ID must be in format: UOEM/YYYY/XXXXX (e.g., UOEM/2021/12345)'
    },
    select: false // Never include in queries by default
  },
  yearOfStudy: {
    type: Number,
    min: 1,
    max: 6
  },
  course: {
    type: String,
    trim: true
  },

  // Role & Permissions
  // NOTE: Admin access is now determined by the Admin model, not this role field.
  // The 'admin' and 'moderator' values are kept for backward compatibility but
  // should not be used for authorization. Use Admin model checks instead.
  role: {
    type: String,
    enum: ['member', 'admin', 'moderator', 'leader'],
    default: 'member'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },

  // Membership Information
  membershipStatus: {
    type: String,
    enum: ['pending', 'active', 'inactive', 'suspended'],
    default: 'pending'
  },
  joinedDate: {
    type: Date,
    default: Date.now
  },

  // Leadership Position (if applicable)
  leadershipPosition: {
    type: String,
    trim: true
  },
  bio: {
    type: String,
    maxlength: [500, 'Bio cannot exceed 500 characters']
  },

  // Social Links
  socialLinks: {
    linkedin: String,
    twitter: String,
    instagram: String
  },

  // Professional Profile
  profile: {
    title: String,
    company: String,
    industry: {
      type: String,
      enum: ['technology', 'finance', 'healthcare', 'education', 'consulting', 'marketing', 'nonprofit', 'other']
    },
    experience: String,
    experienceLevel: {
      type: String,
      enum: ['early', 'mid', 'senior', 'executive']
    },
    location: String,
    website: String,
    skills: [String],
    interests: [String],
    bio: String,
    
    // Mentorship specific fields
    isMentor: {
      type: Boolean,
      default: false
    },
    mentorshipStatus: {
      type: String,
      enum: ['available', 'busy', 'not_available'],
      default: 'available'
    },
    mentorRating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0
    },
    mentorshipAreas: [String],
    responseTime: String,
    totalMentees: {
      type: Number,
      default: 0
    },
    availability: {
      monday: { available: Boolean, hours: String },
      tuesday: { available: Boolean, hours: String },
      wednesday: { available: Boolean, hours: String },
      thursday: { available: Boolean, hours: String },
      friday: { available: Boolean, hours: String },
      saturday: { available: Boolean, hours: String },
      sunday: { available: Boolean, hours: String }
    }
  },

  // Password Reset
  resetPasswordToken: String,
  resetPasswordExpire: Date,

  // Email Verification
  verificationToken: String,
  verificationTokenExpire: Date,

  // Tracking
  lastLogin: {
    type: Date
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) {
    return next();
  }

  // Only hash if password exists (Google OAuth users may not have password)
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }

  next();
});

// Method to compare password
userSchema.methods.matchPassword = async function(enteredPassword) {
  if (!this.password) {
    return false;
  }
  return await bcrypt.compare(enteredPassword, this.password);
};

// Method to get profile information (excludes sensitive data like studentId)
userSchema.methods.getProfileInfo = function() {
  return {
    id: this._id,
    firstName: this.firstName,
    lastName: this.lastName,
    fullName: `${this.firstName} ${this.lastName}`,
    email: this.email,
    avatar: this.avatar,
    phone: this.phone,
    role: this.role,
    isVerified: this.isVerified,
    membershipStatus: this.membershipStatus,
    joinedDate: this.joinedDate
    // Note: studentId is intentionally excluded for privacy
  };
};

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Transform to exclude sensitive fields from JSON output
userSchema.set('toJSON', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive fields from JSON output
    delete ret.studentId;
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.verificationToken;
    delete ret.verificationTokenExpire;
    return ret;
  }
});
userSchema.set('toObject', {
  virtuals: true,
  transform: function(doc, ret) {
    // Remove sensitive fields from object output
    delete ret.studentId;
    delete ret.password;
    delete ret.resetPasswordToken;
    delete ret.resetPasswordExpire;
    delete ret.verificationToken;
    delete ret.verificationTokenExpire;
    return ret;
  }
});

module.exports = mongoose.model('User', userSchema);
