const validator = require('validator');

// Email validation regex
const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

// Password validation regex - at least 6 chars, 1 uppercase, 1 number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,}$/;

const authValidator = {
  /**
   * Validate registration data
   */
  validateRegister: (data) => {
    const errors = {};

    // First name validation
    if (!data.firstName || !data.firstName.trim()) {
      errors.firstName = 'First name is required';
    } else if (data.firstName.length < 2) {
      errors.firstName = 'First name must be at least 2 characters';
    } else if (data.firstName.length > 50) {
      errors.firstName = 'First name cannot exceed 50 characters';
    }

    // Last name validation
    if (!data.lastName || !data.lastName.trim()) {
      errors.lastName = 'Last name is required';
    } else if (data.lastName.length < 2) {
      errors.lastName = 'Last name must be at least 2 characters';
    } else if (data.lastName.length > 50) {
      errors.lastName = 'Last name cannot exceed 50 characters';
    }

    // Email validation
    if (!data.email || !data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validator.isEmail(data.email)) {
      errors.email = 'Please provide a valid email address';
    }

    // Password validation
    if (!data.password) {
      errors.password = 'Password is required';
    } else if (data.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    } else if (data.password.length > 128) {
      errors.password = 'Password cannot exceed 128 characters';
    }

    // Confirm password
    if (!data.confirmPassword || (typeof data.confirmPassword === 'string' && data.confirmPassword.trim() === '')) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    // Student ID validation (if provided)
    if (data.studentId && data.studentId.trim()) {
      // University registration number format: UOEM/YYYY/XXXXX or UOE/YY/XXX
      // Examples: UOEM/2021/12345, UOE/21/123
      const regNumberRegex = /^(UOE|UOEM)\/(\d{2}|\d{4})\/\d{3,6}$/;
      if (!regNumberRegex.test(data.studentId.trim())) {
        errors.studentId = 'Student ID must be in format: UOEM/YYYY/XXXXX (e.g., UOEM/2021/12345)';
      }
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate login data
   */
  validateLogin: (data) => {
    const errors = {};

    if (!data.email || !data.email.trim()) {
      errors.email = 'Email is required';
    } else if (!validator.isEmail(data.email)) {
      errors.email = 'Please provide a valid email address';
    }

    if (!data.password) {
      errors.password = 'Password is required';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate profile update
   */
  validateProfileUpdate: (data) => {
    const errors = {};

    if (data.firstName) {
      if (data.firstName.length < 2) {
        errors.firstName = 'First name must be at least 2 characters';
      } else if (data.firstName.length > 50) {
        errors.firstName = 'First name cannot exceed 50 characters';
      }
    }

    if (data.lastName) {
      if (data.lastName.length < 2) {
        errors.lastName = 'Last name must be at least 2 characters';
      } else if (data.lastName.length > 50) {
        errors.lastName = 'Last name cannot exceed 50 characters';
      }
    }

    if (data.phone) {
      if (!validator.isMobilePhone(data.phone, 'any', { strictMode: false })) {
        errors.phone = 'Please provide a valid phone number';
      }
    }

    // Student ID validation (if provided)
    if (data.studentId && data.studentId.trim()) {
      const regNumberRegex = /^(UOE|UOEM)\/(\d{2}|\d{4})\/\d{3,6}$/;
      if (!regNumberRegex.test(data.studentId.trim())) {
        errors.studentId = 'Student ID must be in format: UOEM/YYYY/XXXXX (e.g., UOEM/2021/12345)';
      }
    }

    if (data.bio && data.bio.length > 500) {
      errors.bio = 'Bio cannot exceed 500 characters';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  },

  /**
   * Validate password change
   */
  validatePasswordChange: (data) => {
    const errors = {};

    if (!data.currentPassword) {
      errors.currentPassword = 'Current password is required';
    }

    if (!data.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (data.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters';
    }

    if (data.newPassword !== data.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    return Object.keys(errors).length === 0 ? null : errors;
  }
};

module.exports = authValidator;
