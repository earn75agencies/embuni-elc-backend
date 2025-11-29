/**
 * Two-Factor Authentication Model
 * Manages 2FA tokens and verification
 */

const mongoose = require('mongoose');

const twoFactorAuthSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },

  // 2FA Status
  enabled: {
    type: Boolean,
    default: false
  },
  method: {
    type: String,
    enum: ['totp', 'sms', 'email', 'app'],
    default: 'totp'
  },

  // TOTP (Time-based One-Time Password)
  secret: {
    type: String,
    select: false
  },
  backupCodes: [{
    code: {
      type: String,
      select: false
    },
    used: {
      type: Boolean,
      default: false
    },
    usedAt: Date
  }],

  // SMS/Email
  phoneNumber: String,
  emailVerified: {
    type: Boolean,
    default: false
  },

  // Verification
  verified: {
    type: Boolean,
    default: false
  },
  verifiedAt: Date,

  // Recovery
  recoveryEmail: String,
  recoveryPhone: String,

  // Security
  lastUsedAt: Date,
  failedAttempts: {
    type: Number,
    default: 0
  },
  lockedUntil: Date,

  // Trusted Devices
  trustedDevices: [{
    deviceId: String,
    deviceName: String,
    ip: String,
    userAgent: String,
    trustedAt: {
      type: Date,
      default: Date.now
    },
    lastUsedAt: Date
  }],

  // Settings
  requireOnLogin: {
    type: Boolean,
    default: true
  },
  requireOnAdminAction: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
twoFactorAuthSchema.index({ user: 1 });
twoFactorAuthSchema.index({ enabled: 1 });

module.exports = mongoose.model('TwoFactorAuth', twoFactorAuthSchema);

