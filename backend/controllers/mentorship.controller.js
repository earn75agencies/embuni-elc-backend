const Mentorship = require('../models/Mentorship');
const User = require('../models/User');
const cache = require('../config/cache');
const emailService = require('../utils/emailService');
const { validationResult } = require('express-validator');

class MentorshipController {
  // Get all mentorships for a user (as mentor or mentee)
  async getMentorships(req, res) {
    try {
      const { status, role } = req.query;
      const userId = req.user.id;
      
      let query = {
        $or: [
          { mentor: userId },
          { mentee: userId }
        ]
      };

      if (status) {
        query.status = status;
      }

      if (role) {
        if (role === 'mentor') {
          query.mentor = userId;
        } else if (role === 'mentee') {
          query.mentee = userId;
        }
      }

      const mentorships = await Mentorship.find(query)
        .populate('mentor', 'name email profile avatar')
        .populate('mentee', 'name email profile avatar')
        .sort({ createdAt: -1 });

      // Cache the result
      const cacheKey = `mentorships_${userId}_${JSON.stringify(req.query)}`;
      await cache.set(cacheKey, mentorships, 300); // 5 minutes

      res.json({
        success: true,
        data: mentorships,
        count: mentorships.length
      });
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mentorships',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get mentorship details by ID
  async getMentorshipById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const mentorship = await Mentorship.findById(id)
        .populate('mentor', 'name email profile avatar')
        .populate('mentee', 'name email profile avatar');

      if (!mentorship) {
        return res.status(404).json({
          success: false,
          message: 'Mentorship not found'
        });
      }

      // Check if user is part of this mentorship
      if (mentorship.mentor._id.toString() !== userId && 
          mentorship.mentee._id.toString() !== userId && 
          !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      res.json({
        success: true,
        data: mentorship
      });
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mentorship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Find potential mentors for a mentee
  async findMentors(req, res) {
    try {
      const { 
        interests, 
        industry, 
        experienceLevel, 
        skills, 
        careerGoals,
        limit = 10,
        offset = 0
      } = req.query;

      const userId = req.user.id;

      // Build mentor criteria
      const mentorCriteria = {
        'profile.isMentor': true,
        'profile.mentorshipStatus': 'available',
        _id: { $ne: userId } // Exclude self
      };

      // Add filters
      if (industry) {
        mentorCriteria['profile.industry'] = industry;
      }

      if (experienceLevel) {
        mentorCriteria['profile.experienceLevel'] = experienceLevel;
      }

      // Find potential mentors
      const mentors = await User.find(mentorCriteria)
        .select('name email profile avatar')
        .limit(parseInt(limit))
        .skip(parseInt(offset))
        .sort({ 'profile.mentorRating': -1 });

      // Calculate match scores (simplified version)
      const mentorsWithScores = mentors.map(mentor => {
        let score = 50; // Base score
        
        // Add points for matching interests
        if (interests && mentor.profile.interests) {
          const matchingInterests = interests.split(',').filter(interest => 
            mentor.profile.interests.includes(interest.trim())
          );
          score += matchingInterests.length * 10;
        }

        // Add points for matching skills
        if (skills && mentor.profile.skills) {
          const matchingSkills = skills.split(',').filter(skill => 
            mentor.profile.skills.includes(skill.trim())
          );
          score += matchingSkills.length * 8;
        }

        // Add points for industry match
        if (industry && mentor.profile.industry === industry) {
          score += 15;
        }

        return {
          ...mentor.toObject(),
          matchScore: Math.min(score, 100)
        };
      });

      // Sort by match score
      mentorsWithScores.sort((a, b) => b.matchScore - a.matchScore);

      res.json({
        success: true,
        data: mentorsWithScores,
        count: mentorsWithScores.length
      });
    } catch (error) {
      console.error('Error finding mentors:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to find mentors',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Send mentorship request
  async sendMentorshipRequest(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { mentorId, goals, message, matchingCriteria } = req.body;
      const menteeId = req.user.id;

      // Check if mentorship already exists
      const existingMentorship = await Mentorship.findOne({
        mentor: mentorId,
        mentee: menteeId,
        status: { $in: ['pending', 'active'] }
      });

      if (existingMentorship) {
        return res.status(400).json({
          success: false,
          message: 'Mentorship request already exists'
        });
      }

      // Get mentor details
      const mentor = await User.findById(mentorId);
      if (!mentor || !mentor.profile.isMentor) {
        return res.status(404).json({
          success: false,
          message: 'Mentor not found or not available'
        });
      }

      // Create mentorship request
      const mentorship = new Mentorship({
        mentor: mentorId,
        mentee: menteeId,
        status: 'pending',
        goals: goals || [],
        matchingCriteria: matchingCriteria || {},
        matchedBy: 'self'
      });

      await mentorship.save();

      // Send notification to mentor
      try {
        await emailService.sendEmail({
          to: mentor.email,
          subject: 'New Mentorship Request - Equity Leaders Program',
          template: 'mentorship-request',
          data: {
            mentorName: mentor.name,
            menteeName: req.user.name,
            message: message || 'I would like to connect with you for mentorship.',
            mentorshipId: mentorship._id
          }
        });
      } catch (emailError) {
        console.error('Failed to send mentorship request email:', emailError);
      }

      // Clear cache
      await cache.del(`mentorships_${menteeId}_*`);

      res.status(201).json({
        success: true,
        message: 'Mentorship request sent successfully',
        data: mentorship
      });
    } catch (error) {
      console.error('Error sending mentorship request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send mentorship request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Respond to mentorship request
  async respondToRequest(req, res) {
    try {
      const { id } = req.params;
      const { action, message } = req.body; // action: 'accept' or 'decline'
      const userId = req.user.id;

      const mentorship = await Mentorship.findById(id);
      if (!mentorship) {
        return res.status(404).json({
          success: false,
          message: 'Mentorship not found'
        });
      }

      // Check if user is the mentor
      if (mentorship.mentor.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Only the mentor can respond to requests'
        });
      }

      if (mentorship.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'This request has already been processed'
        });
      }

      if (action === 'accept') {
        mentorship.status = 'active';
        mentorship.startedAt = new Date();
      } else if (action === 'decline') {
        mentorship.status = 'cancelled';
      } else {
        return res.status(400).json({
          success: false,
          message: 'Invalid action'
        });
      }

      await mentorship.save();

      // Get mentee details for notification
      const mentee = await User.findById(mentorship.mentee);

      // Send notification to mentee
      try {
        await emailService.sendEmail({
          to: mentee.email,
          subject: `Mentorship Request ${action === 'accept' ? 'Accepted' : 'Declined'} - Equity Leaders Program`,
          template: `mentorship-${action}`,
          data: {
            menteeName: mentee.name,
            mentorName: req.user.name,
            message: message || '',
            mentorshipId: mentorship._id
          }
        });
      } catch (emailError) {
        console.error('Failed to send mentorship response email:', emailError);
      }

      // Clear cache
      await cache.del(`mentorships_${mentorship.mentor.toString()}_*`);
      await cache.del(`mentorships_${mentorship.mentee.toString()}_*`);

      res.json({
        success: true,
        message: `Mentorship request ${action}ed successfully`,
        data: mentorship
      });
    } catch (error) {
      console.error('Error responding to mentorship request:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to respond to mentorship request',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Schedule a mentorship session
  async scheduleSession(req, res) {
    try {
      const { id } = req.params;
      const { title, description, scheduledDate, duration, meetingType, meetingLink } = req.body;
      const userId = req.user.id;

      const mentorship = await Mentorship.findById(id);
      if (!mentorship) {
        return res.status(404).json({
          success: false,
          message: 'Mentorship not found'
        });
      }

      // Check if user is part of this mentorship
      if (mentorship.mentor.toString() !== userId && 
          mentorship.mentee.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      if (mentorship.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Can only schedule sessions for active mentorships'
        });
      }

      // Add session
      const session = {
        title,
        description,
        date: new Date(scheduledDate),
        duration,
        type: meetingType || 'video',
        meetingLink
      };

      mentorship.sessions.push(session);
      await mentorship.save();

      // Get the other participant for notification
      const otherUserId = mentorship.mentor.toString() === userId ? 
        mentorship.mentee.toString() : mentorship.mentor.toString();
      const otherUser = await User.findById(otherUserId);

      // Send notification
      try {
        await emailService.sendEmail({
          to: otherUser.email,
          subject: 'Mentorship Session Scheduled - Equity Leaders Program',
          template: 'session-scheduled',
          data: {
            userName: otherUser.name,
            schedulerName: req.user.name,
            sessionTitle: title,
            sessionDate: scheduledDate,
            sessionDuration: duration,
            meetingLink
          }
        });
      } catch (emailError) {
        console.error('Failed to send session notification email:', emailError);
      }

      res.status(201).json({
        success: true,
        message: 'Session scheduled successfully',
        data: session
      });
    } catch (error) {
      console.error('Error scheduling session:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to schedule session',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update goal progress
  async updateGoalProgress(req, res) {
    try {
      const { id, goalId } = req.params;
      const { progress, status, notes } = req.body;
      const userId = req.user.id;

      const mentorship = await Mentorship.findById(id);
      if (!mentorship) {
        return res.status(404).json({
          success: false,
          message: 'Mentorship not found'
        });
      }

      // Check if user is part of this mentorship
      if (mentorship.mentor.toString() !== userId && 
          mentorship.mentee.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Find and update the goal
      const goal = mentorship.goals.id(goalId);
      if (!goal) {
        return res.status(404).json({
          success: false,
          message: 'Goal not found'
        });
      }

      if (progress !== undefined) goal.progress = progress;
      if (status) goal.status = status;
      if (status === 'completed') goal.completedAt = new Date();

      await mentorship.save();

      res.json({
        success: true,
        message: 'Goal updated successfully',
        data: goal
      });
    } catch (error) {
      console.error('Error updating goal progress:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update goal progress',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Submit feedback
  async submitFeedback(req, res) {
    try {
      const { id } = req.params;
      const { rating, comments, category } = req.body;
      const userId = req.user.id;

      const mentorship = await Mentorship.findById(id);
      if (!mentorship) {
        return res.status(404).json({
          success: false,
          message: 'Mentorship not found'
        });
      }

      // Check if user is part of this mentorship
      if (mentorship.mentor.toString() !== userId && 
          mentorship.mentee.toString() !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // Determine feedback direction
      const isFromMentee = mentorship.mentee.toString() === userId;
      const toUserId = isFromMentee ? mentorship.mentor.toString() : mentorship.mentee.toString();

      // Add feedback
      const feedback = {
        from: userId,
        to: toUserId,
        rating,
        comments,
        category: category || 'overall',
        createdAt: new Date()
      };

      mentorship.feedback.push(feedback);

      // Update overall ratings
      if (isFromMentee) {
        mentorship.menteeRating = rating;
        mentorship.menteeReview = comments;
      } else {
        mentorship.mentorRating = rating;
        mentorship.mentorReview = comments;
      }

      await mentorship.save();

      res.status(201).json({
        success: true,
        message: 'Feedback submitted successfully',
        data: feedback
      });
    } catch (error) {
      console.error('Error submitting feedback:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit feedback',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get mentorship statistics
  async getMentorshipStats(req, res) {
    try {
      const userId = req.user.id;
      const user = await User.findById(userId);

      let stats = {};

      if (user.profile.isMentor) {
        // Mentor stats
        stats = await Mentorship.aggregate([
          { $match: { mentor: mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
      } else {
        // Mentee stats
        stats = await Mentorship.aggregate([
          { $match: { mentee: mongoose.Types.ObjectId(userId) } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);
      }

      // Format stats
      const formattedStats = {
        total: 0,
        pending: 0,
        active: 0,
        completed: 0,
        cancelled: 0
      };

      stats.forEach(stat => {
        formattedStats[stat._id] = stat.count;
        formattedStats.total += stat.count;
      });

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Error fetching mentorship stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch mentorship statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new MentorshipController();