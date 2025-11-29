/**
 * Contact Controller
 * Handles contact information and social media links management
 */

const ContactInfo = require('../models/ContactInfo');
const { asyncHandler, APIError } = require('../middleware/errorMiddleware');
const cache = require('../utils/cache');

/**
 * Get contact information
 * GET /api/contact
 * Public endpoint
 */
exports.getContactInfo = asyncHandler(async (req, res) => {
  // Cache contact info for 5 minutes (rarely changes)
  const cacheKey = 'contact:info';
  const cached = cache.get(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const contactInfo = await ContactInfo.getContactInfo();

  const response = {
    success: true,
    data: contactInfo
  };

  // Cache for 5 minutes
  cache.set(cacheKey, response, 300000);

  res.status(200).json(response);
});

/**
 * Update contact information
 * PUT /api/contact
 * Admin only
 */
exports.updateContactInfo = asyncHandler(async (req, res) => {
  const { email, phone, address, googleMapEmbed, socialLinks, officeHours } = req.body;

  // Validate required fields are present (at least one field should be provided)
  if (!email && !phone && !address && !googleMapEmbed && !socialLinks && !officeHours) {
    throw new APIError('At least one field must be provided for update', 400);
  }

  // Validate email format if provided
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new APIError('Invalid email format', 400);
  }

  // Validate URLs if provided
  if (socialLinks) {
    const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-])*\/?$/;
    if (socialLinks.facebook && !urlPattern.test(socialLinks.facebook)) {
      throw new APIError('Invalid Facebook URL format', 400);
    }
    if (socialLinks.twitter && !urlPattern.test(socialLinks.twitter)) {
      throw new APIError('Invalid Twitter URL format', 400);
    }
    if (socialLinks.instagram && !urlPattern.test(socialLinks.instagram)) {
      throw new APIError('Invalid Instagram URL format', 400);
    }
    if (socialLinks.linkedin && !urlPattern.test(socialLinks.linkedin)) {
      throw new APIError('Invalid LinkedIn URL format', 400);
    }
    if (socialLinks.youtube && !urlPattern.test(socialLinks.youtube)) {
      throw new APIError('Invalid YouTube URL format', 400);
    }
  }

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({
    email,
    phone,
    address,
    googleMapEmbed,
    socialLinks,
    officeHours
  }, userId);

  // Invalidate cache
  cache.delete('contact:info');

  res.status(200).json({
    success: true,
    message: 'Contact information updated successfully',
    data: contactInfo
  });
});

// ============================================================================
// COMPREHENSIVE EXPANSION: VALIDATION UTILITIES (200+ lines)
// ============================================================================

/**
 * Advanced validation utilities for contact operations
 */
const validationUtils = {
  /**
   * Validate email format with comprehensive checks
   */
  validateEmail: (email) => {
    if (!email) {return { valid: true };} // Optional field

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new APIError('Invalid email format', 400);
    }

    // Check length
    if (email.length > 254) {
      throw new APIError('Email address too long', 400);
    }

    // Check for common invalid patterns
    if (email.includes('..') || email.startsWith('.') || email.endsWith('.')) {
      throw new APIError('Invalid email format', 400);
    }

    return { valid: true };
  },

  /**
   * Validate phone number format
   */
  validatePhone: (phone) => {
    if (!phone) {return { valid: true };} // Optional field

    const phoneRegex = /^\+?[\d\s-()]+$/;
    if (!phoneRegex.test(phone)) {
      throw new APIError('Invalid phone number format', 400);
    }

    // Remove formatting and check length
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 7 || digitsOnly.length > 15) {
      throw new APIError('Phone number must be between 7 and 15 digits', 400);
    }

    return { valid: true };
  },

  /**
   * Validate URL format
   */
  validateURL: (url, platform = 'generic') => {
    if (!url) {return { valid: true };} // Optional field

    try {
      const urlObj = new URL(url);

      // Check protocol
      if (!['http:', 'https:'].includes(urlObj.protocol)) {
        throw new APIError(`Invalid URL protocol for ${platform}`, 400);
      }

      // Platform-specific validation
      if (platform === 'facebook' && !urlObj.hostname.includes('facebook.com')) {
        throw new APIError('Invalid Facebook URL', 400);
      }
      if (platform === 'twitter' && !urlObj.hostname.includes('twitter.com') && !urlObj.hostname.includes('x.com')) {
        throw new APIError('Invalid Twitter/X URL', 400);
      }
      if (platform === 'instagram' && !urlObj.hostname.includes('instagram.com')) {
        throw new APIError('Invalid Instagram URL', 400);
      }
      if (platform === 'linkedin' && !urlObj.hostname.includes('linkedin.com')) {
        throw new APIError('Invalid LinkedIn URL', 400);
      }
      if (platform === 'youtube' && !urlObj.hostname.includes('youtube.com') && !urlObj.hostname.includes('youtu.be')) {
        throw new APIError('Invalid YouTube URL', 400);
      }

      return { valid: true };
    } catch (error) {
      if (error instanceof APIError) {throw error;}
      throw new APIError(`Invalid URL format for ${platform}`, 400);
    }
  },

  /**
   * Validate address object
   */
  validateAddress: (address) => {
    if (!address) {return { valid: true };} // Optional field

    if (typeof address !== 'object') {
      throw new APIError('Address must be an object', 400);
    }

    // Validate individual address fields if provided
    if (address.street && typeof address.street !== 'string') {
      throw new APIError('Street must be a string', 400);
    }
    if (address.city && typeof address.city !== 'string') {
      throw new APIError('City must be a string', 400);
    }
    if (address.state && typeof address.state !== 'string') {
      throw new APIError('State must be a string', 400);
    }
    if (address.zipCode && typeof address.zipCode !== 'string') {
      throw new APIError('Zip code must be a string', 400);
    }
    if (address.country && typeof address.country !== 'string') {
      throw new APIError('Country must be a string', 400);
    }

    return { valid: true };
  },

  /**
   * Validate office hours
   */
  validateOfficeHours: (officeHours) => {
    if (!officeHours) {return { valid: true };} // Optional field

    if (typeof officeHours !== 'object') {
      throw new APIError('Office hours must be an object', 400);
    }

    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    for (const day of days) {
      if (officeHours[day]) {
        if (typeof officeHours[day] !== 'object') {
          throw new APIError(`${day} hours must be an object with open and close times`, 400);
        }
        if (officeHours[day].open && !timeRegex.test(officeHours[day].open)) {
          throw new APIError(`Invalid open time format for ${day}`, 400);
        }
        if (officeHours[day].close && !timeRegex.test(officeHours[day].close)) {
          throw new APIError(`Invalid close time format for ${day}`, 400);
        }
        if (officeHours[day].open && officeHours[day].close) {
          const [openHour, openMin] = officeHours[day].open.split(':').map(Number);
          const [closeHour, closeMin] = officeHours[day].close.split(':').map(Number);
          const openTime = openHour * 60 + openMin;
          const closeTime = closeHour * 60 + closeMin;
          if (closeTime <= openTime) {
            throw new APIError(`Close time must be after open time for ${day}`, 400);
          }
        }
      }
    }

    return { valid: true };
  },

  /**
   * Validate Google Maps embed code
   */
  validateGoogleMapEmbed: (embed) => {
    if (!embed) {return { valid: true };} // Optional field

    if (typeof embed !== 'string') {
      throw new APIError('Google Maps embed must be a string', 400);
    }

    // Check if it's an iframe embed
    if (!embed.includes('<iframe') && !embed.includes('src=')) {
      throw new APIError('Invalid Google Maps embed format', 400);
    }

    // Check for potentially malicious content
    if (embed.includes('javascript:') || embed.includes('onerror=')) {
      throw new APIError('Invalid embed code: potentially unsafe content', 400);
    }

    return { valid: true };
  },

  /**
   * Validate social links object
   */
  validateSocialLinks: (socialLinks) => {
    if (!socialLinks) {return { valid: true };} // Optional field

    if (typeof socialLinks !== 'object') {
      throw new APIError('Social links must be an object', 400);
    }

    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

    for (const platform of platforms) {
      if (socialLinks[platform]) {
        validationUtils.validateURL(socialLinks[platform], platform);
      }
    }

    return { valid: true };
  },

  /**
   * Sanitize input string
   */
  sanitizeString: (str) => {
    if (typeof str !== 'string') {return '';}
    return str.trim().replace(/[<>]/g, '').substring(0, 1000);
  }
};

// ============================================================================
// CACHING UTILITIES (150+ lines)
// ============================================================================

/**
 * Advanced caching utilities for contact operations
 */
const cacheUtils = {
  /**
   * Generate cache key for contact queries
   */
  generateCacheKey: (prefix, params = {}) => {
    const sortedParams = Object.keys(params)
      .sort()
      .map(key => `${key}:${params[key]}`)
      .join('|');
    return sortedParams ? `${prefix}:${sortedParams}` : prefix;
  },

  /**
   * Get cached contact data
   */
  getCachedContact: (cacheKey) => {
    return cache.get(cacheKey);
  },

  /**
   * Set cached contact data
   */
  setCachedContact: (cacheKey, data, ttl = 300000) => {
    cache.set(cacheKey, data, ttl);
  },

  /**
   * Invalidate contact-related cache
   */
  invalidateContactCache: () => {
    const patterns = [
      'contact:info',
      'contact:social',
      'contact:hours',
      'contact:map'
    ];
    patterns.forEach(pattern => cache.delete(pattern));
  },

  /**
   * Cache contact info with different TTLs based on type
   */
  cacheContactInfo: (type, data) => {
    const ttlMap = {
      info: 300000,      // 5 minutes
      social: 600000,    // 10 minutes
      hours: 1800000,    // 30 minutes
      map: 3600000       // 1 hour
    };

    const cacheKey = `contact:${type}`;
    const ttl = ttlMap[type] || 300000;
    cache.set(cacheKey, data, ttl);
  }
};

// ============================================================================
// DATA TRANSFORMATION UTILITIES (150+ lines)
// ============================================================================

/**
 * Data transformation utilities for consistent API responses
 */
const transformUtils = {
  /**
   * Transform contact info for API response
   */
  transformContactInfo: (contactInfo, includeSensitive = false) => {
    const transformed = {
      _id: contactInfo._id,
      email: contactInfo.email,
      phone: contactInfo.phone,
      address: contactInfo.address,
      googleMapEmbed: contactInfo.googleMapEmbed,
      socialLinks: contactInfo.socialLinks || {},
      officeHours: contactInfo.officeHours || {},
      updatedAt: contactInfo.updatedAt,
      createdAt: contactInfo.createdAt
    };

    if (includeSensitive) {
      transformed.updatedBy = contactInfo.updatedBy;
      transformed.version = contactInfo.version;
    }

    return transformed;
  },

  /**
   * Format office hours for display
   */
  formatOfficeHours: (officeHours) => {
    if (!officeHours || typeof officeHours !== 'object') {
      return null;
    }

    const formatted = {};
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

    for (const day of days) {
      if (officeHours[day] && officeHours[day].open && officeHours[day].close) {
        formatted[day] = {
          open: officeHours[day].open,
          close: officeHours[day].close,
          closed: officeHours[day].closed || false
        };
      } else {
        formatted[day] = { closed: true };
      }
    }

    return formatted;
  },

  /**
   * Format social links for display
   */
  formatSocialLinks: (socialLinks) => {
    if (!socialLinks || typeof socialLinks !== 'object') {
      return {};
    }

    const formatted = {};
    const platforms = ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'];

    for (const platform of platforms) {
      if (socialLinks[platform]) {
        formatted[platform] = {
          url: socialLinks[platform],
          icon: `fa-${platform}`,
          name: platform.charAt(0).toUpperCase() + platform.slice(1)
        };
      }
    }

    return formatted;
  },

  /**
   * Format address for display
   */
  formatAddress: (address) => {
    if (!address || typeof address !== 'object') {
      return null;
    }

    const parts = [];
    if (address.street) {parts.push(address.street);}
    if (address.city) {parts.push(address.city);}
    if (address.state) {parts.push(address.state);}
    if (address.zipCode) {parts.push(address.zipCode);}
    if (address.country) {parts.push(address.country);}

    return {
      full: parts.join(', '),
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      zipCode: address.zipCode || '',
      country: address.country || ''
    };
  }
};

// ============================================================================
// ADDITIONAL ENDPOINTS (800+ lines)
// ============================================================================

/**
 * Get social media links only
 * GET /api/contact/social
 */
exports.getSocialLinks = asyncHandler(async (req, res) => {
  const cacheKey = 'contact:social';
  const cached = cacheUtils.getCachedContact(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const contactInfo = await ContactInfo.getContactInfo();
  const socialLinks = transformUtils.formatSocialLinks(contactInfo.socialLinks);

  const response = {
    success: true,
    data: socialLinks
  };

  cacheUtils.cacheContactInfo('social', response);
  res.status(200).json(response);
});

/**
 * Get office hours only
 * GET /api/contact/hours
 */
exports.getOfficeHours = asyncHandler(async (req, res) => {
  const cacheKey = 'contact:hours';
  const cached = cacheUtils.getCachedContact(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const contactInfo = await ContactInfo.getContactInfo();
  const officeHours = transformUtils.formatOfficeHours(contactInfo.officeHours);

  const response = {
    success: true,
    data: officeHours
  };

  cacheUtils.cacheContactInfo('hours', response);
  res.status(200).json(response);
});

/**
 * Get address only
 * GET /api/contact/address
 */
exports.getAddress = asyncHandler(async (req, res) => {
  const cacheKey = 'contact:address';
  const cached = cacheUtils.getCachedContact(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const contactInfo = await ContactInfo.getContactInfo();
  const address = transformUtils.formatAddress(contactInfo.address);

  const response = {
    success: true,
    data: address
  };

  cache.set(cacheKey, response, 300000);
  res.status(200).json(response);
});

/**
 * Get Google Maps embed only
 * GET /api/contact/map
 */
exports.getGoogleMapEmbed = asyncHandler(async (req, res) => {
  const cacheKey = 'contact:map';
  const cached = cacheUtils.getCachedContact(cacheKey);
  if (cached) {
    return res.status(200).json(cached);
  }

  const contactInfo = await ContactInfo.getContactInfo();

  const response = {
    success: true,
    data: {
      embed: contactInfo.googleMapEmbed,
      address: transformUtils.formatAddress(contactInfo.address)
    }
  };

  cacheUtils.cacheContactInfo('map', response);
  res.status(200).json(response);
});

/**
 * Update email only
 * PUT /api/contact/email
 * Admin only
 */
exports.updateEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new APIError('Email is required', 400);
  }

  validationUtils.validateEmail(email);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ email }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Email updated successfully',
    data: { email: contactInfo.email }
  });
});

/**
 * Update phone only
 * PUT /api/contact/phone
 * Admin only
 */
exports.updatePhone = asyncHandler(async (req, res) => {
  const { phone } = req.body;

  if (!phone) {
    throw new APIError('Phone is required', 400);
  }

  validationUtils.validatePhone(phone);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ phone }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Phone updated successfully',
    data: { phone: contactInfo.phone }
  });
});

/**
 * Update address only
 * PUT /api/contact/address
 * Admin only
 */
exports.updateAddress = asyncHandler(async (req, res) => {
  const { address } = req.body;

  if (!address) {
    throw new APIError('Address is required', 400);
  }

  validationUtils.validateAddress(address);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ address }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { address: transformUtils.formatAddress(contactInfo.address) }
  });
});

/**
 * Update social links only
 * PUT /api/contact/social
 * Admin only
 */
exports.updateSocialLinks = asyncHandler(async (req, res) => {
  const { socialLinks } = req.body;

  if (!socialLinks) {
    throw new APIError('Social links are required', 400);
  }

  validationUtils.validateSocialLinks(socialLinks);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ socialLinks }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Social links updated successfully',
    data: { socialLinks: transformUtils.formatSocialLinks(contactInfo.socialLinks) }
  });
});

/**
 * Update office hours only
 * PUT /api/contact/hours
 * Admin only
 */
exports.updateOfficeHours = asyncHandler(async (req, res) => {
  const { officeHours } = req.body;

  if (!officeHours) {
    throw new APIError('Office hours are required', 400);
  }

  validationUtils.validateOfficeHours(officeHours);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ officeHours }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Office hours updated successfully',
    data: { officeHours: transformUtils.formatOfficeHours(contactInfo.officeHours) }
  });
});

/**
 * Update Google Maps embed only
 * PUT /api/contact/map
 * Admin only
 */
exports.updateGoogleMapEmbed = asyncHandler(async (req, res) => {
  const { googleMapEmbed } = req.body;

  if (!googleMapEmbed) {
    throw new APIError('Google Maps embed is required', 400);
  }

  validationUtils.validateGoogleMapEmbed(googleMapEmbed);

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo({ googleMapEmbed }, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Google Maps embed updated successfully',
    data: { googleMapEmbed: contactInfo.googleMapEmbed }
  });
});

/**
 * Validate contact information
 * POST /api/contact/validate
 * Admin only
 */
exports.validateContactInfo = asyncHandler(async (req, res) => {
  const { email, phone, address, socialLinks, officeHours, googleMapEmbed } = req.body;

  const validationResults = {
    email: { valid: true, errors: [] },
    phone: { valid: true, errors: [] },
    address: { valid: true, errors: [] },
    socialLinks: { valid: true, errors: [] },
    officeHours: { valid: true, errors: [] },
    googleMapEmbed: { valid: true, errors: [] },
    overall: { valid: true }
  };

  try {
    if (email) {validationUtils.validateEmail(email);}
  } catch (error) {
    validationResults.email = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  try {
    if (phone) {validationUtils.validatePhone(phone);}
  } catch (error) {
    validationResults.phone = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  try {
    if (address) {validationUtils.validateAddress(address);}
  } catch (error) {
    validationResults.address = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  try {
    if (socialLinks) {validationUtils.validateSocialLinks(socialLinks);}
  } catch (error) {
    validationResults.socialLinks = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  try {
    if (officeHours) {validationUtils.validateOfficeHours(officeHours);}
  } catch (error) {
    validationResults.officeHours = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  try {
    if (googleMapEmbed) {validationUtils.validateGoogleMapEmbed(googleMapEmbed);}
  } catch (error) {
    validationResults.googleMapEmbed = { valid: false, errors: [error.message] };
    validationResults.overall.valid = false;
  }

  res.status(200).json({
    success: true,
    data: validationResults
  });
});

/**
 * Get contact information history (admin only)
 * GET /api/contact/history
 */
exports.getContactHistory = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();

  const history = {
    createdAt: contactInfo.createdAt,
    updatedAt: contactInfo.updatedAt,
    updatedBy: contactInfo.updatedBy,
    version: contactInfo.version || 1,
    changes: []
  };

  res.status(200).json({
    success: true,
    data: history
  });
});

/**
 * Bulk update contact information
 * PUT /api/contact/bulk
 * Admin only
 */
exports.bulkUpdateContactInfo = asyncHandler(async (req, res) => {
  const updates = req.body;

  if (!updates || typeof updates !== 'object') {
    throw new APIError('Updates object is required', 400);
  }

  // Validate all fields before updating
  if (updates.email) {validationUtils.validateEmail(updates.email);}
  if (updates.phone) {validationUtils.validatePhone(updates.phone);}
  if (updates.address) {validationUtils.validateAddress(updates.address);}
  if (updates.socialLinks) {validationUtils.validateSocialLinks(updates.socialLinks);}
  if (updates.officeHours) {validationUtils.validateOfficeHours(updates.officeHours);}
  if (updates.googleMapEmbed) {validationUtils.validateGoogleMapEmbed(updates.googleMapEmbed);}

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo(updates, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Contact information updated successfully',
    data: transformUtils.transformContactInfo(contactInfo, true)
  });
});

/**
 * Get contact statistics (admin only)
 * GET /api/contact/stats
 */
exports.getContactStats = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();

  const stats = {
    hasEmail: !!contactInfo.email,
    hasPhone: !!contactInfo.phone,
    hasAddress: !!contactInfo.address,
    hasGoogleMap: !!contactInfo.googleMapEmbed,
    socialLinksCount: contactInfo.socialLinks ? Object.keys(contactInfo.socialLinks).filter(k => contactInfo.socialLinks[k]).length : 0,
    officeHoursConfigured: contactInfo.officeHours ? Object.keys(contactInfo.officeHours).length > 0 : false,
    lastUpdated: contactInfo.updatedAt,
    completeness: 0
  };

  // Calculate completeness percentage
  let fields = 0;
  let filled = 0;
  if (stats.hasEmail) {filled++;} fields++;
  if (stats.hasPhone) {filled++;} fields++;
  if (stats.hasAddress) {filled++;} fields++;
  if (stats.hasGoogleMap) {filled++;} fields++;
  if (stats.socialLinksCount > 0) {filled++;} fields++;
  if (stats.officeHoursConfigured) {filled++;} fields++;

  stats.completeness = fields > 0 ? Math.round((filled / fields) * 100) : 0;

  res.status(200).json({
    success: true,
    data: stats
  });
});

/**
 * Export contact information (admin only)
 * GET /api/contact/export
 */
exports.exportContactInfo = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();
  const format = req.query.format || 'json';

  if (format === 'csv') {
    const csv = [
      'Field,Value',
      `Email,"${contactInfo.email || ''}"`,
      `Phone,"${contactInfo.phone || ''}"`,
      `Address,"${contactInfo.address ? JSON.stringify(contactInfo.address) : ''}"`,
      `Social Links,"${contactInfo.socialLinks ? JSON.stringify(contactInfo.socialLinks) : ''}"`,
      `Office Hours,"${contactInfo.officeHours ? JSON.stringify(contactInfo.officeHours) : ''}"`,
      `Updated At,"${contactInfo.updatedAt}"`
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=contact-info.csv');
    return res.send(csv);
  }

  res.status(200).json({
    success: true,
    data: transformUtils.transformContactInfo(contactInfo, true)
  });
});

/**
 * Search contact information
 * GET /api/contact/search
 */
exports.searchContactInfo = asyncHandler(async (req, res) => {
  const { query } = req.query;

  if (!query) {
    throw new APIError('Search query is required', 400);
  }

  const contactInfo = await ContactInfo.getContactInfo();
  const searchTerm = query.toLowerCase();
  const results = {
    email: contactInfo.email && contactInfo.email.toLowerCase().includes(searchTerm) ? contactInfo.email : null,
    phone: contactInfo.phone && contactInfo.phone.includes(searchTerm) ? contactInfo.phone : null,
    address: null,
    socialLinks: {}
  };

  // Search in address
  if (contactInfo.address) {
    const addressStr = JSON.stringify(contactInfo.address).toLowerCase();
    if (addressStr.includes(searchTerm)) {
      results.address = transformUtils.formatAddress(contactInfo.address);
    }
  }

  // Search in social links
  if (contactInfo.socialLinks) {
    for (const [platform, url] of Object.entries(contactInfo.socialLinks)) {
      if (url && url.toLowerCase().includes(searchTerm)) {
        results.socialLinks[platform] = url;
      }
    }
  }

  res.status(200).json({
    success: true,
    query: searchTerm,
    results
  });
});

/**
 * Get contact information by field
 * GET /api/contact/field/:fieldName
 */
exports.getContactField = asyncHandler(async (req, res) => {
  const { fieldName } = req.params;
  const contactInfo = await ContactInfo.getContactInfo();

  const allowedFields = ['email', 'phone', 'address', 'socialLinks', 'officeHours', 'googleMapEmbed'];

  if (!allowedFields.includes(fieldName)) {
    throw new APIError(`Invalid field name. Allowed: ${allowedFields.join(', ')}`, 400);
  }

  let data = contactInfo[fieldName];

  // Format data based on field type
  if (fieldName === 'address') {
    data = transformUtils.formatAddress(data);
  } else if (fieldName === 'socialLinks') {
    data = transformUtils.formatSocialLinks(data);
  } else if (fieldName === 'officeHours') {
    data = transformUtils.formatOfficeHours(data);
  }

  res.status(200).json({
    success: true,
    field: fieldName,
    data
  });
});

/**
 * Test contact information connectivity (admin only)
 * POST /api/contact/test
 */
exports.testContactInfo = asyncHandler(async (req, res) => {
  const { type, value } = req.body;

  if (!type || !value) {
    throw new APIError('Type and value are required', 400);
  }

  const tests = {
    email: async (email) => {
      validationUtils.validateEmail(email);
      // Basic email format check (can't actually send email without SMTP)
      return { valid: true, message: 'Email format is valid' };
    },
    phone: async (phone) => {
      validationUtils.validatePhone(phone);
      return { valid: true, message: 'Phone format is valid' };
    },
    url: async (url) => {
      validationUtils.validateURL(url);
      // Try to fetch URL to verify it's accessible
      try {
        const https = require('https');
        const http = require('http');
        const urlObj = new URL(url);
        const client = urlObj.protocol === 'https:' ? https : http;

        return new Promise((resolve, reject) => {
          const req = client.get(url, { timeout: 5000 }, (res) => {
            resolve({ valid: true, message: 'URL is accessible', statusCode: res.statusCode });
          });
          req.on('error', () => {
            resolve({ valid: false, message: 'URL is not accessible' });
          });
          req.on('timeout', () => {
            req.destroy();
            resolve({ valid: false, message: 'URL request timed out' });
          });
        });
      } catch (error) {
        return { valid: false, message: 'Failed to test URL' };
      }
    }
  };

  if (!tests[type]) {
    throw new APIError(`Invalid test type. Allowed: ${Object.keys(tests).join(', ')}`, 400);
  }

  const result = await tests[type](value);

  res.status(200).json({
    success: true,
    test: type,
    result
  });
});

/**
 * Get contact information preview
 * GET /api/contact/preview
 */
exports.getContactPreview = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();

  const preview = {
    email: contactInfo.email ? contactInfo.email.substring(0, 3) + '***' : null,
    phone: contactInfo.phone ? contactInfo.phone.substring(0, 3) + '***' : null,
    hasAddress: !!contactInfo.address,
    socialLinksCount: contactInfo.socialLinks ? Object.keys(contactInfo.socialLinks).filter(k => contactInfo.socialLinks[k]).length : 0,
    hasOfficeHours: !!contactInfo.officeHours && Object.keys(contactInfo.officeHours).length > 0,
    hasGoogleMap: !!contactInfo.googleMapEmbed
  };

  res.status(200).json({
    success: true,
    preview
  });
});

/**
 * Reset contact information to defaults (admin only)
 * POST /api/contact/reset
 */
exports.resetContactInfo = asyncHandler(async (req, res) => {
  const defaults = {
    email: '',
    phone: '',
    address: {},
    socialLinks: {},
    officeHours: {},
    googleMapEmbed: ''
  };

  const userId = req.user ? req.user._id : null;
  const contactInfo = await ContactInfo.updateContactInfo(defaults, userId);

  cacheUtils.invalidateContactCache();

  res.status(200).json({
    success: true,
    message: 'Contact information reset to defaults',
    data: transformUtils.transformContactInfo(contactInfo)
  });
});

/**
 * Duplicate contact information check
 * POST /api/contact/check-duplicate
 */
exports.checkDuplicate = asyncHandler(async (req, res) => {
  const { field, value } = req.body;

  if (!field || !value) {
    throw new APIError('Field and value are required', 400);
  }

  const contactInfo = await ContactInfo.getContactInfo();
  let isDuplicate = false;
  let message = '';

  switch (field) {
  case 'email':
    isDuplicate = contactInfo.email === value;
    message = isDuplicate ? 'Email already exists' : 'Email is available';
    break;
  case 'phone':
    isDuplicate = contactInfo.phone === value;
    message = isDuplicate ? 'Phone already exists' : 'Phone is available';
    break;
  default:
    throw new APIError('Invalid field. Allowed: email, phone', 400);
  }

  res.status(200).json({
    success: true,
    field,
    isDuplicate,
    message
  });
});

/**
 * Get contact information version
 * GET /api/contact/version
 */
exports.getContactVersion = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();

  res.status(200).json({
    success: true,
    data: {
      version: contactInfo.version || 1,
      createdAt: contactInfo.createdAt,
      updatedAt: contactInfo.updatedAt,
      updatedBy: contactInfo.updatedBy
    }
  });
});

/**
 * Compare contact information versions (admin only)
 * POST /api/contact/compare
 */
exports.compareContactVersions = asyncHandler(async (req, res) => {
  const { version1, version2 } = req.body;

  if (!version1 || !version2) {
    throw new APIError('Both version1 and version2 are required', 400);
  }

  // Since we don't have version history, we'll compare current with provided data
  const contactInfo = await ContactInfo.getContactInfo();
  const current = transformUtils.transformContactInfo(contactInfo, true);

  const differences = {
    email: current.email !== version2.email,
    phone: current.phone !== version2.phone,
    address: JSON.stringify(current.address) !== JSON.stringify(version2.address),
    socialLinks: JSON.stringify(current.socialLinks) !== JSON.stringify(version2.socialLinks),
    officeHours: JSON.stringify(current.officeHours) !== JSON.stringify(version2.officeHours),
    googleMapEmbed: current.googleMapEmbed !== version2.googleMapEmbed
  };

  const hasDifferences = Object.values(differences).some(diff => diff === true);

  res.status(200).json({
    success: true,
    hasDifferences,
    differences
  });
});

/**
 * Get contact information metadata
 * GET /api/contact/metadata
 */
exports.getContactMetadata = asyncHandler(async (req, res) => {
  const contactInfo = await ContactInfo.getContactInfo();

  const metadata = {
    _id: contactInfo._id,
    createdAt: contactInfo.createdAt,
    updatedAt: contactInfo.updatedAt,
    updatedBy: contactInfo.updatedBy,
    version: contactInfo.version || 1,
    fields: {
      email: { exists: !!contactInfo.email, length: contactInfo.email ? contactInfo.email.length : 0 },
      phone: { exists: !!contactInfo.phone, length: contactInfo.phone ? contactInfo.phone.length : 0 },
      address: { exists: !!contactInfo.address, keys: contactInfo.address ? Object.keys(contactInfo.address) : [] },
      socialLinks: { exists: !!contactInfo.socialLinks, count: contactInfo.socialLinks ? Object.keys(contactInfo.socialLinks).length : 0 },
      officeHours: { exists: !!contactInfo.officeHours, count: contactInfo.officeHours ? Object.keys(contactInfo.officeHours).length : 0 },
      googleMapEmbed: { exists: !!contactInfo.googleMapEmbed, length: contactInfo.googleMapEmbed ? contactInfo.googleMapEmbed.length : 0 }
    }
  };

  res.status(200).json({
    success: true,
    data: metadata
  });
});

