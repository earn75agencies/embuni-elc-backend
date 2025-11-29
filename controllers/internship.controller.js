const Internship = require('../models/Internship');
const User = require('../models/User');
const cache = require('../config/cache');
const emailService = require('../utils/emailService');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

class InternshipController {
  // Get all internships with filtering
  async getInternships(req, res) {
    try {
      const {
        status = 'active',
        industry,
        location,
        isPaid,
        remote,
        schedule,
        duration,
        skills,
        featured,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      // Build query
      let query = { status };

      if (industry) query['company.industry'] = industry;
      if (location) query['company.location.city'] = new RegExp(location, 'i');
      if (isPaid !== undefined) query.isPaid = isPaid === 'true';
      if (remote !== undefined) query['company.location.remote'] = remote === 'true';
      if (schedule) query.schedule = schedule;
      if (duration) query.duration = { $lte: parseInt(duration) };
      if (skills) {
        const skillArray = skills.split(',').map(s => s.trim());
        query.skills = { $in: skillArray };
      }
      if (featured !== undefined) query.featured = featured === 'true';

      // Only show active internships with future deadlines for regular users
      if (!req.isAdmin) {
        query.applicationDeadline = { $gt: new Date() };
      }

      // Build sort
      const sort = {};
      sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

      // Execute query with pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      
      const internships = await Internship.find(query)
        .populate('postedBy', 'name email')
        .sort(sort)
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Internship.countDocuments(query);

      // Cache the result
      const cacheKey = `internships_${JSON.stringify(req.query)}`;
      await cache.set(cacheKey, { internships, total }, 300); // 5 minutes

      res.json({
        success: true,
        data: internships,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching internships:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch internships',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get internship by ID
  async getInternshipById(req, res) {
    try {
      const { id } = req.params;

      const internship = await Internship.findById(id)
        .populate('postedBy', 'name email')
        .populate('applications.student', 'name email profile');

      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Increment view count
      internship.views += 1;
      await internship.save();

      res.json({
        success: true,
        data: internship
      });
    } catch (error) {
      console.error('Error fetching internship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch internship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Create new internship
  async createInternship(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const internshipData = {
        ...req.body,
        postedBy: req.user.id
      };

      const internship = new Internship(internshipData);
      await internship.save();

      // If user is admin, auto-approve
      if (req.isAdmin) {
        internship.status = 'active';
        internship.approvedBy = req.user.id;
        internship.approvedAt = new Date();
        await internship.save();
      }

      // Clear cache
      await cache.del('internships_*');

      res.status(201).json({
        success: true,
        message: req.isAdmin ? 'Internship posted successfully' : 'Internship submitted for approval',
        data: internship
      });
    } catch (error) {
      console.error('Error creating internship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create internship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update internship
  async updateInternship(req, res) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const internship = await Internship.findById(id);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Check permissions
      if (internship.postedBy.toString() !== req.user.id && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      Object.assign(internship, req.body);
      await internship.save();

      // Clear cache
      await cache.del('internships_*');

      res.json({
        success: true,
        message: 'Internship updated successfully',
        data: internship
      });
    } catch (error) {
      console.error('Error updating internship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update internship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Delete internship
  async deleteInternship(req, res) {
    try {
      const { id } = req.params;

      const internship = await Internship.findById(id);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Check permissions
      if (internship.postedBy.toString() !== req.user.id && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      await Internship.findByIdAndDelete(id);

      // Clear cache
      await cache.del('internships_*');

      res.json({
        success: true,
        message: 'Internship deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting internship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete internship',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Apply to internship
  async applyToInternship(req, res) {
    try {
      const { id } = req.params;
      const { resume, coverLetter, portfolio, transcript, notes } = req.body;

      const internship = await Internship.findById(id);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Check if still accepting applications
      if (!internship.isAcceptingApplications) {
        return res.status(400).json({
          success: false,
          message: 'This internship is no longer accepting applications'
        });
      }

      // Check if student has already applied
      const existingApplication = internship.applications.find(app => 
        app.student.toString() === req.user.id
      );

      if (existingApplication) {
        return res.status(400).json({
          success: false,
          message: 'You have already applied to this internship'
        });
      }

      // Add application
      await internship.addApplication(req.user.id, {
        resume,
        coverLetter,
        portfolio,
        transcript,
        notes
      });

      // Send notification to company contact
      try {
        await emailService.sendEmail({
          to: internship.company.contact.email,
          subject: `New Application for ${internship.title} - Equity Leaders Program`,
          template: 'internship-application',
          data: {
            companyName: internship.company.name,
            internshipTitle: internship.title,
            studentName: req.user.name,
            studentEmail: req.user.email,
            applicationDate: new Date().toLocaleDateString()
          }
        });
      } catch (emailError) {
        console.error('Failed to send application notification:', emailError);
      }

      // Send confirmation to student
      try {
        await emailService.sendEmail({
          to: req.user.email,
          subject: `Application Submitted for ${internship.title}`,
          template: 'application-confirmation',
          data: {
            studentName: req.user.name,
            internshipTitle: internship.title,
            companyName: internship.company.name,
            applicationDeadline: internship.applicationDeadline
          }
        });
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError);
      }

      // Clear cache
      await cache.del('internships_*');

      res.status(201).json({
        success: true,
        message: 'Application submitted successfully'
      });
    } catch (error) {
      console.error('Error applying to internship:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to submit application',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get student's applications
  async getStudentApplications(req, res) {
    try {
      const { status, page = 1, limit = 20 } = req.query;

      const query = { 'applications.student': req.user.id };
      if (status) {
        query['applications.status'] = status;
      }

      const internships = await Internship.find(query)
        .populate('postedBy', 'name email')
        .sort({ createdAt: -1 });

      // Filter and format applications
      const applications = [];
      internships.forEach(internship => {
        const studentApplications = internship.applications.filter(app => 
          app.student.toString() === req.user.id
        );
        
        studentApplications.forEach(app => {
          applications.push({
            ...app.toObject(),
            internship: {
              _id: internship._id,
              title: internship.title,
              company: internship.company,
              location: internship.company.location,
              duration: internship.duration,
              isPaid: internship.isPaid,
              applicationDeadline: internship.applicationDeadline
            }
          });
        });
      });

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedApplications = applications.slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        data: paginatedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: applications.length,
          pages: Math.ceil(applications.length / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching student applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get company's internship applications
  async getCompanyApplications(req, res) {
    try {
      const { id } = req.params;
      const { status, page = 1, limit = 20 } = req.query;

      const internship = await Internship.findById(id)
        .populate('applications.student', 'name email profile');

      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Check permissions
      if (internship.postedBy.toString() !== req.user.id && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      let applications = internship.applications;
      if (status) {
        applications = applications.filter(app => app.status === status);
      }

      // Pagination
      const skip = (parseInt(page) - 1) * parseInt(limit);
      const paginatedApplications = applications.slice(skip, skip + parseInt(limit));

      res.json({
        success: true,
        data: paginatedApplications,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: applications.length,
          pages: Math.ceil(applications.length / parseInt(limit))
        }
      });
    } catch (error) {
      console.error('Error fetching company applications:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch applications',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Update application status (for companies)
  async updateApplicationStatus(req, res) {
    try {
      const { id, studentId } = req.params;
      const { status, feedback, interviewDates, offerDetails } = req.body;

      const internship = await Internship.findById(id);
      if (!internship) {
        return res.status(404).json({
          success: false,
          message: 'Internship not found'
        });
      }

      // Check permissions
      if (internship.postedBy.toString() !== req.user.id && !req.isAdmin) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const updateData = {};
      if (feedback) updateData.feedback = feedback;
      if (interviewDates) updateData.interviewDates = interviewDates;
      if (offerDetails) updateData.offerDetails = offerDetails;

      await internship.updateApplicationStatus(studentId, status, updateData);

      // Get student details for notification
      const application = internship.applications.find(app => 
        app.student.toString() === studentId
      );

      // Send notification to student
      try {
        await emailService.sendEmail({
          to: application.student.email,
          subject: `Application Status Update for ${internship.title}`,
          template: 'application-status-update',
          data: {
            studentName: application.student.name,
            internshipTitle: internship.title,
            companyName: internship.company.name,
            newStatus: status,
            feedback: feedback || '',
            companyName: internship.company.name
          }
        });
      } catch (emailError) {
        console.error('Failed to send status update email:', emailError);
      }

      res.json({
        success: true,
        message: 'Application status updated successfully'
      });
    } catch (error) {
      console.error('Error updating application status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update application status',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get internship statistics
  async getInternshipStats(req, res) {
    try {
      const stats = await Internship.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalApplications: { $sum: '$applicationsCount' }
          }
        }
      ]);

      const industryStats = await Internship.aggregate([
        { $match: { status: 'active' } },
        {
          $group: {
            _id: '$company.industry',
            count: { $sum: 1 }
          }
        }
      ]);

      const formattedStats = {
        byStatus: stats.reduce((acc, stat) => {
          acc[stat._id] = { count: stat.count, applications: stat.totalApplications };
          return acc;
        }, {}),
        byIndustry: industryStats.reduce((acc, stat) => {
          acc[stat._id] = stat.count;
          return acc;
        }, {})
      };

      res.json({
        success: true,
        data: formattedStats
      });
    } catch (error) {
      console.error('Error fetching internship stats:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch internship statistics',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
}

module.exports = new InternshipController();