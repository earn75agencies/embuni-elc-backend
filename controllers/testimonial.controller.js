/**
 * Testimonial Controller
 * Handles testimonial management operations
 */

const Testimonial = require('../models/Testimonial');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/testimonials');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'testimonial-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

/**
 * Get all testimonials with optional filtering
 */
const getTestimonials = async (req, res) => {
  try {
    const {
      status,
      authorRole,
      featured,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (status && status !== 'all') {query.status = status;}
    if (authorRole && authorRole !== 'all') {query.authorRole = authorRole;}
    if (featured !== undefined) {query.featured = featured === 'true';}

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const testimonials = await Testimonial.find(query)
      .populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email')
      .sort({ featured: -1, order: 1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Testimonial.countDocuments(query);

    res.json({
      success: true,
      data: testimonials.map(testimonial => testimonial.toAdminJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};

/**
 * Get testimonial by ID
 */
const getTestimonialById = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id)
      .populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      data: testimonial.toAdminJSON()
    });
  } catch (error) {
    console.error('Error fetching testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonial',
      error: error.message
    });
  }
};

/**
 * Create new testimonial
 */
const createTestimonial = async (req, res) => {
  try {
    const testimonialData = {
      ...req.body,
      addedBy: req.user.id
    };

    // Handle author image file if uploaded
    if (req.file) {
      testimonialData.authorImage = `/uploads/testimonials/${req.file.filename}`;
    }

    const testimonial = new Testimonial(testimonialData);
    await testimonial.save();

    await testimonial.populate('addedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Testimonial created successfully',
      data: testimonial.toAdminJSON()
    });
  } catch (error) {
    console.error('Error creating testimonial:', error);

    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to create testimonial',
      error: error.message
    });
  }
};

/**
 * Update testimonial
 */
const updateTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.id
    };

    // Handle author image file if uploaded
    if (req.file) {
      updateData.authorImage = `/uploads/testimonials/${req.file.filename}`;

      // Delete old image if exists
      const oldTestimonial = await Testimonial.findById(id);
      if (oldTestimonial && oldTestimonial.authorImage) {
        try {
          const oldImagePath = path.join(__dirname, '..', oldTestimonial.authorImage);
          await fs.unlink(oldImagePath);
        } catch (cleanupError) {
          console.error('Error deleting old image:', cleanupError);
        }
      }
    }

    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .populate('reviewedBy', 'firstName lastName email');

    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    res.json({
      success: true,
      message: 'Testimonial updated successfully',
      data: testimonial.toAdminJSON()
    });
  } catch (error) {
    console.error('Error updating testimonial:', error);

    // Clean up uploaded file if error occurred
    if (req.file) {
      try {
        await fs.unlink(req.file.path);
      } catch (cleanupError) {
        console.error('Error cleaning up file:', cleanupError);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial',
      error: error.message
    });
  }
};

/**
 * Delete testimonial
 */
const deleteTestimonial = async (req, res) => {
  try {
    const { id } = req.params;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    // Delete author image file if exists
    if (testimonial.authorImage) {
      try {
        const imagePath = path.join(__dirname, '..', testimonial.authorImage);
        await fs.unlink(imagePath);
      } catch (cleanupError) {
        console.error('Error deleting image:', cleanupError);
      }
    }

    await Testimonial.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Testimonial deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete testimonial',
      error: error.message
    });
  }
};

/**
 * Approve testimonial
 */
const approveTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes = '' } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.approve(req.user.id, reviewNotes);
    await testimonial.populate('reviewedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Testimonial approved successfully',
      data: testimonial.toAdminJSON()
    });
  } catch (error) {
    console.error('Error approving testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve testimonial',
      error: error.message
    });
  }
};

/**
 * Reject testimonial
 */
const rejectTestimonial = async (req, res) => {
  try {
    const { id } = req.params;
    const { reviewNotes = '' } = req.body;

    const testimonial = await Testimonial.findById(id);
    if (!testimonial) {
      return res.status(404).json({
        success: false,
        message: 'Testimonial not found'
      });
    }

    await testimonial.reject(req.user.id, reviewNotes);
    await testimonial.populate('reviewedBy', 'firstName lastName email');

    res.json({
      success: true,
      message: 'Testimonial rejected successfully',
      data: testimonial.toAdminJSON()
    });
  } catch (error) {
    console.error('Error rejecting testimonial:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject testimonial',
      error: error.message
    });
  }
};

/**
 * Update testimonial order (for reordering)
 */
const updateTestimonialOrder = async (req, res) => {
  try {
    const { testimonials } = req.body; // Array of { id, order }

    const bulkOps = testimonials.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order, lastUpdatedBy: req.user.id }
      }
    }));

    await Testimonial.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Testimonial order updated successfully'
    });
  } catch (error) {
    console.error('Error updating testimonial order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update testimonial order',
      error: error.message
    });
  }
};

/**
 * Get public testimonials (for frontend display)
 */
const getPublicTestimonials = async (req, res) => {
  try {
    const { authorRole, featured, limit } = req.query;

    let query;
    if (featured === 'true') {
      query = Testimonial.getFeaturedTestimonials(limit ? parseInt(limit) : undefined);
    } else if (authorRole) {
      query = Testimonial.getTestimonialsByRole(authorRole, limit ? parseInt(limit) : undefined);
    } else {
      query = Testimonial.getApprovedTestimonials(limit ? parseInt(limit) : undefined);
    }

    const testimonials = await query;

    res.json({
      success: true,
      data: testimonials.map(testimonial => testimonial.toPublicJSON())
    });
  } catch (error) {
    console.error('Error fetching public testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch testimonials',
      error: error.message
    });
  }
};

/**
 * Get pending testimonials for review
 */
const getPendingTestimonials = async (req, res) => {
  try {
    const testimonials = await Testimonial.getPendingTestimonials()
      .populate('addedBy', 'firstName lastName email');

    res.json({
      success: true,
      data: testimonials.map(testimonial => testimonial.toAdminJSON())
    });
  } catch (error) {
    console.error('Error fetching pending testimonials:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pending testimonials',
      error: error.message
    });
  }
};

module.exports = {
  getTestimonials,
  getTestimonialById,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  approveTestimonial,
  rejectTestimonial,
  updateTestimonialOrder,
  getPublicTestimonials,
  getPendingTestimonials,
  upload
};
