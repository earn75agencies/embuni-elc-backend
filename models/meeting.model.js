const mongoose = require('mongoose');

const participantSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['host', 'participant'], default: 'participant' },
  joinedAt: { type: Date, default: Date.now }
});

const recordingSchema = new mongoose.Schema({
  url: { type: String, required: true },
  startedAt: { type: Date, required: true },
  endedAt: { type: Date },
  duration: { type: Number },
  fileSize: { type: Number },
  status: { type: String, enum: ['started', 'stopped', 'processing', 'completed', 'failed'], default: 'started' }
});

const meetingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  startTime: { type: Date, required: true },
  endTime: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  participants: [participantSchema],
  roomName: { type: String, required: true, unique: true },
  isActive: { type: Boolean, default: true },
  isRecurring: { type: Boolean, default: false },
  recurringPattern: {
    frequency: { type: String, enum: ['daily', 'weekly', 'monthly'] },
    interval: { type: Number, min: 1, default: 1 },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0 = Sunday, 1 = Monday, etc.
    endDate: Date,
    occurrences: Number
  },
  recordings: [recordingSchema],
  settings: {
    muteOnEntry: { type: Boolean, default: false },
    videoDisabled: { type: Boolean, default: false },
    screenSharing: { type: Boolean, default: true },
    waitingRoom: { type: Boolean, default: false },
    lobby: { type: Boolean, default: false },
    maxParticipants: { type: Number, default: 0 }, // 0 for unlimited
    recordingEnabled: { type: Boolean, default: false },
    chatEnabled: { type: Boolean, default: true },
    raiseHandEnabled: { type: Boolean, default: true },
    reactionsEnabled: { type: Boolean, default: true },
    participantApprovalRequired: { type: Boolean, default: false },
    allowJoinBeforeStart: { type: Boolean, default: false },
    autoEndAfterEndTime: { type: Boolean, default: true }
  },
  status: {
    type: String,
    enum: ['scheduled', 'started', 'ended', 'cancelled'],
    default: 'scheduled'
  },
  metadata: {
    type: Map,
    of: String,
    default: {}
  },
  timezone: { type: String, default: 'UTC' },
  isPrivate: { type: Boolean, default: false },
  password: { type: String, select: false },
  allowedEmails: [{ type: String }],
  tags: [{ type: String }]
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
meetingSchema.index({ roomName: 1 }, { unique: true });
meetingSchema.index({ createdBy: 1 });
meetingSchema.index({ startTime: 1 });
meetingSchema.index({ endTime: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ 'participants.user': 1 });
meetingSchema.index({ isActive: 1 });

// Virtual for duration in minutes
meetingSchema.virtual('durationInMinutes').get(function() {
  return (this.endTime - this.startTime) / (1000 * 60);
});

// Virtual for checking if meeting is active now
meetingSchema.virtual('isLive').get(function() {
  const now = new Date();
  return this.startTime <= now && this.endTime >= now && this.isActive && this.status === 'started';
});

// Pre-save hook to validate end time is after start time
meetingSchema.pre('save', function(next) {
  if (this.endTime <= this.startTime) {
    const err = new Error('End time must be after start time');
    return next(err);
  }
  next();
});

// Method to check if a user can join the meeting
meetingSchema.methods.canUserJoin = function(userId) {
  // If meeting is private, check if user is in allowed list or is the creator
  if (this.isPrivate) {
    const isAllowed = this.allowedEmails.some(email => 
      email === this.participants.find(p => p.user.toString() === userId.toString())?.email
    );
    return isAllowed || this.createdBy.toString() === userId.toString();
  }
  return true;
};

// Method to add a participant
meetingSchema.methods.addParticipant = function(userId, role = 'participant') {
  if (!this.participants.some(p => p.user.toString() === userId.toString())) {
    this.participants.push({ user: userId, role });
    return this.save();
  }
  return Promise.resolve(this);
};

// Method to remove a participant
meetingSchema.methods.removeParticipant = function(userId) {
  const participantIndex = this.participants.findIndex(
    p => p.user.toString() === userId.toString()
  );
  
  if (participantIndex > -1) {
    this.participants.splice(participantIndex, 1);
    return this.save();
  }
  
  return Promise.resolve(this);
};

// Method to check if a user is a participant
meetingSchema.methods.isParticipant = function(userId) {
  return this.participants.some(p => p.user.toString() === userId.toString());
};

// Method to check if a user is the host
meetingSchema.methods.isHost = function(userId) {
  return this.participants.some(
    p => p.user.toString() === userId.toString() && p.role === 'host'
  ) || this.createdBy.toString() === userId.toString();
};

// Method to start the meeting
meetingSchema.methods.startMeeting = function() {
  this.status = 'started';
  this.isActive = true;
  return this.save();
};

// Method to end the meeting
meetingSchema.methods.endMeeting = function() {
  this.status = 'ended';
  this.isActive = false;
  return this.save();
};

// Method to add a recording
meetingSchema.methods.addRecording = function(recordingData) {
  this.recordings.push(recordingData);
  return this.save();
};

// Static method to find active meetings
meetingSchema.statics.findActiveMeetings = function() {
  return this.find({ 
    isActive: true,
    status: { $in: ['scheduled', 'started'] },
    endTime: { $gt: new Date() }
  });
};

// Static method to find upcoming meetings for a user
meetingSchema.statics.findUpcomingForUser = function(userId, limit = 10) {
  return this.find({
    'participants.user': userId,
    startTime: { $gt: new Date() },
    isActive: true,
    status: 'scheduled'
  })
  .sort({ startTime: 1 })
  .limit(limit);
};

// Static method to find past meetings for a user
meetingSchema.statics.findPastForUser = function(userId, limit = 10) {
  return this.find({
    'participants.user': userId,
    endTime: { $lt: new Date() },
    isActive: false,
    status: 'ended'
  })
  .sort({ endTime: -1 })
  .limit(limit);
};

// Static method to find current meetings for a user
meetingSchema.statics.findCurrentForUser = function(userId) {
  const now = new Date();
  return this.find({
    'participants.user': userId,
    startTime: { $lte: now },
    endTime: { $gte: now },
    isActive: true,
    status: { $in: ['scheduled', 'started'] }
  });
};

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
