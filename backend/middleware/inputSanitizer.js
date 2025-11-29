/**
 * Input Sanitization Middleware
 * Provides comprehensive input sanitization and validation
 */

const DOMPurify = require('isomorphic-dompurify');
const validator = require('validator');
const he = require('he');

/**
 * Sanitize HTML content - removes dangerous tags and attributes
 */
const sanitizeHTML = (html) => {
  if (!html || typeof html !== 'string') {
    return '';
  }

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'p', 'br', 'strong', 'em', 'u', 'i', 'b',
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
      'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'alt', 'src', 'class', 'id'
    ],
    ALLOW_DATA_ATTR: false
  });
};

/**
 * Sanitize plain text - removes HTML and normalizes whitespace
 */
const sanitizeText = (text) => {
  if (!text || typeof text !== 'string') {
    return '';
  }

  // Decode HTML entities
  let sanitized = he.decode(text);

  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');

  // Normalize whitespace
  sanitized = sanitized.replace(/\s+/g, ' ').trim();

  return sanitized;
};

/**
 * Sanitize email address
 */
const sanitizeEmail = (email) => {
  if (!email || typeof email !== 'string') {
    return '';
  }

  return validator.normalizeEmail(email.toLowerCase().trim(), {
    remove_dots: false,
    remove_extension: false,
    gmail_remove_subaddress: false
  });
};

/**
 * Sanitize URL
 */
const sanitizeURL = (url) => {
  if (!url || typeof url !== 'string') {
    return '';
  }

  const trimmed = url.trim();

  // Add protocol if missing
  if (trimmed && !/^https?:\/\//.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return validator.isURL(trimmed) ? trimmed : '';
};

/**
 * Sanitize phone number
 */
const sanitizePhone = (phone) => {
  if (!phone || typeof phone !== 'string') {
    return '';
  }

  // Remove all non-digit characters except +, -, (, )
  return phone.replace(/[^\d+\-()\s]/g, '').trim();
};

/**
 * Sanitize numeric input
 */
const sanitizeNumber = (value, min = null, max = null, defaultValue = null) => {
  const num = parseInt(value, 10);

  if (isNaN(num)) {
    return defaultValue;
  }

  if (min !== null && num < min) {
    return min;
  }

  if (max !== null && num > max) {
    return max;
  }

  return num;
};

/**
 * Sanitize boolean input
 */
const sanitizeBoolean = (value, defaultValue = false) => {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'string') {
    const lower = value.toLowerCase().trim();
    return lower === 'true' || lower === '1' || lower === 'yes';
  }

  if (typeof value === 'number') {
    return value === 1;
  }

  return defaultValue;
};

/**
 * Sanitize array input
 */
const sanitizeArray = (value, sanitizer = null) => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value
    .filter(item => item !== null && item !== undefined)
    .map(item => sanitizer ? sanitizer(item) : item)
    .filter(item => item !== null && item !== undefined && item !== '');
};

/**
 * Sanitize object input recursively
 */
const sanitizeObject = (obj, schema = {}) => {
  if (!obj || typeof obj !== 'object') {
    return {};
  }

  const sanitized = {};

  for (const [key, value] of Object.entries(obj)) {
    if (schema[key]) {
      sanitized[key] = schema[key](value);
    } else {
      // Default sanitization
      if (typeof value === 'string') {
        sanitized[key] = sanitizeText(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = sanitizeArray(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
  }

  return sanitized;
};

/**
 * Middleware to sanitize request body
 */
const sanitizeBody = (schema = {}) => {
  return (req, res, next) => {
    try {
      if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body, schema);
      }

      if (req.query && typeof req.query === 'object') {
        req.query = sanitizeObject(req.query);
      }

      if (req.params && typeof req.params === 'object') {
        req.params = sanitizeObject(req.params);
      }

      next();
    } catch (error) {
      console.error('Sanitization error:', error);
      res.status(400).json({
        success: false,
        message: 'Invalid input data'
      });
    }
  };
};

/**
 * Common sanitization schemas
 */
const schemas = {
  // User registration/login schema
  auth: {
    email: sanitizeEmail,
    password: (value) => typeof value === 'string' ? value.trim() : '',
    confirmPassword: (value) => typeof value === 'string' ? value.trim() : '',
    firstName: sanitizeText,
    lastName: sanitizeText,
    phone: sanitizePhone,
    studentId: sanitizeText,
    course: sanitizeText,
    yearOfStudy: (value) => sanitizeNumber(value, 1, 6, null)
  },

  // Post/Content schema
  content: {
    title: sanitizeText,
    content: sanitizeHTML,
    excerpt: sanitizeText,
    tags: (value) => sanitizeArray(value, sanitizeText)
  },

  // Contact form schema
  contact: {
    name: sanitizeText,
    email: sanitizeEmail,
    phone: sanitizePhone,
    subject: sanitizeText,
    message: sanitizeHTML,
    category: (value) => ['general', 'membership', 'partnership', 'technical', 'feedback', 'other'].includes(value) ? value : 'general'
  },

  // Partner schema
  partner: {
    name: sanitizeText,
    description: sanitizeText,
    website: sanitizeURL,
    contactEmail: sanitizeEmail,
    contactPhone: sanitizePhone,
    type: (value) => ['sponsor', 'partner', 'collaborator'].includes(value) ? value : 'partner',
    status: (value) => ['active', 'inactive', 'pending'].includes(value) ? value : 'pending',
    featured: sanitizeBoolean,
    order: (value) => sanitizeNumber(value, 0, 9999, 0)
  },

  // Testimonial schema
  testimonial: {
    authorName: sanitizeText,
    authorTitle: sanitizeText,
    authorOrganization: sanitizeText,
    content: sanitizeHTML,
    rating: (value) => sanitizeNumber(value, 1, 5, 5),
    authorRole: (value) => ['student', 'alumni', 'partner', 'faculty'].includes(value) ? value : 'student',
    status: (value) => ['pending', 'approved', 'rejected'].includes(value) ? value : 'pending',
    featured: sanitizeBoolean,
    order: (value) => sanitizeNumber(value, 0, 9999, 0)
  }
};

module.exports = {
  sanitizeHTML,
  sanitizeText,
  sanitizeEmail,
  sanitizeURL,
  sanitizePhone,
  sanitizeNumber,
  sanitizeBoolean,
  sanitizeArray,
  sanitizeObject,
  sanitizeBody,
  schemas
};
