/**
 * DesignSettings Model
 * Manages UI content, banner texts, footer information, colors, and overall design consistency
 */

const mongoose = require('mongoose');

const designSettingsSchema = new mongoose.Schema({
  // Banner/Hero Section
  banner: {
    title: {
      type: String,
      trim: true,
      default: 'Welcome to Equity Leaders Chapter'
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'Empowering the next generation of leaders'
    },
    ctaText: {
      type: String,
      trim: true,
      default: 'Join Us'
    },
    ctaLink: {
      type: String,
      trim: true,
      default: '/membership'
    },
    backgroundImage: {
      type: String,
      trim: true
    }
  },

  // Hero Section (alternative to banner)
  hero: {
    title: {
      type: String,
      trim: true,
      default: 'Equity Leaders Chapter'
    },
    subtitle: {
      type: String,
      trim: true,
      default: 'Building tomorrow\'s leaders today'
    },
    image: {
      type: String,
      trim: true
    }
  },

  // Footer Information
  footer: {
    description: {
      type: String,
      trim: true,
      default: 'Equity Leaders Chapter is dedicated to developing leadership skills and fostering excellence among students.'
    },
    copyright: {
      type: String,
      trim: true,
      default: `© ${new Date().getFullYear()} Equity Leaders Chapter. All rights reserved.`
    },
    quickLinks: [{
      text: {
        type: String,
        required: true,
        trim: true
      },
      url: {
        type: String,
        required: true,
        trim: true
      },
      order: {
        type: Number,
        default: 0
      }
    }],
    socialLinks: {
      facebook: {
        type: String,
        trim: true
      },
      twitter: {
        type: String,
        trim: true
      },
      instagram: {
        type: String,
        trim: true
      },
      linkedin: {
        type: String,
        trim: true
      },
      youtube: {
        type: String,
        trim: true
      }
    }
  },

  // Color Scheme
  colors: {
    primary: {
      type: String,
      trim: true,
      default: '#3B82F6',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Primary color must be a valid hex color'
      }
    },
    secondary: {
      type: String,
      trim: true,
      default: '#8B5CF6',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Secondary color must be a valid hex color'
      }
    },
    accent: {
      type: String,
      trim: true,
      default: '#10B981',
      validate: {
        validator: function(v) {
          return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(v);
        },
        message: 'Accent color must be a valid hex color'
      }
    }
  },

  // Additional UI Elements
  announcements: {
    enabled: {
      type: Boolean,
      default: true
    },
    defaultText: {
      type: String,
      trim: true,
      default: 'Welcome to Equity Leaders Chapter!'
    }
  },

  // Metadata
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Ensure only one document exists (singleton pattern)
designSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Update settings
designSettingsSchema.statics.updateSettings = async function(data, userId) {
  const settings = await this.getSettings();

  // Update nested fields
  if (data.banner) {
    Object.keys(data.banner).forEach(key => {
      if (data.banner[key] !== undefined) {
        settings.banner[key] = data.banner[key];
      }
    });
  }

  if (data.hero) {
    Object.keys(data.hero).forEach(key => {
      if (data.hero[key] !== undefined) {
        settings.hero[key] = data.hero[key];
      }
    });
  }

  if (data.footer) {
    if (data.footer.description !== undefined) {
      settings.footer.description = data.footer.description;
    }
    if (data.footer.copyright !== undefined) {
      settings.footer.copyright = data.footer.copyright;
    }
    if (data.footer.quickLinks !== undefined) {
      settings.footer.quickLinks = data.footer.quickLinks;
    }
    if (data.footer.socialLinks) {
      Object.keys(data.footer.socialLinks).forEach(key => {
        if (data.footer.socialLinks[key] !== undefined) {
          settings.footer.socialLinks[key] = data.footer.socialLinks[key];
        }
      });
    }
  }

  if (data.colors) {
    Object.keys(data.colors).forEach(key => {
      if (data.colors[key] !== undefined) {
        settings.colors[key] = data.colors[key];
      }
    });
  }

  if (data.announcements) {
    Object.keys(data.announcements).forEach(key => {
      if (data.announcements[key] !== undefined) {
        settings.announcements[key] = data.announcements[key];
      }
    });
  }

  if (userId) {
    settings.lastUpdatedBy = userId;
  }

  await settings.save();
  return settings;
};

// Helper method to get public settings
designSettingsSchema.methods.toPublicJSON = function() {
  return {
    banner: this.banner,
    hero: this.hero,
    footer: this.footer,
    colors: this.colors,
    announcements: this.announcements
  };
};

module.exports = mongoose.model('DesignSettings', designSettingsSchema);
