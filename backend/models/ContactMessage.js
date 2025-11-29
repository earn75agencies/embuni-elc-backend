/**
 * ContactMessage Model
 * Stores contact form submissions from users
 */

const mongoose = require('mongoose');

const contactMessageSchema = new mongoose.Schema({
  // Contact Information
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  email: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: function(v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: 'Email must be valid'
    }
  },
  phone: {
    type: String,
    trim: true,
    maxlength: 20
  },

  // Message Content
  subject: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  message: {
    type: String,
    required: true,
    trim: true,
    maxlength: 2000
  },

  // Message Classification
  category: {
    type: String,
    enum: ['general', 'membership', 'partnership', 'technical', 'feedback', 'other'],
    default: 'general'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },

  // Status and Processing
  status: {
    type: String,
    enum: ['pending', 'in-progress', 'resolved', 'closed'],
    default: 'pending'
  },

  // Response Information
  response: {
    type: String,
    trim: true,
    maxlength: 2000
  },
  respondedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  respondedAt: {
    type: Date
  },

  // Internal Notes
  internalNotes: {
    type: String,
    trim: true,
    maxlength: 1000
  },

  // Metadata
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  },
  referrer: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
contactMessageSchema.index({ status: 1, createdAt: -1 });
contactMessageSchema.index({ category: 1, status: 1 });
contactMessageSchema.index({ priority: 1, status: 1 });
contactMessageSchema.index({ email: 1 });
contactMessageSchema.index({ createdAt: -1 });

// Static methods
contactMessageSchema.statics.getPendingMessages = function() {
  return this.find({ status: 'pending' })
    .sort({ priority: -1, createdAt: 1 });
};

contactMessageSchema.statics.getMessagesByStatus = function(status, limit = null) {
  const query = this.find({ status })
    .sort({ priority: -1, createdAt: -1 });

  if (limit) {
    query.limit(limit);
  }

  return query;
};

contactMessageSchema.statics.searchMessages = function(searchTerm, filters = {}) {
  const query = {
    ...filters
  };

  if (searchTerm) {
    query.$or = [
      { name: { $regex: searchTerm, $options: 'i' } },
      { email: { $regex: searchTerm, $options: 'i' } },
      { subject: { $regex: searchTerm, $options: 'i' } },
      { message: { $regex: searchTerm, $options: 'i' } }
    ];
  }

  return this.find(query)
    .sort({ priority: -1, createdAt: -1 });
};

contactMessageSchema.statics.getMessageStats = function() {
  return this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
};

// Instance methods
contactMessageSchema.methods.respond = function(response, respondedBy) {
  this.response = response;
  this.respondedBy = respondedBy;
  this.respondedAt = new Date();
  this.status = 'resolved';
  return this.save();
};

contactMessageSchema.methods.updateStatus = function(status, internalNotes = '') {
  this.status = status;
  if (internalNotes) {
    this.internalNotes = internalNotes;
  }
  return this.save();
};

contactMessageSchema.methods.toAdminJSON = function() {
  return {
    _id: this._id,
    name: this.name,
    email: this.email,
    phone: this.phone,
    subject: this.subject,
    message: this.message,
    category: this.category,
    priority: this.priority,
    status: this.status,
    response: this.response,
    respondedBy: this.respondedBy,
    respondedAt: this.respondedAt,
    internalNotes: this.internalNotes,
    ipAddress: this.ipAddress,
    createdAt: this.createdAt,
    updatedAt: this.updatedAt
  };
};

module.exports = mongoose.model('ContactMessage', contactMessageSchema);
