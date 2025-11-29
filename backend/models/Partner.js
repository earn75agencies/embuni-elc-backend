/**
 * Partner Model
 * Manages partner organizations, sponsors, and collaborators
 */

const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  // Basic Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  website: {
    type: String,
    trim: true,
    validate: {
      validator: function(v) {
        return !v || /^https?:\/\/.+/.test(v);
      },
      message: 'Website must be a valid URL'
    }
  },
  logo: {
    type: String,
    trim: true
  },

  // Partner Classification
  type: {
    type: String,
    enum: ['sponsor', 'partner', 'collaborator'],
    default: 'partner'
  },

  // Contact Information
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Contact email must be valid'
    }
  },
  contactPhone: {
    type: String,
    trim: true
  },

  // Status and Display
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  featured: {
    type: Boolean,
    default: false
  },
  order: {
    type: Number,
    default: 0
  },

  // Metadata
  addedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
partnerSchema.index({ type: 1, status: 1 });
partnerSchema.index({ featured: 1, order: 1 });
partnerSchema.index({ name: 'text', description: 'text' });

// Static methods
partnerSchema.statics.getActivePartners = function(type = null) {
  const query = { status: 'active' };
  if (type) {
    query.type = type;
  }
  return this.find(query).sort({ featured: -1, order: 1, name: 1 });
};

partnerSchema.statics.getFeaturedPartners = function(limit = 10) {
  return this.find({
    status: 'active',
    featured: true
  })
    .sort({ order: 1, name: 1 })
    .limit(limit);
};

partnerSchema.statics.searchPartners = function(searchTerm, filters = {}) {
  const query = {
    status: 'active',
    ...filters
  };

  if (searchTerm) {
    query.$text = { $search: searchTerm };
  }

  return this.find(query)
    .sort({ featured: -1, order: 1, name: 1 });
};

// Instance methods
partnerSchema.methods.toPublicJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    description: this.description,
    website: this.website,
    logo: this.logo,
    type: this.type,
    status: this.status,
    featured: this.featured,
    order: this.order,
    createdAt: this.createdAt
  };
};

module.exports = mongoose.model('Partner', partnerSchema);
