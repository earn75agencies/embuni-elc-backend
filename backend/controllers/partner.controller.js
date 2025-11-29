/**
 * Partner Controller
 * Handles partner management operations
 */

const Partner = require('../models/Partner');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/partners');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'partner-' + uniqueSuffix + path.extname(file.originalname));
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
 * Get all partners with optional filtering
 */
const getPartners = async (req, res) => {
  try {
    const {
      type,
      status = 'active',
      featured,
      search,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {};
    if (type && type !== 'all') {query.type = type;}
    if (status && status !== 'all') {query.status = status;}
    if (featured !== undefined) {query.featured = featured === 'true';}

    // Text search
    if (search) {
      query.$text = { $search: search };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const partners = await Partner.find(query)
      .populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email')
      .sort({ featured: -1, order: 1, name: 1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Partner.countDocuments(query);

    res.json({
      success: true,
      data: partners.map(partner => partner.toAdminJSON()),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners',
      error: error.message
    });
  }
};

/**
 * Get partner by ID
 */
const getPartnerById = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id)
      .populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      data: partner.toAdminJSON()
    });
  } catch (error) {
    console.error('Error fetching partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partner',
      error: error.message
    });
  }
};

/**
 * Create new partner
 */
const createPartner = async (req, res) => {
  try {
    const partnerData = {
      ...req.body,
      addedBy: req.user.id
    };

    // Handle logo file if uploaded
    if (req.file) {
      partnerData.logo = `/uploads/partners/${req.file.filename}`;
    }

    const partner = new Partner(partnerData);
    await partner.save();

    await partner.populate('addedBy', 'firstName lastName email');

    res.status(201).json({
      success: true,
      message: 'Partner created successfully',
      data: partner.toAdminJSON()
    });
  } catch (error) {
    console.error('Error creating partner:', error);

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
      message: 'Failed to create partner',
      error: error.message
    });
  }
};

/**
 * Update partner
 */
const updatePartner = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = {
      ...req.body,
      lastUpdatedBy: req.user.id
    };

    // Handle logo file if uploaded
    if (req.file) {
      updateData.logo = `/uploads/partners/${req.file.filename}`;

      // Delete old logo if exists
      const oldPartner = await Partner.findById(id);
      if (oldPartner && oldPartner.logo) {
        try {
          const oldLogoPath = path.join(__dirname, '..', oldPartner.logo);
          await fs.unlink(oldLogoPath);
        } catch (cleanupError) {
          console.error('Error deleting old logo:', cleanupError);
        }
      }
    }

    const partner = await Partner.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('addedBy', 'firstName lastName email')
      .populate('lastUpdatedBy', 'firstName lastName email');

    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    res.json({
      success: true,
      message: 'Partner updated successfully',
      data: partner.toAdminJSON()
    });
  } catch (error) {
    console.error('Error updating partner:', error);

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
      message: 'Failed to update partner',
      error: error.message
    });
  }
};

/**
 * Delete partner
 */
const deletePartner = async (req, res) => {
  try {
    const { id } = req.params;

    const partner = await Partner.findById(id);
    if (!partner) {
      return res.status(404).json({
        success: false,
        message: 'Partner not found'
      });
    }

    // Delete logo file if exists
    if (partner.logo) {
      try {
        const logoPath = path.join(__dirname, '..', partner.logo);
        await fs.unlink(logoPath);
      } catch (cleanupError) {
        console.error('Error deleting logo:', cleanupError);
      }
    }

    await Partner.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Partner deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting partner:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete partner',
      error: error.message
    });
  }
};

/**
 * Update partner order (for reordering)
 */
const updatePartnerOrder = async (req, res) => {
  try {
    const { partners } = req.body; // Array of { id, order }

    const bulkOps = partners.map(({ id, order }) => ({
      updateOne: {
        filter: { _id: id },
        update: { order, lastUpdatedBy: req.user.id }
      }
    }));

    await Partner.bulkWrite(bulkOps);

    res.json({
      success: true,
      message: 'Partner order updated successfully'
    });
  } catch (error) {
    console.error('Error updating partner order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update partner order',
      error: error.message
    });
  }
};

/**
 * Get public partners (for frontend display)
 */
const getPublicPartners = async (req, res) => {
  try {
    const { type, featured, limit } = req.query;

    let query = Partner.getActivePartners(type);

    if (featured === 'true') {
      query = Partner.getFeaturedPartners(limit ? parseInt(limit) : undefined);
    } else if (limit) {
      query = query.limit(parseInt(limit));
    }

    const partners = await query;

    res.json({
      success: true,
      data: partners.map(partner => partner.toPublicJSON())
    });
  } catch (error) {
    console.error('Error fetching public partners:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch partners',
      error: error.message
    });
  }
};

module.exports = {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
  updatePartnerOrder,
  getPublicPartners,
  upload
};
