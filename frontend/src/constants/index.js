/**
 * Application constants
 */

// User Roles
export const USER_ROLES = {
  ADMIN: 'admin',
  MODERATOR: 'moderator',
  MEMBER: 'member',
  LEADER: 'leader',
  GUEST: 'guest'
};

// Event Types
export const EVENT_TYPES = {
  WORKSHOP: 'workshop',
  SEMINAR: 'seminar',
  MEETING: 'meeting',
  SOCIAL: 'social',
  CONFERENCE: 'conference',
  TRAINING: 'training',
  WEBINAR: 'webinar'
};

// Event Status
export const EVENT_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ONGOING: 'ongoing',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

// Event Categories
export const EVENT_CATEGORIES = [
  'Leadership',
  'Professional Development',
  'Networking',
  'Community Service',
  'Education',
  'Skills Training',
  'Social Activity'
];

// Post Status
export const POST_STATUS = {
  DRAFT: 'draft',
  PUBLISHED: 'published',
  ARCHIVED: 'archived'
};

// Post Categories
export const POST_CATEGORIES = [
  'News',
  'Blog',
  'Announcement',
  'Success Story',
  'Insight',
  'Tutorial',
  'Resource'
];

// Gallery Categories
export const GALLERY_CATEGORIES = {
  EVENT: 'event',
  TEAM: 'team',
  ACTIVITY: 'activity',
  AWARD: 'award',
  OTHER: 'other'
};

// Gallery Item Status
export const GALLERY_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

// Member Badges
export const MEMBER_BADGES = {
  RECRUITER: {
    id: 'recruiter',
    name: 'Recruiter',
    description: 'Recruited 5+ members',
    icon: '🎯'
  },
  VOLUNTEER: {
    id: 'volunteer',
    name: 'Active Volunteer',
    description: 'Logged 20+ volunteer hours',
    icon: '🤝'
  },
  LEADER: {
    id: 'leader',
    name: 'Leader',
    description: 'Leadership role assigned',
    icon: '👑'
  },
  CONTRIBUTOR: {
    id: 'contributor',
    name: 'Contributor',
    description: 'Posted 10+ articles',
    icon: '✍️'
  },
  PHOTOGRAPHER: {
    id: 'photographer',
    name: 'Photographer',
    description: 'Uploaded 20+ photos',
    icon: '📸'
  },
  ATTENDEE: {
    id: 'attendee',
    name: 'Active Attendee',
    description: 'Attended 10+ events',
    icon: '🎉'
  }
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZES: [10, 20, 50, 100]
};

// Date Formats
export const DATE_FORMATS = {
  SHORT: 'MMM DD',
  FULL: 'MMM DD, YYYY',
  WITH_TIME: 'MMM DD, YYYY HH:mm',
  ISO: 'YYYY-MM-DD'
};

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  EVENTS: {
    LIST: '/events',
    UPCOMING: '/events/upcoming',
    DETAIL: '/events/:id',
    CREATE: '/events',
    UPDATE: '/events/:id',
    DELETE: '/events/:id',
    REGISTER: '/events/:id/register',
    CANCEL: '/events/:id/register',
    ATTENDANCE: '/events/:id/attended'
  },
  POSTS: {
    LIST: '/posts',
    DETAIL: '/posts/:id',
    BY_SLUG: '/posts/slug/:slug',
    CREATE: '/posts',
    UPDATE: '/posts/:id',
    DELETE: '/posts/:id',
    COMMENTS: '/posts/:id/comments',
    LIKE: '/posts/:id/like'
  },
  GALLERY: {
    LIST: '/gallery',
    DETAIL: '/gallery/:id',
    CREATE: '/gallery',
    UPDATE: '/gallery/:id',
    DELETE: '/gallery/:id',
    APPROVE: '/gallery/:id/approve',
    REJECT: '/gallery/:id/reject',
    LIKE: '/gallery/:id/like'
  },
  MEMBERS: {
    LIST: '/members',
    LEADERBOARD: '/members/leaderboard',
    STATS: '/members/stats',
    DETAIL: '/members/:id',
    UPDATE: '/members/:id',
    BADGES: '/members/:id/badge'
  },
  ANALYTICS: {
    DASHBOARD: '/analytics/dashboard-overview',
    USERS: '/analytics/users',
    EVENTS: '/analytics/events',
    POSTS: '/analytics/posts',
    ENGAGEMENT: '/analytics/engagement'
  },
  CONTACT: {
    GET: '/contact',
    UPDATE: '/contact'
  }
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  SERVER_ERROR: 'Server error. Please try again later.',
  UNAUTHORIZED: 'Unauthorized. Please login again.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  NOT_FOUND: 'Resource not found.',
  VALIDATION_ERROR: 'Please check the form for errors.',
  FILE_TOO_LARGE: 'File size is too large.',
  INVALID_FILE_TYPE: 'Invalid file type.',
  SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.'
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Logged in successfully!',
  LOGOUT_SUCCESS: 'Logged out successfully!',
  REGISTRATION_SUCCESS: 'Registration successful! Please check your email.',
  PROFILE_UPDATED: 'Profile updated successfully!',
  EVENT_CREATED: 'Event created successfully!',
  EVENT_UPDATED: 'Event updated successfully!',
  EVENT_DELETED: 'Event deleted successfully!',
  POST_CREATED: 'Post created successfully!',
  POST_UPDATED: 'Post updated successfully!',
  POST_DELETED: 'Post deleted successfully!',
  GALLERY_UPLOADED: 'Photo uploaded successfully!',
  OPERATION_SUCCESS: 'Operation completed successfully!'
};

// Form Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 6,
  PASSWORD_REGEX: /^(?=.*[A-Z])(?=.*\d)/,
  PHONE_REGEX: /^[\d\s\-+()]{10,}$/,
  URL_REGEX: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([\/\w .-]*)*\/?$/,
  SLUG_REGEX: /^[a-z0-9]+(?:-[a-z0-9]+)*$/
};

// File Upload Limits
export const FILE_LIMITS = {
  PROFILE_PICTURE: {
    max_size: 5, // MB
    allowed_types: ['image/jpeg', 'image/png', 'image/gif'],
    allowed_extensions: ['jpg', 'jpeg', 'png', 'gif']
  },
  GALLERY_IMAGE: {
    max_size: 10, // MB
    allowed_types: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    allowed_extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  },
  DOCUMENT: {
    max_size: 20, // MB
    allowed_types: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    allowed_extensions: ['pdf', 'doc', 'docx']
  }
};

// Navigation Links
export const NAV_LINKS = [
  { name: 'Home', path: '/', exact: true },
  { name: 'About', path: '/about', exact: true },
  { name: 'Programs', path: '/programs', exact: true },
  { name: 'Events', path: '/events', exact: true },
  { name: 'News', path: '/news', exact: true },
  { name: 'Gallery', path: '/gallery', exact: true },
  { name: 'Resources', path: '/resources', exact: true },
  { name: 'Contact', path: '/contact', exact: true }
];

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com',
  TWITTER: 'https://twitter.com',
  LINKEDIN: 'https://linkedin.com',
  INSTAGRAM: 'https://www.instagram.com/uoem_elc?igsh=MXAzbW42dXQ4MDJ1YQ==',
  YOUTUBE: 'https://youtube.com'
};

// Feature Flags
export const FEATURE_FLAGS = {
  ENABLE_EMAIL_NOTIFICATIONS: true,
  ENABLE_VOLUNTEER_TRACKING: true,
  ENABLE_LEADERBOARD: true,
  ENABLE_BADGES: true,
  ENABLE_ANALYTICS: true,
  ENABLE_CHAT: false, // Future feature
  ENABLE_MENTORSHIP: false, // Future feature
  ENABLE_PAYMENTS: false // Future feature
};

// Cache Duration (in milliseconds)
export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 24 * 60 * 60 * 1000 // 24 hours
};

// API Request Timeouts (in milliseconds)
export const REQUEST_TIMEOUT = 10000; // 10 seconds

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000,
  MAX_DELAY: 10000
};

// Analytics Events
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  EVENT_REGISTRATION: 'event_registration',
  POST_VIEW: 'post_view',
  COMMENT_POSTED: 'comment_posted',
  PHOTO_UPLOADED: 'photo_uploaded',
  USER_LOGIN: 'user_login',
  USER_LOGOUT: 'user_logout'
};

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#4F46E5',
  SECONDARY: '#10B981',
  DANGER: '#EF4444',
  WARNING: '#F59E0B',
  INFO: '#3B82F6',
  SUCCESS: '#10B981',
  LIGHT: '#F3F4F6',
  DARK: '#1F2937'
};

// Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
};
