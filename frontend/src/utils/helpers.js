/**
 * Common utility functions used across the application
 */

import { format, formatDistanceToNow } from 'date-fns';
import { enUS, fr } from 'date-fns/locale';
import { utcToZonedTime } from 'date-fns-tz';
import { getStoredTimezone } from './timezone';

// Arabic locale - using English as fallback since date-fns Arabic locale
// may not be available in all versions. The RTL layout will still work correctly.
// For production, consider installing: npm install date-fns-locale-ar
const arLocale = enUS;

// Locale mapping for date-fns
// Using available locales with fallback to English
const dateLocales = {
  en: enUS,
  sw: enUS, // Swahili locale not available in date-fns, using English
  fr: fr,
  ar: arLocale
};

// Get current locale from i18n or default to English
const getCurrentLocale = () => {
  try {
    const storedLang = localStorage.getItem('i18nextLng') || 'en';
    const lang = storedLang.split('-')[0]; // Handle 'en-US' format
    return dateLocales[lang] || dateLocales.en;
  } catch {
    return dateLocales.en;
  }
};

// Format date to readable string with locale support
export const formatDate = (date, formatStr = 'MMM dd, yyyy', locale = null) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    const selectedLocale = locale || getCurrentLocale();
    return format(dateObj, formatStr, { locale: selectedLocale });
  } catch (error) {
    console.error('Date formatting error:', error);
    return new Date(date).toLocaleDateString();
  }
};

// Format date and time with locale support
export const formatDateTime = (date, locale = null) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    const selectedLocale = locale || getCurrentLocale();
    return format(dateObj, 'PPp', { locale: selectedLocale });
  } catch (error) {
    console.error('DateTime formatting error:', error);
    return new Date(date).toLocaleString();
  }
};

// Format date with timezone support
export const formatDateWithTimezone = (date, timezone = null, formatStr = 'PPp', locale = null) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    const userTimezone = timezone || getStoredTimezone();
    const zonedDate = utcToZonedTime(dateObj, userTimezone);
    const selectedLocale = locale || getCurrentLocale();
    return format(zonedDate, formatStr, { locale: selectedLocale });
  } catch (error) {
    console.error('Timezone date formatting error:', error);
    return formatDateTime(date, locale);
  }
};

// Format relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date, locale = null) => {
  if (!date) return '';
  
  try {
    const dateObj = new Date(date);
    const selectedLocale = locale || getCurrentLocale();
    return formatDistanceToNow(dateObj, { addSuffix: true, locale: selectedLocale });
  } catch (error) {
    console.error('Relative time formatting error:', error);
    return '';
  }
};

// Format time remaining with i18n support
export const formatTimeRemaining = (date, t = null) => {
  if (!date) return '';
  
  const now = new Date();
  const event = new Date(date);
  const diff = event - now;
  
  if (diff <= 0) {
    return t ? t('events.started', 'Event started') : 'Event started';
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) {
    return t 
      ? t('events.timeRemaining.days', { count: days, defaultValue: '{{count}}d {{hours}}h' }, { hours })
      : `${days}d ${hours}h`;
  }
  if (hours > 0) {
    return t
      ? t('events.timeRemaining.hours', { count: hours, defaultValue: '{{count}}h' })
      : `${hours}h`;
  }
  return t
    ? t('events.timeRemaining.minutes', { count: minutes, defaultValue: '{{count}}m' })
    : `${minutes}m`;
};

// Truncate text
export const truncateText = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Capitalize first letter
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Capitalize all words
export const capitalizeWords = (str) => {
  if (!str) return '';
  return str
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

// Generate slug from text
export const generateSlug = (text) => {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]/g, '-')
    .replace(/-+/g, '-');
};

// Parse slug to text
export const parseSlug = (slug) => {
  return slug.split('-').join(' ');
};

// Validate email
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Validate password strength
export const validatePasswordStrength = (password) => {
  const strength = {
    score: 0,
    feedback: []
  };

  if (!password) return { score: 0, feedback: ['Password is required'] };

  if (password.length >= 8) strength.score++;
  else strength.feedback.push('Password should be at least 8 characters');

  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength.score++;
  else strength.feedback.push('Password should contain uppercase and lowercase letters');

  if (/\d/.test(password)) strength.score++;
  else strength.feedback.push('Password should contain numbers');

  if (/[!@#$%^&*]/.test(password)) strength.score++;
  else strength.feedback.push('Password should contain special characters');

  return strength;
};

// Format file size
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
};

// Check file type
export const isValidImageFile = (file) => {
  const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  return validTypes.includes(file.type);
};

// Validate file size (max size in MB)
export const isValidFileSize = (file, maxSizeMB = 5) => {
  return file.size <= maxSizeMB * 1024 * 1024;
};

// Get file extension
export const getFileExtension = (filename) => {
  return filename.split('.').pop().toLowerCase();
};

// Number formatting with locale support
export const formatNumber = (num, locale = null) => {
  try {
    const currentLocale = locale || localStorage.getItem('i18nextLng') || 'en';
    const lang = currentLocale.split('-')[0];
    return new Intl.NumberFormat(lang === 'ar' ? 'ar-SA' : lang === 'sw' ? 'sw-KE' : lang === 'fr' ? 'fr-FR' : 'en-US').format(num);
  } catch (error) {
    return new Intl.NumberFormat('en-US').format(num);
  }
};

// Format currency with locale support
export const formatCurrency = (amount, currency = 'USD', locale = null) => {
  try {
    const currentLocale = locale || localStorage.getItem('i18nextLng') || 'en';
    const lang = currentLocale.split('-')[0];
    return new Intl.NumberFormat(
      lang === 'ar' ? 'ar-SA' : lang === 'sw' ? 'sw-KE' : lang === 'fr' ? 'fr-FR' : 'en-US',
      {
        style: 'currency',
        currency: currency
      }
    ).format(amount);
  } catch (error) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  }
};

// Abbreviate large numbers
export const abbreviateNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num;
};

// Extract initials from name
export const getInitials = (name) => {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
};

// Get random color
export const getRandomColor = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Get avatar color based on name
export const getAvatarColor = (name) => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A',
    '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E2'
  ];
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Merge objects
export const mergeObjects = (obj1, obj2) => {
  return { ...obj1, ...obj2 };
};

// Get nested object value
export const getNestedValue = (obj, path, defaultValue = null) => {
  const keys = path.split('.');
  let value = obj;
  
  for (let key of keys) {
    if (value && typeof value === 'object' && key in value) {
      value = value[key];
    } else {
      return defaultValue;
    }
  }
  
  return value;
};

// Debounce function
export const debounce = (func, delay) => {
  let timeoutId;
  return function (...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Throttle function
export const throttle = (func, limit) => {
  let inThrottle;
  return function (...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

// Wait/sleep
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Retry function
export const retry = async (fn, maxRetries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (maxRetries <= 0) throw error;
    await sleep(delay);
    return retry(fn, maxRetries - 1, delay * 2);
  }
};

// Check if online
export const isOnline = () => {
  return navigator.onLine;
};

// Get browser info
export const getBrowserInfo = () => {
  const ua = navigator.userAgent;
  let browser = 'Unknown';
  
  if (ua.indexOf('Chrome') > -1) browser = 'Chrome';
  else if (ua.indexOf('Safari') > -1) browser = 'Safari';
  else if (ua.indexOf('Firefox') > -1) browser = 'Firefox';
  else if (ua.indexOf('Edge') > -1) browser = 'Edge';
  
  return browser;
};

// Local storage helpers
export const storage = {
  set: (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Storage error:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Storage error:', error);
    }
  },

  clear: () => {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage error:', error);
    }
  }
};

// Session storage helpers
export const sessionStorage_ = {
  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('Session storage error:', error);
    }
  },

  get: (key, defaultValue = null) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Session storage error:', error);
      return defaultValue;
    }
  },

  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error('Session storage error:', error);
    }
  }
};
