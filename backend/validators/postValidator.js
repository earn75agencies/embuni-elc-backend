const postValidator = {
  /**
   * Validate post creation
   * @param {Object} data - Post data
   * @param {boolean} isAdmin - Whether user is admin (lenient validation)
   */
  validateCreate: (data, isAdmin = false) => {
    const errors = {};

    // Title validation - required for everyone, but lenient for admins
    if (!data.title || !data.title.trim()) {
      if (isAdmin) {
        data.title = data.title || 'Admin Post';
      } else {
        errors.title = 'Post title is required';
      }
    } else if (!isAdmin && data.title.length < 5) {
      errors.title = 'Post title must be at least 5 characters';
    } else if (!isAdmin && data.title.length > 200) {
      errors.title = 'Post title cannot exceed 200 characters';
    }

    // Excerpt validation - lenient for admins
    if (!isAdmin) {
      if (!data.excerpt || !data.excerpt.trim()) {
        errors.excerpt = 'Post excerpt is required';
      } else if (data.excerpt.length < 10) {
        errors.excerpt = 'Post excerpt must be at least 10 characters';
      } else if (data.excerpt.length > 300) {
        errors.excerpt = 'Post excerpt cannot exceed 300 characters';
      }
    } else {
      // For admins, generate excerpt from content if missing
      if (!data.excerpt || !data.excerpt.trim()) {
        if (data.content) {
          data.excerpt = data.content.substring(0, 150) + '...';
        } else {
          data.excerpt = 'Admin post';
        }
      }
    }

    // Content validation - lenient for admins
    if (!data.content || !data.content.trim()) {
      if (isAdmin) {
        data.content = data.content || data.description || 'Content created by admin';
      } else {
        errors.content = 'Post content is required';
      }
    } else if (!isAdmin && data.content.length < 50) {
      errors.content = 'Post content must be at least 50 characters';
    }

    // Category validation - allow any category for admins
    if (!isAdmin) {
      const validCategories = ['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'];
      if (!data.category || !validCategories.includes(data.category)) {
        errors.category = 'Please select a valid category';
      }
    } else {
      // Admins can use any category, default to 'update' if invalid
      const validCategories = ['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'];
      if (!data.category || !validCategories.includes(data.category)) {
        data.category = data.category || 'update';
      }
    }

    // Featured image validation - optional for admins
    if (!isAdmin && !data.featuredImage) {
      errors.featuredImage = 'Featured image is required';
    } else if (isAdmin && !data.featuredImage) {
      // Set default placeholder for admins
      data.featuredImage = data.featuredImage || '/images/default-post.jpg';
    }

    // Status validation - allow any status for admins
    if (data.status) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(data.status)) {
        if (isAdmin) {
          data.status = 'published'; // Default to published for admins
        } else {
          errors.status = 'Please select a valid status';
        }
      }
    } else if (isAdmin) {
      data.status = 'published'; // Default to published for admins
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate post update
   * @param {Object} data - Post data
   * @param {boolean} isAdmin - Whether user is admin (lenient validation)
   */
  validateUpdate: (data, isAdmin = false) => {
    const errors = {};

    if (data.title) {
      if (!isAdmin && data.title.length < 5) {
        errors.title = 'Post title must be at least 5 characters';
      } else if (!isAdmin && data.title.length > 200) {
        errors.title = 'Post title cannot exceed 200 characters';
      }
    }

    if (data.excerpt && !isAdmin) {
      if (data.excerpt.length < 10) {
        errors.excerpt = 'Post excerpt must be at least 10 characters';
      } else if (data.excerpt.length > 300) {
        errors.excerpt = 'Post excerpt cannot exceed 300 characters';
      }
    }

    if (data.content && !isAdmin && data.content.length < 50) {
      errors.content = 'Post content must be at least 50 characters';
    }

    if (data.category && !isAdmin) {
      const validCategories = ['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'];
      if (!validCategories.includes(data.category)) {
        errors.category = 'Please select a valid category';
      }
    } else if (data.category && isAdmin) {
      // Allow any category for admins, default if invalid
      const validCategories = ['news', 'announcement', 'achievement', 'event-recap', 'blog', 'update'];
      if (!validCategories.includes(data.category)) {
        data.category = 'update';
      }
    }

    if (data.status) {
      const validStatuses = ['draft', 'published', 'archived'];
      if (!validStatuses.includes(data.status)) {
        if (isAdmin) {
          data.status = 'published';
        } else {
          errors.status = 'Please select a valid status';
        }
      }
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate comment
   */
  validateComment: (data) => {
    const errors = {};

    if (!data.content || !data.content.trim()) {
      errors.content = 'Comment content is required';
    } else if (data.content.length < 2) {
      errors.content = 'Comment must be at least 2 characters';
    } else if (data.content.length > 500) {
      errors.content = 'Comment cannot exceed 500 characters';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
};

module.exports = postValidator;
