const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  shortDescription: {
    type: String,
    maxlength: [300, 'Short description cannot exceed 300 characters']
  },

  // Event Details
  eventType: {
    type: String,
    enum: ['workshop', 'seminar', 'community-service', 'networking', 'training', 'conference', 'social', 'other'],
    required: true
  },
  category: {
    type: String,
    enum: ['leadership', 'mentorship', 'service', 'networking', 'skills', 'social'],
    required: true
  },

  // Date & Time
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },

  // Location
  location: {
    venue: {
      type: String,
      required: [true, 'Venue is required']
    },
    address: String,
    building: String,
    room: String,
    isVirtual: {
      type: Boolean,
      default: false
    },
    virtualLink: String
  },

  // Registration
  requiresRegistration: {
    type: Boolean,
    default: true
  },
  maxAttendees: {
    type: Number,
    min: 0
  },
  registrationDeadline: Date,
  registrationLink: String,

  // Media
  coverImage: {
    type: String,
    required: true
  },
  images: [String],

  // Organizers & Speakers
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  speakers: [{
    name: String,
    title: String,
    bio: String,
    photo: String
  }],

  // Status
  status: {
    type: String,
    enum: ['draft', 'published', 'ongoing', 'completed', 'cancelled'],
    default: 'draft'
  },
  isFeatured: {
    type: Boolean,
    default: false
  },

  // Attendees
  attendees: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    registeredAt: {
      type: Date,
      default: Date.now
    },
    attended: {
      type: Boolean,
      default: false
    }
  }],

  // Additional Info
  tags: [String],
  requirements: [String],
  agenda: [{
    time: String,
    activity: String,
    description: String
  }],

  // Engagement
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Index for searching
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ startDate: 1 });
eventSchema.index({ status: 1 });

// Virtual for registration count
eventSchema.virtual('registrationCount').get(function() {
  return this.attendees ? this.attendees.length : 0;
});

// Virtual for spots remaining
eventSchema.virtual('spotsRemaining').get(function() {
  if (!this.maxAttendees) {return null;}
  return this.maxAttendees - (this.attendees ? this.attendees.length : 0);
});

eventSchema.set('toJSON', { virtuals: true });
eventSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Event', eventSchema);
