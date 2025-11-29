const mongoose = require('mongoose');

const galleryItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Gallery item title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },

  // Media
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required']
  },
  thumbnail: String,

  // Categorization
  category: {
    type: String,
    enum: ['event', 'team', 'activity', 'award', 'other'],
    required: true
  },
  tags: [String],

  // Reference to event (if applicable)
  eventReference: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },

  // Metadata
  dateTaken: {
    type: Date,
    default: Date.now
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  // Status & Moderation
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Engagement
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],

  // Credits
  photographer: String,
  credits: String
}, {
  timestamps: true
});

// Index for searching and filtering
galleryItemSchema.index({ category: 1, status: 1 });
galleryItemSchema.index({ dateTaken: -1 });
galleryItemSchema.index({ title: 'text', description: 'text' });

// Virtual for like count
galleryItemSchema.virtual('likeCount').get(function() {
  return this.likes ? this.likes.length : 0;
});

galleryItemSchema.set('toJSON', { virtuals: true });
galleryItemSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('GalleryItem', galleryItemSchema);
