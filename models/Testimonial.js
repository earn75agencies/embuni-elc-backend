/**
 * Testimonial Model
 * Manages testimonials from students, alumni, partners, and faculty
 */

const mongoose = require('mongoose');

const testimonialSchema = new mongoose.Schema({
  // Author Information
  authorName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  authorRole: {
    type: String,
    enum: ['student', 'alumni', 'partner', 'faculty'],
    required: true
  },
  authorImage: {
    type: String,
    trim: true
  },
  authorTitle: {
    type: String,
    trim: true,
    maxlength: 150
  },
  authorOrganization: {
    type: String,
    trim: true,
    maxlength: 150
  },

  // Testimonial Content
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },

  // Status and Display
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },

  // Review Information
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reviewedAt: {
    type: Date
  },
  reviewNotes: {
    type: String,
    trim: true,
    maxlength: 500
  },

  // Metadata
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
testimonialSchema.index({ status: 1, featured: 1, order: 1 });
testimonialSchema.index({ authorRole: 1, status: 1 });
testimonialSchema.index({ featured: 1, order: 1 });
testimonialSchema.index({ content: 'text', authorName: 'text' });

// Static methods
testimonialSchema.statics.getApprovedTestimonials = function(limit = null) {
  const query = this.find({ status: 'approved' })
    .sort({ featured: -1, order: 1, createdAt: -1 });

  if (limit) {
    query.limit(limit);
  }

  return query;
};

testimonialSchema.statics.getFeaturedTestimonials = function(limit = 5) {
  return this.find({
    status: 'approved',
    featured: true
  })
    .sort({ order: 1, createdAt: -1 })
    .limit(limit);
};

testimonialSchema.statics.getTestimonialsByRole = function(role, limit = null) {
  const query = this.find({
    status: 'approved',
    authorRole: role
  })
    .sort({ featured: -1, order: 1, createdAt: -1 });

  if (limit) {
    query.limit(limit);
  }

  return query;
};

testimonialSchema.statics.searchTestimonials = function(searchTerm, filters = {}) {
  const query = {
    status: 'approved',
    ...filters
  };

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  return this.find(query)
    .sort({ featured: -1, order: 1, createdAt: -1 });
};

testimonialSchema.statics.getPendingTestimonials = function() {
  return this.find({ status: 'pending' })
    .sort({ createdAt: 1 });
};

// Instance methods
testimonialSchema.methods.approve = function(reviewedBy, reviewNotes = '') {
  this.status = 'approved';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  return this.save();
};

testimonialSchema.methods.reject = function(reviewedBy, reviewNotes = '') {
  this.status = 'rejected';
  this.reviewedBy = reviewedBy;
  this.reviewedAt = new Date();
  this.reviewNotes = reviewNotes;
  return this.save();
};

testimonialSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    authorName: this.authorName,
    authorRole: this.authorRole,
    authorTitle: this.authorTitle,
    authorOrganization: this.authorOrganization,
    authorImage: this.authorImage,
    content: this.content,
    rating: this.rating,
    featured: this.featured,
    order: this.order,
    createdAt: this.createdAt
  };
};

testimonialSchema.methods.toAdminJSON = function() {
  return {
    ...this.toPublicJSON(),
    status: this.status,
    reviewedBy: this.reviewedBy,
    reviewedAt: this.reviewedAt,
    reviewNotes: this.reviewNotes,
    addedBy: this.addedBy,
    lastUpdatedBy: this.lastUpdatedBy,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('Testimonial', testimonialSchema);
