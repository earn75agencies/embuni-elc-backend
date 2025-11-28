/**
 * FormValidation Component
 * Real-time form validation with animated feedback and helpful messages
 */

import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../utils/helpers';

// Validation rules
export const validationRules = {
  required: (value) => {
    if (Array.isArray(value)) return value.length > 0;
    return value !== undefined && value !== null && value.toString().trim() !== '';
  },
  
  email: (value) => {
    if (!value) return true;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },
  
  minLength: (min) => (value) => {
    if (!value) return true;
    return value.length >= min;
  },
  
  maxLength: (max) => (value) => {
    if (!value) return true;
    return value.length <= max;
  },
  
  pattern: (regex) => (value) => {
    if (!value) return true;
    return regex.test(value);
  },
  
  phone: (value) => {
    if (!value) return true;
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(value) && value.replace(/\D/g, '').length >= 10;
  },
  
  password: (value) => {
    if (!value) return true;
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(value);
  },
  
  url: (value) => {
    if (!value) return true;
    try {
      new URL(value);
      return true;
    } catch {
      return false;
    }
  }
};

// Error messages
export const errorMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  minLength: (min) => `Must be at least ${min} characters`,
  maxLength: (max) => `Must be no more than ${max} characters`,
  pattern: 'Please enter a valid format',
  phone: 'Please enter a valid phone number',
  password: 'Password must be at least 8 characters with uppercase, lowercase, and number',
  url: 'Please enter a valid URL'
};

const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  onBlur,
  rules = [],
  errorMessages: customErrorMessages = {},
  helperText,
  required = false,
  disabled = false,
  className = '',
  showSuccessIcon = true,
  validateOnChange = true,
  debounceMs = 300
}) => {
  const [error, setError] = useState('');
  const [isValid, setIsValid] = useState(null);
  const [isTouched, setIsTouched] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Debounced validation
  const debouncedValidate = useCallback(
    debounce((val) => {
      validateField(val);
    }, debounceMs),
    [rules, customErrorMessages]
  );

  const validateField = useCallback((val) => {
    if (!rules.length) {
      setError('');
      setIsValid(null);
      return true;
    }

    for (const rule of rules) {
      const { type, value: ruleValue, message } = rule;
      const validator = validationRules[type];
      
      if (validator) {
        const validationFn = typeof ruleValue === 'undefined' ? validator : validator(ruleValue);
        const isValid = validationFn(val);
        
        if (!isValid) {
          const errorMessage = message || customErrorMessages[type] || errorMessages[type];
          setError(typeof errorMessage === 'function' ? errorMessage(ruleValue) : errorMessage);
          setIsValid(false);
          return false;
        }
      }
    }

    setError('');
    setIsValid(rules.length > 0);
    return true;
  }, [rules, customErrorMessages]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange(e);
    
    if (validateOnChange && isTouched) {
      debouncedValidate(newValue);
    }
  };

  const handleBlur = (e) => {
    setIsTouched(true);
    onBlur?.(e);
    validateField(e.target.value);
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  // Simple debounce function
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  const inputClasses = cn(
    'w-full px-3 py-2 border rounded-md transition-all duration-200 focus:outline-none focus:ring-2',
    error 
      ? 'border-red-300 focus:ring-red-500 focus:border-red-500 animate-shake' 
      : isValid && showSuccessIcon
        ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
        : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
    disabled && 'bg-gray-100 cursor-not-allowed',
    isFocused && 'shadow-sm'
  );

  const labelClasses = cn(
    'block text-sm font-medium mb-1 transition-colors duration-200',
    error ? 'text-red-700' : isValid ? 'text-green-700' : 'text-gray-700'
  );

  return (
    <div className={cn('space-y-1', className)}>
      {/* Label */}
      {label && (
        <label htmlFor={name} className={labelClasses}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder={placeholder}
          disabled={disabled}
          className={inputClasses}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : helperText ? `${name}-helper` : undefined}
        />

        {/* Status Icons */}
        {isValid && showSuccessIcon && !disabled && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-scale-in">
            <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {error && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 animate-shake">
            <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
        )}
      </div>

      {/* Helper Text / Error Message */}
      {(error || helperText) && (
        <div className="min-h-[20px]">
          {error ? (
            <p id={`${name}-error`} className="text-sm text-red-600 animate-fade-in">
              {error}
            </p>
          ) : helperText ? (
            <p id={`${name}-helper`} className="text-sm text-gray-500">
              {helperText}
            </p>
          ) : null}
        </div>
      )}
    </div>
  );
};

// FormValidation component for managing entire forms
const FormValidation = ({
  children,
  onSubmit,
  initialValues = {},
  validationRules = {},
  className = ''
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitCount, setSubmitCount] = useState(0);

  const setValue = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));
  }, []);

  const setTouchedField = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors = {};
    
    Object.keys(validationRules).forEach(fieldName => {
      const fieldRules = validationRules[fieldName];
      const fieldValue = values[fieldName];
      
      for (const rule of fieldRules) {
        const { type, value: ruleValue, message } = rule;
        const validator = validationRules[type];
        
        if (validator) {
          const validationFn = typeof ruleValue === 'undefined' ? validator : validator(ruleValue);
          const isValid = validationFn(fieldValue);
          
          if (!isValid) {
            const errorMessage = message || errorMessages[type];
            newErrors[fieldName] = typeof errorMessage === 'function' ? errorMessage(ruleValue) : errorMessage;
            break;
          }
        }
      }
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, validationRules]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitCount(prev => prev + 1);
    
    const isValid = validateForm();
    
    if (isValid) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const contextValue = {
    values,
    errors,
    touched,
    setValue,
    setTouchedField,
    isSubmitting,
    submitCount
  };

  return (
    <FormValidationContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} noValidate>
        {children}
      </form>
    </FormValidationContext.Provider>
  );
};

// Context for form state
const FormValidationContext = React.createContext();

// Hook for using form context
export const useFormValidation = () => {
  const context = React.useContext(FormValidationContext);
  if (!context) {
    throw new Error('useFormValidation must be used within FormValidation');
  }
  return context;
};

// Password strength indicator
export const PasswordStrength = ({ password }) => {
  const [strength, setStrength] = useState(0);
  const [feedback, setFeedback] = useState([]);

  useEffect(() => {
    if (!password) {
      setStrength(0);
      setFeedback([]);
      return;
    }

    let score = 0;
    const newFeedback = [];

    // Length check
    if (password.length >= 8) {
      score += 1;
    } else {
      newFeedback.push('At least 8 characters');
    }

    // Uppercase check
    if (/[A-Z]/.test(password)) {
      score += 1;
    } else {
      newFeedback.push('One uppercase letter');
    }

    // Lowercase check
    if (/[a-z]/.test(password)) {
      score += 1;
    } else {
      newFeedback.push('One lowercase letter');
    }

    // Number check
    if (/\d/.test(password)) {
      score += 1;
    } else {
      newFeedback.push('One number');
    }

    // Special character check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      score += 1;
    } else {
      newFeedback.push('One special character');
    }

    setStrength(score);
    setFeedback(newFeedback);
  }, [password]);

  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-blue-500',
    'bg-green-500'
  ];

  const strengthLabels = [
    'Very Weak',
    'Weak',
    'Fair',
    'Good',
    'Strong'
  ];

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">Password Strength</span>
        <span className={cn(
          'text-sm font-medium',
          strength <= 2 ? 'text-red-600' : strength <= 3 ? 'text-yellow-600' : 'text-green-600'
        )}>
          {strengthLabels[strength] || 'Very Weak'}
        </span>
      </div>
      
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((level) => (
          <div
            key={level}
            className={cn(
              'h-2 flex-1 rounded-full transition-all duration-300',
              level <= strength ? strengthColors[strength - 1] : 'bg-gray-200'
            )}
          />
        ))}
      </div>

      {feedback.length > 0 && (
        <div className="space-y-1 animate-fade-in">
          {feedback.map((item, index) => (
            <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
              <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              {item}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export { FormField, FormValidation };
export default FormValidation;