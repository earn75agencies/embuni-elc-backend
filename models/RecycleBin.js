/**
 * Recycle Bin Model
 * Stores deleted items for potential restoration
 */

const mongoose = require('mongoose');

const recycleBinSchema = new mongoose.Schema({
  // Item Information
  itemType: {
    type: String,
    enum: ['post', 'event', 'gallery', 'member', 'comment', 'document', 'other'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  originalData: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },

  // Deletion Information
  deletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  deletedAt: {
    type: Date,
    default: Date.now
  },
  deletionReason: String,

  // Restoration
  restored: {
    type: Boolean,
    default: false
  },
  restoredBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  restoredAt: Date,

  // Permanent Deletion
  permanentlyDeleted: {
    type: Boolean,
    default: false
  },
  permanentlyDeletedAt: Date,
  permanentlyDeletedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },

  // Metadata
  metadata: {
    title: String,
    description: String,
    slug: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }
}, {
  timestamps: true
});

// Indexes
recycleBinSchema.index({ itemType: 1, itemId: 1 });
recycleBinSchema.index({ deletedBy: 1 });
recycleBinSchema.index({ deletedAt: -1 });
recycleBinSchema.index({ restored: 1 });
recycleBinSchema.index({ permanentlyDeleted: 1 });

// Auto-delete after 30 days
recycleBinSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 2592000 }); // 30 days

module.exports = mongoose.model('RecycleBin', recycleBinSchema);

