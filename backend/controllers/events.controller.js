const Event = require('../models/Event');
const User = require('../models/User');
const Member = require('../models/Member');
const eventValidator = require('../validators/eventValidator');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const { cache } = require('../config/cache');

/**
 * Get all events with filtering
 * GET /api/events
 */
exports.getAllEvents = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const query = {};

  // Filter by status
  if (req.query.status) {
    query.status = req.query.status;
  } else {
    query.status = { $in: ['published', 'ongoing'] }; // Only show published/ongoing events
  }

  // Filter by category
  if (req.query.category) {
    query.category = req.query.category;
  }

  // Filter by type
  if (req.query.type) {
    query.eventType = req.query.type;
  }

  // Filter upcoming events
  if (req.query.upcoming === 'true') {
    query.startDate = { $gte: new Date() };
  }

  // Search by title
  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } }
    ];
  }

  // Create cache key for public queries
  const cacheKey = `events:${JSON.stringify(query)}:${page}:${limit}`;

  // Check cache for public queries (no search, published/ongoing only)
  if (!req.query.search && query.status && typeof query.status === 'object' && query.status.$in) {
    const cached = await cache.get(cacheKey);
    if (cached) {
      return res.status(200).json(cached);
    }
  }

  // Use lean() and parallel queries for better performance
  const [events, total] = await Promise.all([
    Event.find(query)
      .populate('organizer', 'firstName lastName email avatar')
      .limit(limit)
      .skip(skip)
      .sort({ startDate: 1 })
      .lean(),
    Event.countDocuments(query)
  ]);

  const response = {
    success: true,
    count: events.length,
    total,
    pages: Math.ceil(total / limit),
    page,
    events
  };

  // Cache public queries for 2 minutes
  if (!req.query.search && query.status && typeof query.status === 'object' && query.status.$in) {
    await cache.set(cacheKey, response, 120000);
  }

  res.status(200).json(response);
});

/**
 * Get single event by ID
 * GET /api/events/:id
 */
exports.getEventById = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id)
    .populate('organizer', 'firstName lastName email avatar bio')
    .populate('attendees.user', 'firstName lastName avatar');

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  // Increment views using updateOne for better performance
  await Event.updateOne(
    { _id: req.params.id },
    { $inc: { views: 1 } }
  );
  // Update local object for response
  event.views = (event.views || 0) + 1;

  res.status(200).json({
    success: true,
    event
  });
});

/**
 * Create new event
 * POST /api/events
 */
exports.createEvent = asyncHandler(async (req, res) => {
  // Parse JSON body if it's a string (when using FormData)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // If parsing fails, use body as is
    }
  }

  // Handle location object if it's a string
  if (body.location && typeof body.location === 'string') {
    try {
      body.location = JSON.parse(body.location);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }

  // Check if user is admin for lenient validation
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  const isAdmin = req.isAdmin || false;

  // Validate input
  const errors = eventValidator.validateCreate(body, isAdmin);
  if (errors) {
    // For admins, ALWAYS proceed regardless of validation errors
    if (isAdmin) {
      console.warn('Admin event creation validation warnings (proceeding anyway):', errors);
      // Auto-fix ALL issues for admins
      body.title = body.title || 'Admin Event';
      body.description = body.description || 'Event organized by admin';
      body.startTime = body.startTime || '09:00';
      body.endTime = body.endTime || '17:00';
      body.location = body.location || {};
      body.location.venue = body.location.venue || 'TBA';
      body.maxAttendees = body.maxAttendees || 100;
      body.status = body.status || 'published';
      body.eventType = body.eventType || 'other';
      body.category = body.category || 'social';
      if (!body.startDate) {
        body.startDate = new Date().toISOString();
      }
      if (!body.endDate) {
        body.endDate = body.startDate;
      }
    } else {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        errors
      });
    }
  }

  // Handle cover image upload
  let coverImageUrl = body.coverImage || '';
  let coverImagePublicId = null;

  if (req.file) {
    try {
      // Upload to Cloudinary if configured
      if (process.env.CLOUDINARY_URL) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'elp/events',
          transformation: [
            { width: 1200, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto' }
          ]
        });
        coverImageUrl = uploadResult.secure_url;
        coverImagePublicId = uploadResult.public_id;

        // Delete local file after Cloudinary upload
        fs.unlinkSync(req.file.path);
      } else {
        // Use local file path if Cloudinary not configured
        coverImageUrl = `/uploads/events/${req.file.filename}`;
      }
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      // Clean up file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to upload cover image'
      });
    }
  }

  // Create event
  const eventData = {
    ...body,
    coverImage: coverImageUrl,
    coverImagePublicId: coverImagePublicId,
    organizer: req.user._id,
    status: body.status || 'draft'
  };

  // For admins, use create with validation bypass
  let event;
  if (isAdmin) {
    // Bypass validation for admins - ensure all required fields exist
    eventData.title = eventData.title || 'Admin Event';
    eventData.description = eventData.description || 'Event organized by admin';
    eventData.eventType = eventData.eventType || 'other';
    eventData.category = eventData.category || 'social';
    eventData.startDate = eventData.startDate || new Date();
    eventData.endDate = eventData.endDate || eventData.startDate;
    eventData.startTime = eventData.startTime || '09:00';
    eventData.endTime = eventData.endTime || '17:00';
    eventData.location = eventData.location || {};
    eventData.location.venue = eventData.location.venue || 'TBA';

    // Create without strict validation
    event = new Event(eventData);
    await event.save({ validateBeforeSave: false });
  } else {
    event = await Event.create(eventData);
  }

  await event.populate('organizer', 'firstName lastName email avatar');

  res.status(201).json({
    success: true,
    message: 'Event created successfully',
    event,
    ...(isAdmin && Object.keys(errors || {}).length > 0 && {
      warnings: 'Some validations were bypassed for admin'
    })
  });
});

/**
 * Update event
 * PUT /api/events/:id
 */
exports.updateEvent = asyncHandler(async (req, res) => {
  // Parse JSON body if it's a string (when using FormData)
  let body = req.body;
  if (typeof body === 'string') {
    try {
      body = JSON.parse(body);
    } catch (e) {
      // If parsing fails, use body as is
    }
  }

  // Handle location object if it's a string
  if (body.location && typeof body.location === 'string') {
    try {
      body.location = JSON.parse(body.location);
    } catch (e) {
      // If parsing fails, keep as is
    }
  }

  // Check if user is admin for lenient validation
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  const isAdmin = req.isAdmin || false;

  const event = await Event.findById(req.params.id);

  if (!event) {
    // Clean up uploaded file if event not found
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    throw new APIError('Event not found', 404);
  }

  // Validate input
  const errors = eventValidator.validateUpdate(body, isAdmin);
  if (errors) {
    // For admins, ALWAYS proceed and auto-fix
    if (isAdmin) {
      console.warn('Admin event update validation warnings (proceeding anyway):', errors);
      // Auto-fix any issues
      if (body.title === undefined || !body.title) {body.title = event.title || 'Admin Event';}
      if (body.description === undefined || !body.description) {body.description = event.description || 'Event organized by admin';}
      if (body.eventType && !['workshop', 'seminar', 'community-service', 'networking', 'training', 'conference', 'social', 'other'].includes(body.eventType)) {
        body.eventType = 'other';
      }
      if (body.category && !['leadership', 'mentorship', 'service', 'networking', 'skills', 'social'].includes(body.category)) {
        body.category = 'social';
      }
    } else {
      // Clean up uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({
        success: false,
        errors
      });
    }
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (event.organizer.toString() !== req.user._id.toString() && !req.isAdmin) {
    // Clean up uploaded file if not authorized
    if (req.file) {
      fs.unlinkSync(req.file.path);
    }
    throw new APIError('Not authorized to update this event', 403);
  }

  // Handle cover image upload if new file provided
  if (req.file) {
    try {
      // Delete old image from Cloudinary if exists
      if (event.coverImagePublicId && process.env.CLOUDINARY_URL) {
        try {
          await cloudinary.uploader.destroy(event.coverImagePublicId);
        } catch (deleteError) {
          console.error('Error deleting old image:', deleteError);
        }
      }

      // Upload new image to Cloudinary if configured
      if (process.env.CLOUDINARY_URL) {
        const uploadResult = await cloudinary.uploader.upload(req.file.path, {
          folder: 'elp/events',
          transformation: [
            { width: 1200, height: 600, crop: 'fill', gravity: 'auto' },
            { quality: 'auto' }
          ]
        });
        body.coverImage = uploadResult.secure_url;
        body.coverImagePublicId = uploadResult.public_id;

        // Delete local file after Cloudinary upload
        fs.unlinkSync(req.file.path);
      } else {
        // Use local file path if Cloudinary not configured
        body.coverImage = `/uploads/events/${req.file.filename}`;
        body.coverImagePublicId = null;
      }
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      // Clean up file on error
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(500).json({
        success: false,
        message: 'Failed to upload cover image'
      });
    }
  }

  // Update fields
  Object.keys(body).forEach((key) => {
    if (key !== 'coverImage' || req.file || body.coverImage) {
      event[key] = body[key];
    }
  });

  // For admins, bypass validation on save
  await event.save(isAdmin ? { validateBeforeSave: false } : {});
  await event.populate('organizer', 'firstName lastName email avatar');

  res.status(200).json({
    success: true,
    message: 'Event updated successfully',
    event,
    ...(isAdmin && Object.keys(errors || {}).length > 0 && {
      warnings: 'Some validations were bypassed for admin'
    })
  });
});

/**
 * Delete event
 * Permanently deletes event and all related data from database
 * DELETE /api/events/:id
 */
exports.deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (event.organizer.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized to delete this event', 403);
  }

  // Permanently delete event (attendees and registrations are embedded and will be deleted with event)
  await Event.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: 'Event and all related data permanently deleted from database'
  });
});

/**
 * Register for event
 * POST /api/events/:id/register
 */
exports.registerForEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  // Check if already registered
  const alreadyRegistered = event.attendees.some(
    (attendee) => attendee.user.toString() === req.user._id.toString()
  );

  if (alreadyRegistered) {
    throw new APIError('Already registered for this event', 400);
  }

  // Check max attendees
  if (event.maxAttendees && event.attendees.length >= event.maxAttendees) {
    throw new APIError('Event is full', 400);
  }

  // Add user to attendees
  event.attendees.push({
    user: req.user._id,
    registeredAt: new Date()
  });

  await event.save();

  // Update user's events attended
  const user = await User.findById(req.user._id);
  if (!user.eventsAttended.includes(event._id)) {
    user.eventsAttended.push(event._id);
    await user.save();
  }

  // Update member profile
  const member = await Member.findOne({ user: req.user._id });
  if (member) {
    await member.addEventAttendance();
  }

  res.status(200).json({
    success: true,
    message: 'Registered for event successfully'
  });
});

/**
 * Unregister from event
 * POST /api/events/:id/unregister
 */
exports.unregisterFromEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  // Remove user from attendees
  event.attendees = event.attendees.filter(
    (attendee) => attendee.user.toString() !== req.user._id.toString()
  );

  await event.save();

  res.status(200).json({
    success: true,
    message: 'Unregistered from event successfully'
  });
});

/**
 * Mark user as attended
 * POST /api/events/:id/mark-attended/:userId
 */
exports.markAttended = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  // Check authorization
  // NEW ADMIN STRUCTURE: Admin access is determined by Admin model via req.isAdmin
  if (event.organizer.toString() !== req.user._id.toString() && !req.isAdmin) {
    throw new APIError('Not authorized', 403);
  }

  // Find attendee and mark as attended
  const attendee = event.attendees.find(
    (a) => a.user.toString() === req.params.userId
  );

  if (!attendee) {
    throw new APIError('Attendee not found', 404);
  }

  attendee.attended = true;
  await event.save();

  res.status(200).json({
    success: true,
    message: 'Marked as attended'
  });
});

/**
 * Like/Unlike event
 * POST /api/events/:id/like
 */
exports.toggleLike = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);

  if (!event) {
    throw new APIError('Event not found', 404);
  }

  const userLiked = event.likes.some(
    (like) => like.toString() === req.user._id.toString()
  );

  if (userLiked) {
    event.likes = event.likes.filter(
      (like) => like.toString() !== req.user._id.toString()
    );
  } else {
    event.likes.push(req.user._id);
  }

  await event.save();

  res.status(200).json({
    success: true,
    message: userLiked ? 'Like removed' : 'Event liked',
    likes: event.likes.length
  });
});

/**
 * Get events by organizer
 * GET /api/events/organizer/:userId
 */
exports.getEventsByOrganizer = asyncHandler(async (req, res) => {
  const events = await Event.find({ organizer: req.params.userId })
    .populate('organizer', 'firstName lastName avatar')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});

/**
 * Get user's registered events
 * GET /api/events/user/registered
 */
exports.getUserRegisteredEvents = asyncHandler(async (req, res) => {
  const events = await Event.find({
    'attendees.user': req.user._id
  }).populate('organizer', 'firstName lastName avatar');

  res.status(200).json({
    success: true,
    count: events.length,
    events
  });
});
