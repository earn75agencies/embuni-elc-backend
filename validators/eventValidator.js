const validator = require('validator');

const eventValidator = {
  /**
   * Validate event creation
   * @param {Object} data - Event data
   * @param {boolean} isAdmin - Whether user is admin (lenient validation)
   */
  validateCreate: (data, isAdmin = false) => {
    const errors = {};

    // Title validation - required for everyone, but lenient for admins
    if (!data.title || !data.title.trim()) {
      if (isAdmin) {
        data.title = data.title || 'Admin Event';
      } else {
        errors.title = 'Event title is required';
      }
    } else if (!isAdmin && data.title.length < 5) {
      errors.title = 'Event title must be at least 5 characters';
    } else if (!isAdmin && data.title.length > 200) {
      errors.title = 'Event title cannot exceed 200 characters';
    }

    // Description validation - lenient for admins
    if (!data.description || !data.description.trim()) {
      if (isAdmin) {
        data.description = data.description || 'Event organized by admin';
      } else {
        errors.description = 'Event description is required';
      }
    } else if (!isAdmin && data.description.length < 10) {
      errors.description = 'Event description must be at least 10 characters';
    } else if (!isAdmin && data.description.length > 2000) {
      errors.description = 'Event description cannot exceed 2000 characters';
    }

    // Event type validation - allow any for admins
    const validEventTypes = ['workshop', 'seminar', 'community-service', 'networking', 'training', 'conference', 'social', 'other'];
    if (!data.eventType || !validEventTypes.includes(data.eventType)) {
      if (isAdmin) {
        data.eventType = data.eventType || 'other';
      } else {
        errors.eventType = 'Please select a valid event type';
      }
    }

    // Category validation - allow any for admins
    const validCategories = ['leadership', 'mentorship', 'service', 'networking', 'skills', 'social'];
    if (!data.category || !validCategories.includes(data.category)) {
      if (isAdmin) {
        data.category = data.category || 'social';
      } else {
        errors.category = 'Please select a valid category';
      }
    }

    // Date validation - allow past dates for admins
    if (!data.startDate) {
      errors.startDate = 'Start date is required';
    } else if (!isAdmin) {
      const startDate = new Date(data.startDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (startDate < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }

    // End date validation - lenient for admins
    if (data.endDate && data.endDate.trim()) {
      if (data.startDate && new Date(data.endDate) < new Date(data.startDate)) {
        if (isAdmin) {
          // For admins, set endDate to startDate if invalid
          data.endDate = data.startDate;
        } else {
          errors.endDate = 'End date must be after start date';
        }
      }
    }

    // Time validation - set defaults for admins
    if (!data.startTime) {
      if (isAdmin) {
        data.startTime = data.startTime || '09:00';
      } else {
        errors.startTime = 'Start time is required';
      }
    }

    if (!data.endTime) {
      if (isAdmin) {
        data.endTime = data.endTime || '17:00';
      } else {
        errors.endTime = 'End time is required';
      }
    }

    // Location validation - lenient for admins
    if (!data.location || !data.location.venue || !data.location.venue.trim()) {
      if (isAdmin) {
        data.location = data.location || {};
        data.location.venue = data.location.venue || 'TBA';
      } else {
        errors['location.venue'] = 'Event venue is required';
      }
    }

    if (data.location && data.location.isVirtual && (!data.location.virtualLink || !data.location.virtualLink.trim())) {
      if (isAdmin) {
        data.location.virtualLink = data.location.virtualLink || 'TBA';
      } else {
        errors['location.virtualLink'] = 'Virtual meeting link is required for virtual events';
      }
    }

    // Max attendees validation - set default for admins
    if (data.maxAttendees && data.maxAttendees < 1) {
      if (isAdmin) {
        data.maxAttendees = data.maxAttendees || 100;
      } else {
        errors.maxAttendees = 'Max attendees must be at least 1';
      }
    } else if (!data.maxAttendees && isAdmin) {
      data.maxAttendees = 100; // Default for admins
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate event update
   * @param {Object} data - Event data
   * @param {boolean} isAdmin - Whether user is admin (lenient validation)
   */
  validateUpdate: (data, isAdmin = false) => {
    // Similar to create validation but with optional fields
    const errors = {};

    if (data.title) {
      if (!isAdmin && data.title.length < 5) {
        errors.title = 'Event title must be at least 5 characters';
      } else if (!isAdmin && data.title.length > 200) {
        errors.title = 'Event title cannot exceed 200 characters';
      }
    }

    if (data.description && !isAdmin) {
      if (data.description.length < 10) {
        errors.description = 'Event description must be at least 10 characters';
      } else if (data.description.length > 2000) {
        errors.description = 'Event description cannot exceed 2000 characters';
      }
    }

    if (data.eventType) {
      const validEventTypes = ['workshop', 'seminar', 'community-service', 'networking', 'training', 'conference', 'social', 'other'];
      if (!validEventTypes.includes(data.eventType)) {
        if (isAdmin) {
          data.eventType = 'other';
        } else {
          errors.eventType = 'Please select a valid event type';
        }
      }
    }

    if (data.category) {
      const validCategories = ['leadership', 'mentorship', 'service', 'networking', 'skills', 'social'];
      if (!validCategories.includes(data.category)) {
        if (isAdmin) {
          data.category = 'social';
        } else {
          errors.category = 'Please select a valid category';
        }
      }
    }

    if (data.startDate && !isAdmin && new Date(data.startDate) < new Date()) {
      errors.startDate = 'Start date cannot be in the past';
    }

    if (data.startDate && data.endDate && new Date(data.endDate) < new Date(data.startDate)) {
      if (isAdmin) {
        data.endDate = data.startDate;
      } else {
        errors.endDate = 'End date must be after start date';
      }
    }

    if (data.maxAttendees && data.maxAttendees < 1) {
      if (isAdmin) {
        data.maxAttendees = 100;
      } else {
        errors.maxAttendees = 'Max attendees must be at least 1';
      }
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
};

module.exports = eventValidator;
