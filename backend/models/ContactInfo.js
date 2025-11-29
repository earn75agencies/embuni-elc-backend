/**
 * ContactInfo Model
 * Stores contact information and social media links for the chapter
 * This is a singleton model - only one document should exist
 */

const mongoose = require('mongoose');

const contactInfoSchema = new mongoose.Schema({
  // Contact Information
  email: {
    type: String,
    trim: true,
    lowercase: true,
    default: ''
  },
  phone: {
    type: String,
    trim: true,
    default: ''
  },
  address: {
    type: String,
    trim: true,
    default: ''
  },
  googleMapEmbed: {
    type: String,
    default: ''
  },

  // Social Media Links
  socialLinks: {
    facebook: {
      type: String,
      trim: true,
      default: ''
    },
    twitter: {
      type: String,
      trim: true,
      default: ''
    },
    instagram: {
      type: String,
      trim: true,
      default: ''
    },
    linkedin: {
      type: String,
      trim: true,
      default: ''
    },
    youtube: {
      type: String,
      trim: true,
      default: ''
    }
  },

  // Office Hours
  officeHours: {
    weekdays: {
      type: String,
      default: '9:00 AM - 5:00 PM'
    },
    saturday: {
      type: String,
      default: '10:00 AM - 2:00 PM'
    },
    sunday: {
      type: String,
      default: 'Closed'
    }
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one document exists
contactInfoSchema.statics.getContactInfo = async function() {
  let contactInfo = await this.findOne();
  if (!contactInfo) {
    contactInfo = await this.create({});
  }
  return contactInfo;
};

// Update contact info
contactInfoSchema.statics.updateContactInfo = async function(data, userId) {
  const contactInfo = await this.getContactInfo();

  // Update fields
  if (data.email !== undefined) {contactInfo.email = data.email;}
  if (data.phone !== undefined) {contactInfo.phone = data.phone;}
  if (data.address !== undefined) {contactInfo.address = data.address;}
  if (data.googleMapEmbed !== undefined) {contactInfo.googleMapEmbed = data.googleMapEmbed;}

  if (data.socialLinks) {
    if (data.socialLinks.facebook !== undefined) {contactInfo.socialLinks.facebook = data.socialLinks.facebook;}
    if (data.socialLinks.twitter !== undefined) {contactInfo.socialLinks.twitter = data.socialLinks.twitter;}
    if (data.socialLinks.instagram !== undefined) {contactInfo.socialLinks.instagram = data.socialLinks.instagram;}
    if (data.socialLinks.linkedin !== undefined) {contactInfo.socialLinks.linkedin = data.socialLinks.linkedin;}
    if (data.socialLinks.youtube !== undefined) {contactInfo.socialLinks.youtube = data.socialLinks.youtube;}
  }

  if (data.officeHours) {
    if (data.officeHours.weekdays !== undefined) {contactInfo.officeHours.weekdays = data.officeHours.weekdays;}
    if (data.officeHours.saturday !== undefined) {contactInfo.officeHours.saturday = data.officeHours.saturday;}
    if (data.officeHours.sunday !== undefined) {contactInfo.officeHours.sunday = data.officeHours.sunday;}
  }

  if (userId) {
    contactInfo.lastUpdatedBy = userId;
  }

  await contactInfo.save();
  return contactInfo;
};

module.exports = mongoose.model('ContactInfo', contactInfoSchema);

