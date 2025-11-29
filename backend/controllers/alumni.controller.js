const Alumni = require('../models/Alumni');
const User = require('../models/User');
const cache = require('../config/cache');
const emailService = require('../utils/emailService');
const { validationResult } = require('express-validator');

class AlumniController {
  // Get all alumni with filtering
  async getAlumni(req, res) {
    try {
      const {
        industry,
        graduationYear,
        graduationYearRange,
        skills,
        location,
        availableForMentorship,
        openToCollaboration,
        featured,
        verified,
        includePrivate = false,
        page = 1,
        limit = 20,
        sortBy = 'graduationYear',
        sortOrder = 'desc'
      } = req.query;

      const filters = {
        industry,
        graduationYear,
        graduationYearRange: graduationYearRange ? JSON.parse(graduationYearRange) : undefined,
        skills,
        location,
        availableForMentorship: availableForMentorship === 'true',
        openToCollaboration: openToCollaboration === 'true',
        featured: featured === 'true',
        verified: verified === 'true',
        includePrivate: includePrivate === 'true'
      };

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const alumni = await Alumni.findByFilters(filters)
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Alumni.countDocuments(
        Alumni.findByFilters(filters).getQuery()
      );

      // Cache result
      const cacheKey = `alumni_${JSON.stringify(req.query)}`;
      await cache.set(cacheKey, { alumni, total }, 300); // 5 minutes

      res.json({
        success: true,
        data: alumni,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get alumni by ID
  async getAlumniById(req, res) {
    try {
      const { id } = req.params;

      const alumni = await Alumni.findOne({ user: id })
        .populate('user', 'firstName lastName email avatar')
        .populate('connections.user', 'firstName lastName avatar')
        .populate('testimonials.author', 'firstName lastName avatar')
        .populate('contributions', 'title type date');

      if (!alumni) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }

      // Check privacy settings
      if (alumni.privacy.profileVisibility === 'private' && 
          alumni.user._id.toString() !== req.user.id && 
          !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'This profile is private'
        });
      }

      // Increment profile views
      if (alumni.user._id.toString() !== req.user.id) {
        await alumni.incrementProfileViews();
      }

      res.json({
        success: true,
        data: alumni
      });
    } catch (error) {
      console.error('Error fetching alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create or update alumni profile
  async createOrUpdateAlumniProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const userId = req.user.id;
      
      // Check if alumni profile already exists
      let alumni = await Alumni.findOne({ user: userId });

      if (alumni) {
        // Update existing profile
        Object.assign(alumni, req.body);
        await alumni.save();
      } else {
        // Create new profile
        alumni = new Alumni({
          user: userId,
          ...req.body
        });
        await alumni.save();
      }

      // Clear cache
      await cache.del('alumni_*');

      res.status(alumni.isNew ? 201 : 200).json({
        success: true,
        message: alumni.isNew ? 'Alumni profile created successfully' : 'Profile updated successfully',
        data: alumni
      });
    } catch (error) {
      console.error('Error creating/updating alumni profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to save alumni profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Send connection request
  async sendConnectionRequest(req, res) {
    try {
      const { id } = req.params;
      const { message } = req.body;

      const targetAlumni = await Alumni.findOne({ user: id });
      if (!targetAlumni) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }

      const currentAlumni = await Alumni.findOne({ user: req.user.id });
      if (!currentAlumni) {
        return res.status(404).json({
          success: false,
          message: 'Please create your alumni profile first'
        });
      }

      // Add connection to both profiles
      await targetAlumni.addConnection(req.user.id, req.user.id);
      await currentAlumni.addConnection(id, req.user.id);

      // Send notification
      try {
        await emailService.sendEmail({
          to: targetAlumni.user.email,
          subject: 'New Connection Request - Equity Leaders Alumni Network',
          template: 'alumni-connection-request',
          data: {
            targetName: targetAlumni.user.firstName,
            requesterName: req.user.name,
            message: message || 'I would like to connect with you on the alumni network.',
            profileUrl: `${process.env.FRONTEND_URL}/alumni/${req.user.id}`
          }
        });
      } catch (emailError) {
        console.error('Failed to send connection request email:', emailError);
      }

      // Clear cache
      await cache.del('alumni_*');

      res.status(201).json({
        success: true,
        message: 'Connection request sent successfully'
      });
    } catch (error) {
      console.error('Error sending connection request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send connection request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Respond to connection request
  async respondToConnectionRequest(req, res) {
    try {
      const { id } = req.params;
      const { action, message } = req.body; // action: 'accept' or 'decline'

      const alumni = await Alumni.findOne({ user: req.user.id });
      if (!alumni) {
        return res.status(404).json({
          success: false,
          message: 'Alumni profile not found'
        });
      }

      if (action === 'accept') {
        await alumni.acceptConnection(id);
      } else if (action === 'decline') {
        await alumni.declineConnection(id);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      // Get the other user for notification
      const otherUser = await User.findById(id);

      // Send notification
      try {
        await emailService.sendEmail({
          to: otherUser.email,
          subject: `Connection Request ${action === 'accept' ? 'Accepted' : 'Declined'} - Equity Leaders Alumni Network`,
          template: `alumni-connection-${action}`,
          data: {
            userName: otherUser.firstName,
            alumniName: req.user.name,
            message: message || '',
            profileUrl: `${process.env.FRONTEND_URL}/alumni/${req.user.id}`
          }
        });
      } catch (emailError) {
        console.error('Failed to send connection response email:', emailError);
      }

      // Clear cache
      await cache.del('alumni_*');

      res.json({
        success: true,
        message: `Connection request ${action}ed successfully`
      });
    } catch (error) {
      console.error('Error responding to connection request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to respond to connection request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Add testimonial
  async addTestimonial(req, res) {
    try {
      const { id } = req.params;
      const { content, rating, relationship } = req.body;

      const alumni = await Alumni.findOne({ user: id });
      if (!alumni) {
        return res.status(404).json({
          success: false,
          message: 'Alumni not found'
        });
      }

      await alumni.addTestimonial(req.user.id, content, rating, relationship);

      // Send notification to alumni
      try {
        await emailService.sendEmail({
          to: alumni.user.email,
          subject: 'New Testimonial - Equity Leaders Alumni Network',
          template: 'alumni-testimonial',
          data: {
            alumniName: alumni.user.firstName,
            authorName: req.user.name,
            rating,
            content,
            relationship
          }
        });
      } catch (emailError) {
        console.error('Failed to send testimonial notification:', emailError);
      }

      // Clear cache
      await cache.del('alumni_*');

      res.status(201).json({
        success: true,
        message: 'Testimonial added successfully'
      });
    } catch (error) {
      console.error('Error adding testimonial:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add testimonial',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get alumni statistics
  async getAlumniStats(req, res) {
    try {
      const stats = await Alumni.getStatistics();

      res.json({
        success: true,
        data: stats[0] || {}
      });
    } catch (error) {
      console.error('Error fetching alumni stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get current user's alumni profile
  async getMyAlumniProfile(req, res) {
    try {
      const alumni = await Alumni.findOne({ user: req.user.id })
        .populate('user', 'firstName lastName email avatar')
        .populate('connections.user', 'firstName lastName avatar')
        .populate('testimonials.author', 'firstName lastName avatar');

      if (!alumni) {
        return res.status(404).json({
          success: false,
          message: 'Alumni profile not found'
        });
      }

      res.json({
        success: true,
        data: alumni
      });
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni profile',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get alumni events
  async getAlumniEvents(req, res) {
    try {
      const { type, page = 1, limit = 20 } = req.query;

      const query = {};
      if (type) {
        query.type = type;
      }

      const events = await Alumni.aggregate([
        { $unwind: '$events' },
        { $match: { 'events.type': type || { $exists: true } } },
        { $sort: { 'events.date': -1 } },
        { $skip: (parseInt(page) - 1) * parseInt(limit) },
        { $limit: parseInt(limit) },
        {
          $lookup: {
            from: 'users',
            localField: 'user',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: '$events._id',
            type: '$events.type',
            title: '$events.title',
            description: '$events.description',
            date: '$events.date',
            location: '$events.location',
            role: '$events.role',
            organizer: '$events.organizer',
            alumni: {
              _id: '$user._id',
              name: { $concat: ['$user.firstName', ' ', '$user.lastName'] },
              avatar: '$user.avatar'
            }
          }
        }
      ]);

      res.json({
        success: true,
        data: events,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching alumni events:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch alumni events',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Search alumni
  async searchAlumni(req, res) {
    try {
      const { q, page = 1, limit = 20 } = req.query;

      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const searchRegex = new RegExp(q, 'i');
      
      const alumni = await Alumni.find({
        $and: [
          { 'privacy.profileVisibility': 'public' },
          {
            $or: [
              { 'user.firstName': searchRegex },
              { 'user.lastName': searchRegex },
              { 'currentPosition.title': searchRegex },
              { 'currentPosition.company': searchRegex },
              { 'skills.technical': { $in: [searchRegex] } },
              { 'skills.soft': { $in: [searchRegex] } }
            ]
          }
        ]
      })
        .populate('user', 'firstName lastName email avatar')
        .sort({ featured: -1, isVerified: -1, graduationYear: -1 })
        .skip((parseInt(page) - 1) * parseInt(limit))
        .limit(parseInt(limit));

      const total = await Alumni.countDocuments({
        $and: [
          { 'privacy.profileVisibility': 'public' },
          {
            $or: [
              { 'user.firstName': searchRegex },
              { 'user.lastName': searchRegex },
              { 'currentPosition.title': searchRegex },
              { 'currentPosition.company': searchRegex },
              { 'skills.technical': { $in: [searchRegex] } },
              { 'skills.soft': { $in: [searchRegex] } }
            ]
          }
        ]
      });

      res.json({
        success: true,
        data: alumni,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error searching alumni:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search alumni',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new AlumniController();