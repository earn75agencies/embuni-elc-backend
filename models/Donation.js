/**
 * Donation Model
 * Donation and fundraising tracking
 */

const mongoose = require('mongoose');

const donationSchema = new mongoose.Schema({
  // Donor Information
  donor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  donorName: {
    type: String,
    required: true
  },
  donorEmail: {
    type: String,
    required: true
  },
  donorPhone: String,
  isAnonymous: {
    type: Boolean,
    default: false
  },

  // Campaign
  campaign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FundraisingCampaign'
  },

  // Amount
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'KES'
  },

  // Payment
  paymentMethod: {
    type: String,
    enum: ['mpesa', 'card', 'bank_transfer', 'paypal', 'other'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentReference: String,

  // Receipt
  receiptNumber: String,
  receiptSent: {
    type: Boolean,
    default: false
  },
  receiptSentAt: Date,

  // Recognition
  recognitionLevel: {
    type: String,
    enum: ['none', 'name_only', 'full', 'anonymous'],
    default: 'name_only'
  },
  showOnWall: {
    type: Boolean,
    default: true
  },

  // Metadata
  notes: String,
  tags: [String]
}, {
  timestamps: true
});

// Indexes
donationSchema.index({ donor: 1 });
donationSchema.index({ campaign: 1 });
donationSchema.index({ paymentStatus: 1 });
donationSchema.index({ createdAt: -1 });
donationSchema.index({ amount: -1 });

module.exports = mongoose.model('Donation', donationSchema);

