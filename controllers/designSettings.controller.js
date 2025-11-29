/**
 * DesignSettings Controller
 * Handles design settings management operations
 */

const DesignSettings = require('../models/DesignSettings');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/design');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const fieldName = file.fieldname;
    cb(null, `${fieldName}-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit for design assets
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|webp|svg/;
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
 * Get design settings
 */
const getDesignSettings = async (req, res) => {
  try {
    const settings = await DesignSettings.getSettings();

    res.json({
      success: true,
      data: settings.toPublicJSON()
    });
  } catch (error) {
    console.error('Error fetching design settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch design settings',
      error: error.message
    });
  }
};

/**
 * Update design settings
 */
const updateDesignSettings = async (req, res) => {
  try {
    const updateData = { ...req.body };

    // Handle file uploads
    if (req.files) {
      // Handle banner background image
      if (req.files.bannerBackgroundImage) {
        updateData.banner = {
          ...updateData.banner,
          backgroundImage: `/uploads/design/${req.files.bannerBackgroundImage[0].filename}`
        };

        // Delete old banner image if exists
        const oldSettings = await DesignSettings.getSettings();
        if (oldSettings.banner && oldSettings.banner.backgroundImage) {
          try {
            const oldImagePath = path.join(__dirname, '..', oldSettings.banner.backgroundImage);
            await fs.unlink(oldImagePath);
          } catch (cleanupError) {
            console.error('Error deleting old banner image:', cleanupError);
          }
        }
      }

      // Handle hero image
      if (req.files.heroImage) {
        updateData.hero = {
          ...updateData.hero,
          image: `/uploads/design/${req.files.heroImage[0].filename}`
        };

        // Delete old hero image if exists
        const oldSettings = await DesignSettings.getSettings();
        if (oldSettings.hero && oldSettings.hero.image) {
          try {
            const oldImagePath = path.join(__dirname, '..', oldSettings.hero.image);
            await fs.unlink(oldImagePath);
          } catch (cleanupError) {
            console.error('Error deleting old hero image:', cleanupError);
          }
        }
      }
    }

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Design settings updated successfully',
      data: settings.toPublicJSON()
    });
  } catch (error) {
    console.error('Error updating design settings:', error);

    // Clean up uploaded files if error occurred
    if (req.files) {
      Object.values(req.files).flat().forEach(async (file) => {
        try {
          await fs.unlink(file.path);
        } catch (cleanupError) {
          console.error('Error cleaning up file:', cleanupError);
        }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Failed to update design settings',
      error: error.message
    });
  }
};

/**
 * Update banner settings
 */
const updateBannerSettings = async (req, res) => {
  try {
    const { title, subtitle, ctaText, ctaLink } = req.body;

    const updateData = {
      banner: {
        title,
        subtitle,
        ctaText,
        ctaLink
      }
    };

    // Handle banner background image if uploaded
    if (req.file) {
      updateData.banner.backgroundImage = `/uploads/design/${req.file.filename}`;

      // Delete old banner image if exists
      const oldSettings = await DesignSettings.getSettings();
      if (oldSettings.banner && oldSettings.banner.backgroundImage) {
        try {
          const oldImagePath = path.join(__dirname, '..', oldSettings.banner.backgroundImage);
          await fs.unlink(oldImagePath);
        } catch (cleanupError) {
          console.error('Error deleting old banner image:', cleanupError);
        }
      }
    }

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Banner settings updated successfully',
      data: settings.toPublicJSON().banner
    });
  } catch (error) {
    console.error('Error updating banner settings:', error);

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
      message: 'Failed to update banner settings',
      error: error.message
    });
  }
};

/**
 * Update hero settings
 */
const updateHeroSettings = async (req, res) => {
  try {
    const { title, subtitle } = req.body;

    const updateData = {
      hero: {
        title,
        subtitle
      }
    };

    // Handle hero image if uploaded
    if (req.file) {
      updateData.hero.image = `/uploads/design/${req.file.filename}`;

      // Delete old hero image if exists
      const oldSettings = await DesignSettings.getSettings();
      if (oldSettings.hero && oldSettings.hero.image) {
        try {
          const oldImagePath = path.join(__dirname, '..', oldSettings.hero.image);
          await fs.unlink(oldImagePath);
        } catch (cleanupError) {
          console.error('Error deleting old hero image:', cleanupError);
        }
      }
    }

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Hero settings updated successfully',
      data: settings.toPublicJSON().hero
    });
  } catch (error) {
    console.error('Error updating hero settings:', error);

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
      message: 'Failed to update hero settings',
      error: error.message
    });
  }
};

/**
 * Update footer settings
 */
const updateFooterSettings = async (req, res) => {
  try {
    const { description, copyright, quickLinks, socialLinks } = req.body;

    const updateData = {
      footer: {
        description,
        copyright,
        quickLinks,
        socialLinks
      }
    };

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Footer settings updated successfully',
      data: settings.toPublicJSON().footer
    });
  } catch (error) {
    console.error('Error updating footer settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update footer settings',
      error: error.message
    });
  }
};

/**
 * Update color scheme
 */
const updateColorScheme = async (req, res) => {
  try {
    const { primary, secondary, accent } = req.body;

    const updateData = {
      colors: {
        primary,
        secondary,
        accent
      }
    };

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Color scheme updated successfully',
      data: settings.toPublicJSON().colors
    });
  } catch (error) {
    console.error('Error updating color scheme:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update color scheme',
      error: error.message
    });
  }
};

/**
 * Update announcement settings
 */
const updateAnnouncementSettings = async (req, res) => {
  try {
    const { enabled, defaultText } = req.body;

    const updateData = {
      announcements: {
        enabled,
        defaultText
      }
    };

    const settings = await DesignSettings.updateSettings(updateData, req.user.id);

    res.json({
      success: true,
      message: 'Announcement settings updated successfully',
      data: settings.toPublicJSON().announcements
    });
  } catch (error) {
    console.error('Error updating announcement settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update announcement settings',
      error: error.message
    });
  }
};

/**
 * Reset design settings to defaults
 */
const resetDesignSettings = async (req, res) => {
  try {
    // Create a new document with default values
    await DesignSettings.deleteMany({});
    const settings = await DesignSettings.create({
      lastUpdatedBy: req.user.id
    });

    res.json({
      success: true,
      message: 'Design settings reset to defaults successfully',
      data: settings.toPublicJSON()
    });
  } catch (error) {
    console.error('Error resetting design settings:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset design settings',
      error: error.message
    });
  }
};

module.exports = {
  getDesignSettings,
  updateDesignSettings,
  updateBannerSettings,
  updateHeroSettings,
  updateFooterSettings,
  updateColorScheme,
  updateAnnouncementSettings,
  resetDesignSettings,
  upload
};
