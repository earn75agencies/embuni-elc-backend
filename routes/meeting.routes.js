const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  createMeeting,
  getMeeting,
  joinMeeting,
  endMeeting,
  listMeetings,
  updateMeeting,
  deleteMeeting,
  getMeetingToken,
  getMeetingParticipants,
  startRecording,
  stopRecording,
  listRecordings,
  handleJitsiWebhook
} = require('../controllers/meeting.controller');

// Apply authentication middleware to all routes
router.use(protect);

// Meeting routes
router.post(
  '/',
  [
    body('title', 'Title is required').not().isEmpty(),
    body('startTime', 'Start time is required').isISO8601(),
    body('endTime', 'End time is required').isISO8601()
  ],
  createMeeting
);

router.get(
  '/',
  listMeetings
);

router.get(
  '/:roomName',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  getMeeting
);

router.post(
  '/:roomName/join',
  [
    param('roomName', 'Room name is required').not().isEmpty(),
    body('password', 'Password must be a string').optional().isString()
  ],
  joinMeeting
);

router.put(
  '/:roomName/end',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  endMeeting
);

router.put(
  '/:roomName',
  [
    param('roomName', 'Room name is required').not().isEmpty(),
    body('title', 'Title must be a string').optional().isString(),
    body('description', 'Description must be a string').optional().isString(),
    body('startTime', 'Start time must be a valid date').optional().isISO8601(),
    body('endTime', 'End time must be a valid date').optional().isISO8601(),
    body('isPrivate', 'isPrivate must be a boolean').optional().isBoolean(),
    body('password', 'Password must be a string').optional().isString(),
    body('allowedEmails', 'Allowed emails must be an array of strings').optional().isArray(),
    body('allowedEmails.*', 'Invalid email').optional().isEmail(),
    body('tags', 'Tags must be an array of strings').optional().isArray(),
    body('tags.*', 'Tag must be a string').optional().isString(),
    body('settings', 'Settings must be an object').optional().isObject(),
    body('settings.muteOnEntry', 'muteOnEntry must be a boolean').optional().isBoolean(),
    body('settings.videoDisabled', 'videoDisabled must be a boolean').optional().isBoolean(),
    body('settings.screenSharing', 'screenSharing must be a boolean').optional().isBoolean(),
    body('settings.waitingRoom', 'waitingRoom must be a boolean').optional().isBoolean(),
    body('settings.lobby', 'lobby must be a boolean').optional().isBoolean(),
    body('settings.maxParticipants', 'maxParticipants must be a number').optional().isInt({ min: 0 }),
    body('settings.recordingEnabled', 'recordingEnabled must be a boolean').optional().isBoolean(),
    body('settings.chatEnabled', 'chatEnabled must be a boolean').optional().isBoolean(),
    body('settings.raiseHandEnabled', 'raiseHandEnabled must be a boolean').optional().isBoolean(),
    body('settings.reactionsEnabled', 'reactionsEnabled must be a boolean').optional().isBoolean(),
    body('settings.participantApprovalRequired', 'participantApprovalRequired must be a boolean').optional().isBoolean(),
    body('settings.allowJoinBeforeStart', 'allowJoinBeforeStart must be a boolean').optional().isBoolean(),
    body('settings.autoEndAfterEndTime', 'autoEndAfterEndTime must be a boolean').optional().isBoolean()
  ],
  updateMeeting
);

router.delete(
  '/:roomName',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  deleteMeeting
);

// Meeting token
router.get(
  '/:roomName/token',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  getMeetingToken
);

// Meeting participants
router.get(
  '/:roomName/participants',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  getMeetingParticipants
);

// Recording routes
router.post(
  '/:roomName/recordings/start',
  [
    param('roomName', 'Room name is required').not().isEmpty(),
    body('streamUrl', 'Stream URL is required').optional().isURL(),
    body('filePath', 'File path is required').optional().isString()
  ],
  startRecording
);

router.post(
  '/:roomName/recordings/:recordingId/stop',
  [
    param('roomName', 'Room name is required').not().isEmpty(),
    param('recordingId', 'Recording ID is required').not().isEmpty(),
    body('fileSize', 'File size must be a number').optional().isInt()
  ],
  stopRecording
);

router.get(
  '/:roomName/recordings',
  [
    param('roomName', 'Room name is required').not().isEmpty()
  ],
  listRecordings
);

// Webhook endpoint (no authentication required for Jitsi webhooks)
router.post(
  '/webhook/jitsi',
  [
    body('event', 'Event is required').not().isEmpty(),
    body('roomName', 'Room name is required').not().isEmpty()
  ],
  handleJitsiWebhook
);

module.exports = router;
