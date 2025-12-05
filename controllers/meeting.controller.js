const Meeting = require('../models/meeting.model');
const User = require('../models/user.model');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/email');
const { Cache } = require('../config/cache');

// Cache instance for meeting tokens
const meetingCache = new Cache(3600); // 1 hour cache

// Generate Jitsi JWT token
const generateJitsiJWT = (user, roomName, isModerator = false) => {
  const payload = {
    context: {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar
      },
      features: {
        livestreaming: true,
        recording: true,
        transcription: true,
        'outbound-call': true
      }
    },
    aud: process.env.JITSI_APP_ID || 'vpaas-magic-cookie',
    iss: process.env.JITSI_APP_ID || 'vpaas-magic-cookie',
    sub: process.env.JITSI_DOMAIN || 'meet.jit.si',
    room: roomName,
    moderator: isModerator,
    nbf: Math.floor(Date.now() / 1000) - 10, // Not before 10 seconds ago
    exp: Math.floor(Date.now() / 1000) + (60 * 60), // Expires in 1 hour
    id: uuidv4()
  };

  return jwt.sign(payload, process.env.JITSI_APP_SECRET || 'your-secret-key', { algorithm: 'HS256' });
};

// Create a new meeting
exports.createMeeting = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      startTime, 
      endTime, 
      isRecurring, 
      recurringPattern, 
      settings, 
      timezone, 
      isPrivate, 
      password, 
      allowedEmails, 
      tags 
    } = req.body;

    // Generate a unique room name
    const roomName = `meeting-${uuidv4()}`;
    
    // Create meeting
    const meeting = new Meeting({
      title,
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      createdBy: req.user._id,
      roomName,
      isRecurring: isRecurring || false,
      recurringPattern: isRecurring ? recurringPattern : undefined,
      settings: {
        muteOnEntry: settings?.muteOnEntry || false,
        videoDisabled: settings?.videoDisabled || false,
        screenSharing: settings?.screenSharing !== false, // default true
        waitingRoom: settings?.waitingRoom || false,
        lobby: settings?.lobby || false,
        maxParticipants: settings?.maxParticipants || 0, // 0 for unlimited
        recordingEnabled: settings?.recordingEnabled || false,
        chatEnabled: settings?.chatEnabled !== false, // default true
        raiseHandEnabled: settings?.raiseHandEnabled !== false, // default true
        reactionsEnabled: settings?.reactionsEnabled !== false, // default true
        participantApprovalRequired: settings?.participantApprovalRequired || false,
        allowJoinBeforeStart: settings?.allowJoinBeforeStart || false,
        autoEndAfterEndTime: settings?.autoEndAfterEndTime !== false // default true
      },
      timezone: timezone || 'UTC',
      isPrivate: isPrivate || false,
      password: password ? await bcrypt.hash(password, 10) : undefined,
      allowedEmails: isPrivate && allowedEmails ? allowedEmails : [],
      tags: tags || [],
      participants: [{
        user: req.user._id,
        role: 'host',
        joinedAt: new Date()
      }]
    });

    await meeting.save();

    // Generate JWT token for the host
    const token = generateJitsiJWT(req.user, roomName, true);

    // Add to cache
    meetingCache.set(`meeting:${roomName}`, meeting);
    meetingCache.set(`token:${roomName}:${req.user._id}`, token);

    res.status(201).json({
      success: true,
      data: {
        meeting,
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get meeting details
exports.getMeeting = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    // Try to get from cache first
    const cachedMeeting = meetingCache.get(`meeting:${roomName}`);
    let meeting;
    
    if (cachedMeeting) {
      meeting = cachedMeeting;
    } else {
      meeting = await Meeting.findOne({ roomName })
        .populate('createdBy', 'name email avatar')
        .populate('participants.user', 'name email avatar');
      
      if (!meeting) {
        return res.status(404).json({
          success: false,
          error: 'Meeting not found'
        });
      }
      
      // Cache the meeting
      meetingCache.set(`meeting:${roomName}`, meeting);
    }

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Join a meeting
exports.joinMeeting = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const { password } = req.body;
    
    // Get meeting from cache or database
    let meeting = meetingCache.get(`meeting:${roomName}`);
    
    if (!meeting) {
      meeting = await Meeting.findOne({ roomName });
      
      if (!meeting) {
        return res.status(404).json({
          success: false,
          error: 'Meeting not found'
        });
      }
      
      // Cache the meeting
      meetingCache.set(`meeting:${roomName}`, meeting);
    }

    // Check if meeting is active
    if (!meeting.isActive || meeting.status === 'ended' || meeting.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        error: 'This meeting is not active or has ended'
      });
    }

    // Check if meeting has started
    const now = new Date();
    if (now < meeting.startTime && !meeting.settings.allowJoinBeforeStart) {
      return res.status(400).json({
        success: false,
        error: 'This meeting has not started yet'
      });
    }

    // Check if meeting is private and requires password
    if (meeting.isPrivate) {
      if (password) {
        const isPasswordValid = await bcrypt.compare(password, meeting.password);
        if (!isPasswordValid) {
          return res.status(401).json({
            success: false,
            error: 'Invalid password'
          });
        }
      } else if (!meeting.allowedEmails.includes(req.user.email)) {
        return res.status(403).json({
          success: false,
          error: 'You are not authorized to join this meeting'
        });
      }
    }

    // Check if user is already a participant
    const isParticipant = meeting.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    // If not a participant and approval is required
    if (!isParticipant && meeting.settings.participantApprovalRequired) {
      // In a real app, you might want to notify the host and wait for approval
      return res.status(403).json({
        success: false,
        error: 'Approval from the host is required to join this meeting'
      });
    }

    // Add user as participant if not already added
    if (!isParticipant) {
      meeting.participants.push({
        user: req.user._id,
        role: 'participant',
        joinedAt: new Date()
      });
      
      await meeting.save();
      meetingCache.set(`meeting:${roomName}`, meeting);
    }

    // Generate JWT token for the participant
    const isModerator = meeting.participants.some(
      p => p.user.toString() === req.user._id.toString() && p.role === 'host'
    ) || meeting.createdBy.toString() === req.user._id.toString();

    const token = generateJitsiJWT(req.user, roomName, isModerator);
    
    // Cache the token
    meetingCache.set(`token:${roomName}:${req.user._id}`, token);

    res.status(200).json({
      success: true,
      data: {
        meeting,
        token,
        isModerator
      }
    });
  } catch (error) {
    next(error);
  }
};

// End a meeting
exports.endMeeting = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    const meeting = await Meeting.findOne({ 
      roomName,
      createdBy: req.user._id // Only the creator can end the meeting
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or you are not authorized to end this meeting'
      });
    }

    // Update meeting status
    meeting.status = 'ended';
    meeting.isActive = false;
    meeting.endTime = new Date();
    
    await meeting.save();
    
    // Clear meeting from cache
    meetingCache.del(`meeting:${roomName}`);

    // Notify participants (in a real app, you might use WebSocket)
    await this.notifyMeetingEnded(meeting);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// List meetings
exports.listMeetings = async (req, res, next) => {
  try {
    const { status, limit = 10, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    
    const query = {};
    
    if (status) {
      query.status = status;
    }
    
    // For non-admin users, only show their meetings
    if (!req.user.isAdmin) {
      query.$or = [
        { 'participants.user': req.user._id },
        { createdBy: req.user._id }
      ];
    }
    
    const meetings = await Meeting.find(query)
      .populate('createdBy', 'name email')
      .sort({ startTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Meeting.countDocuments(query);
    
    res.status(200).json({
      success: true,
      data: {
        meetings,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
          limit: parseInt(limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

// Update meeting
exports.updateMeeting = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const updates = req.body;
    
    const meeting = await Meeting.findOne({ 
      roomName,
      createdBy: req.user._id // Only the creator can update the meeting
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or you are not authorized to update this meeting'
      });
    }
    
    // Prevent updating certain fields
    const allowedUpdates = [
      'title', 'description', 'startTime', 'endTime', 'settings', 
      'isPrivate', 'password', 'allowedEmails', 'tags'
    ];
    
    // Only update allowed fields
    Object.keys(updates).forEach(update => {
      if (allowedUpdates.includes(update)) {
        if (update === 'password' && updates[update]) {
          // Hash the password before saving
          meeting[update] = bcrypt.hashSync(updates[update], 10);
        } else if (update === 'settings') {
          // Merge settings
          meeting.settings = { ...meeting.settings, ...updates[update] };
        } else {
          meeting[update] = updates[update];
        }
      }
    });
    
    await meeting.save();
    
    // Update cache
    meetingCache.set(`meeting:${roomName}`, meeting);

    res.status(200).json({
      success: true,
      data: meeting
    });
  } catch (error) {
    next(error);
  }
};

// Delete a meeting
exports.deleteMeeting = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    const meeting = await Meeting.findOneAndDelete({ 
      roomName,
      createdBy: req.user._id // Only the creator can delete the meeting
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or you are not authorized to delete this meeting'
      });
    }
    
    // Clear meeting from cache
    meetingCache.del(`meeting:${roomName}`);

    res.status(200).json({
      success: true,
      data: {}
    });
  } catch (error) {
    next(error);
  }
};

// Get meeting token
exports.getMeetingToken = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    // Check cache first
    const cachedToken = meetingCache.get(`token:${roomName}:${req.user._id}`);
    if (cachedToken) {
      return res.status(200).json({
        success: true,
        data: {
          token: cachedToken
        }
      });
    }
    
    // If not in cache, check if user is a participant
    const meeting = await Meeting.findOne({
      roomName,
      'participants.user': req.user._id
    });
    
    if (!meeting) {
      return res.status(403).json({
        success: false,
        error: 'You are not a participant of this meeting'
      });
    }
    
    // Generate new token
    const isModerator = meeting.participants.some(
      p => p.user.toString() === req.user._id.toString() && p.role === 'host'
    ) || meeting.createdBy.toString() === req.user._id.toString();
    
    const token = generateJitsiJWT(req.user, roomName, isModerator);
    
    // Cache the token
    meetingCache.set(`token:${roomName}:${req.user._id}`, token);

    res.status(200).json({
      success: true,
      data: {
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

// Get meeting participants
exports.getMeetingParticipants = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    const meeting = await Meeting.findOne({ roomName })
      .populate('participants.user', 'name email avatar');
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    
    // Check if user is a participant or creator
    const isParticipant = meeting.participants.some(
      p => p.user._id.toString() === req.user._id.toString()
    ) || meeting.createdBy.toString() === req.user._id.toString();
    
    if (!isParticipant && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view participants of this meeting'
      });
    }
    
    res.status(200).json({
      success: true,
      data: meeting.participants
    });
  } catch (error) {
    next(error);
  }
};

// Start recording
exports.startRecording = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    const { streamUrl, filePath } = req.body;
    
    const meeting = await Meeting.findOne({ 
      roomName,
      createdBy: req.user._id // Only the creator can start recording
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or you are not authorized to start recording'
      });
    }
    
    // Check if recording is enabled for this meeting
    if (!meeting.settings.recordingEnabled) {
      return res.status(400).json({
        success: false,
        error: 'Recording is not enabled for this meeting'
      });
    }
    
    // Add recording to meeting
    const recording = {
      url: streamUrl || `https://your-storage-bucket.com/recordings/${roomName}-${Date.now()}.mp4`,
      startedAt: new Date(),
      status: 'started'
    };
    
    meeting.recordings.push(recording);
    await meeting.save();
    
    // Update cache
    meetingCache.set(`meeting:${roomName}`, meeting);

    res.status(200).json({
      success: true,
      data: {
        recordingId: recording._id,
        startedAt: recording.startedAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Stop recording
exports.stopRecording = async (req, res, next) => {
  try {
    const { roomName, recordingId } = req.params;
    const { fileSize } = req.body;
    
    const meeting = await Meeting.findOne({ 
      roomName,
      createdBy: req.user._id // Only the creator can stop recording
    });

    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found or you are not authorized to stop recording'
      });
    }
    
    // Find the recording
    const recording = meeting.recordings.id(recordingId);
    
    if (!recording) {
      return res.status(404).json({
        success: false,
        error: 'Recording not found'
      });
    }
    
    // Update recording
    recording.endedAt = new Date();
    recording.status = 'completed';
    recording.duration = (recording.endedAt - recording.startedAt) / 1000; // in seconds
    recording.fileSize = fileSize;
    
    await meeting.save();
    
    // Update cache
    meetingCache.set(`meeting:${roomName}`, meeting);

    res.status(200).json({
      success: true,
      data: {
        recordingId: recording._id,
        endedAt: recording.endedAt,
        duration: recording.duration,
        fileSize: recording.fileSize
      }
    });
  } catch (error) {
    next(error);
  }
};

// List recordings
exports.listRecordings = async (req, res, next) => {
  try {
    const { roomName } = req.params;
    
    const meeting = await Meeting.findOne({ roomName })
      .select('recordings title')
      .populate('createdBy', 'name email');
    
    if (!meeting) {
      return res.status(404).json({
        success: false,
        error: 'Meeting not found'
      });
    }
    
    // Check if user is a participant or creator
    const isParticipant = meeting.participants.some(
      p => p.user.toString() === req.user._id.toString()
    ) || meeting.createdBy.toString() === req.user._id.toString();
    
    if (!isParticipant && !req.user.isAdmin) {
      return res.status(403).json({
        success: false,
        error: 'You are not authorized to view recordings of this meeting'
      });
    }
    
    res.status(200).json({
      success: true,
      data: {
        meeting: {
          _id: meeting._id,
          title: meeting.title,
          createdBy: meeting.createdBy
        },
        recordings: meeting.recordings
      }
    });
  } catch (error) {
    next(error);
  }
};

// Notify participants that meeting has ended (helper method)
exports.notifyMeetingEnded = async (meeting) => {
  try {
    // In a real app, you would use WebSocket to notify participants in real-time
    // For now, we'll just log it
    console.log(`Meeting ${meeting.roomName} has ended. Notifying participants...`);
    
    // You could also send emails to participants
    const participants = await User.find({
      _id: { $in: meeting.participants.map(p => p.user) }
    });
    
    for (const participant of participants) {
      // Skip the host
      if (participant._id.toString() === meeting.createdBy.toString()) {
        continue;
      }
      
      try {
        await sendEmail({
          to: participant.email,
          subject: `Meeting Ended: ${meeting.title}`,
          text: `The meeting "${meeting.title}" has ended.`,
          html: `
            <h2>Meeting Ended</h2>
            <p>The meeting "${meeting.title}" has ended.</p>
            <p>Thank you for participating!</p>
          `
        });
      } catch (emailError) {
        console.error(`Failed to send email to ${participant.email}:`, emailError);
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error notifying participants:', error);
    return false;
  }
};

// Webhook handler for Jitsi events
exports.handleJitsiWebhook = async (req, res, next) => {
  try {
    const { event, roomName, participant, recording, sessionId } = req.body;
    
    // Verify webhook secret (if configured)
    const secret = req.headers['x-jitsi-webhook-secret'];
    if (process.env.JITSI_WEBHOOK_SECRET && secret !== process.env.JITSI_WEBHOOK_SECRET) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized'
      });
    }
    
    // Handle different Jitsi events
    switch (event) {
      case 'participant_joined':
        console.log(`Participant ${participant?.id} joined meeting ${roomName}`);
        // You could update participant status in your database here
        break;
        
      case 'participant_left':
        console.log(`Participant ${participant?.id} left meeting ${roomName}`);
        // You could update participant status in your database here
        break;
        
      case 'meeting_created':
        console.log(`Meeting ${roomName} was created`);
        // You could update meeting status in your database here
        break;
        
      case 'meeting_ended':
        console.log(`Meeting ${roomName} ended`);
        // Update meeting status in your database
        await Meeting.findOneAndUpdate(
          { roomName },
          { 
            status: 'ended',
            isActive: false,
            endTime: new Date()
          }
        );
        
        // Clear meeting from cache
        meetingCache.del(`meeting:${roomName}`);
        break;
        
      case 'recording_started':
        console.log(`Recording started for meeting ${roomName}`, recording);
        // Update recording status in your database
        if (recording?.id) {
          await Meeting.updateOne(
            { roomName, 'recordings._id': recording.id },
            { 
              $set: {
                'recordings.$.status': 'started',
                'recordings.$.startedAt': new Date()
              }
            }
          );
        }
        break;
        
      case 'recording_ready':
        console.log(`Recording ready for meeting ${roomName}`, recording);
        // Update recording status in your database
        if (recording?.id) {
          await Meeting.updateOne(
            { roomName, 'recordings._id': recording.id },
            { 
              $set: {
                'recordings.$.status': 'completed',
                'recordings.$.url': recording.url,
                'recordings.$.endedAt': new Date(),
                'recordings.$.duration': recording.duration,
                'recordings.$.fileSize': recording.fileSize
              }
            }
          );
        }
        break;
        
      case 'recording_failed':
        console.error(`Recording failed for meeting ${roomName}`, recording);
        // Update recording status in your database
        if (recording?.id) {
          await Meeting.updateOne(
            { roomName, 'recordings._id': recording.id },
            { 
              $set: {
                'recordings.$.status': 'failed',
                'recordings.$.error': recording.error
              }
            }
          );
        }
        break;
        
      default:
        console.log(`Unhandled Jitsi webhook event: ${event}`, req.body);
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error handling Jitsi webhook:', error);
    next(error);
  }
};
