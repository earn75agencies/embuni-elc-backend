/**
 * Centralized API Configuration
 * Manages all API endpoints and environment-specific URLs
 */

// Get API base URL from environment with fallbacks
const getApiBaseUrl = () => {
  // Check for deployment-specific environment variable first
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.trim();
  }
  
  // Fallback to default production URL
  return 'https://embuni-elc-backend.onrender.com';
};

// Get WebSocket URL for real-time features
const getWebSocketUrl = () => {
  const baseUrl = getApiBaseUrl();
  // Convert HTTP to WebSocket protocol
  return baseUrl.replace(/^https?:/, 'ws:') || 'wss://embuni-elc-backend.onrender.com';
};

// API endpoints configuration
export const API_ENDPOINTS = {
  // Base URL
  BASE_URL: getApiBaseUrl(),
  WS_URL: getWebSocketUrl(),
  
  // Authentication
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    PROFILE: '/auth/profile',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    ADMIN_CREATE: '/auth/admin/create-login',
    AVATAR_UPLOAD: '/auth/profile/avatar'
  },
  
  // Events
  EVENTS: {
    LIST: '/events',
    CREATE: '/events',
    UPDATE: (id) => `/events/${id}`,
    DELETE: (id) => `/events/${id}`,
    GET: (id) => `/events/${id}`,
    UPCOMING: '/events/upcoming',
    PAST: '/events/past',
    REGISTER: (id) => `/events/${id}/register`,
    ATTENDEES: (id) => `/events/${id}/attendees`
  },
  
  // Posts/Blog
  POSTS: {
    LIST: '/posts',
    CREATE: '/posts',
    UPDATE: (id) => `/posts/${id}`,
    DELETE: (id) => `/posts/${id}`,
    GET: (id) => `/posts/${id}`,
    FEATURED: '/posts/featured',
    PUBLISHED: '/posts/published',
    DRAFTS: '/posts/drafts',
    BY_CATEGORY: (category) => `/posts/category/${category}`
  },
  
  // Gallery
  GALLERY: {
    LIST: '/gallery',
    CREATE: '/gallery',
    UPDATE: (id) => `/gallery/${id}`,
    DELETE: (id) => `/gallery/${id}`,
    GET: (id) => `/gallery/${id}`,
    FEATURED: '/gallery/featured',
    BY_CATEGORY: (category) => `/gallery/category/${category}`
  },
  
  // Members/Team
  MEMBERS: {
    LIST: '/members',
    CREATE: '/members',
    UPDATE: (id) => `/members/${id}`,
    DELETE: (id) => `/members/${id}`,
    GET: (id) => `/members/${id}`,
    ACTIVE: '/members/active',
    LEADERSHIP: '/members/leadership'
  },
  
  // Admin
  ADMIN: {
    DASHBOARD: '/admin/dashboard',
    PROFILE: '/admin/profile',
    STATS: '/admin/stats',
    LOGS: '/admin/logs',
    SETTINGS: '/admin/settings',
    ADMINS: '/admin/admins',
    CREATE_ADMIN: '/admin/create',
    UPDATE_ADMIN: (id) => `/admin/${id}`,
    DELETE_ADMIN: (id) => `/admin/${id}`
  },
  
  // Elections/Voting
  ELECTIONS: {
    LIST: '/elections',
    CREATE: '/elections',
    UPDATE: (id) => `/elections/${id}`,
    DELETE: (id) => `/elections/${id}`,
    GET: (id) => `/elections/${id}`,
    APPROVE: (id) => `/elections/${id}/approve`,
    START: (id) => `/elections/${id}/start`,
    CLOSE: (id) => `/elections/${id}/close`,
    RESULTS: (id) => `/elections/${id}/results`,
    EXPORT: (id) => `/elections/${id}/export`
  },
  
  // Voting
  VOTE: {
    VALIDATE_LINK: '/vote/validate-link',
    SUBMIT: '/vote/submit',
    RESULTS: (electionId) => `/vote/results/${electionId}`,
    LIVE_RESULTS: (electionId) => `/vote/live/${electionId}`
  },
  
  // Voting Links
  VOTING_LINKS: {
    GENERATE: '/voting-links/generate',
    LIST: '/voting-links',
    DELETE: (id) => `/voting-links/${id}`,
    SEND_EMAIL: (id) => `/voting-links/${id}/send-email`
  },
  
  // Candidates
  CANDIDATES: {
    LIST: '/candidates',
    CREATE: '/candidates',
    UPDATE: (id) => `/candidates/${id}`,
    DELETE: (id) => `/candidates/${id}`,
    GET: (id) => `/candidates/${id}`,
    BY_ELECTION: (electionId) => `/candidates/election/${electionId}`
  },
  
  // Positions
  POSITIONS: {
    LIST: '/positions',
    CREATE: '/positions',
    UPDATE: (id) => `/positions/${id}`,
    DELETE: (id) => `/positions/${id}`,
    GET: (id) => `/positions/${id}`
  },
  
  // Contact
  CONTACT: {
    GET: '/contact',
    UPDATE: '/contact',
    SUBMIT_MESSAGE: '/contact/message',
    MESSAGES: '/contact/messages'
  },
  
  // reCAPTCHA
  RECAPTCHA: {
    CONFIG: '/recaptcha/config',
    VERIFY: '/recaptcha/verify'
  },
  
  // Courses/Learning
  COURSES: {
    LIST: '/courses',
    CREATE: '/courses',
    UPDATE: (id) => `/courses/${id}`,
    DELETE: (id) => `/courses/${id}`,
    GET: (id) => `/courses/${id}`,
    ENROLL: '/courses/enroll',
    ENROLLMENTS: '/courses/enrollments/my',
    ENROLLMENT_DETAIL: (id) => `/courses/enrollments/${id}`,
    PROGRESS_UPDATE: '/courses/progress',
    PROGRESS_GET: (courseId) => `/courses/${courseId}/progress`,
    ASSESSMENT_SUBMIT: '/courses/assessments/submit',
    ANALYTICS: (courseId) => `/courses/${courseId}/analytics`
  },
  
  // Mentorship
  MENTORSHIP: {
    MENTORS: '/mentorship/mentors',
    MENTORSHIP_REQUESTS: '/mentorship/requests',
    CREATE_REQUEST: '/mentorship/requests',
    UPDATE_REQUEST: (id) => `/mentorship/requests/${id}`,
    SESSIONS: '/mentorship/sessions',
    CREATE_SESSION: '/mentorship/sessions',
    UPDATE_SESSION: (id) => `/mentorship/sessions/${id}`,
    FEEDBACK: '/mentorship/feedback',
    STATS: '/mentorship/stats'
  },
  
  // Internships
  INTERNSHIPS: {
    LIST: '/internships',
    CREATE: '/internships',
    UPDATE: (id) => `/internships/${id}`,
    DELETE: (id) => `/internships/${id}`,
    GET: (id) => `/internships/${id}`,
    APPLICATIONS: '/internships/applications',
    APPLY: '/internships/apply',
    MY_APPLICATIONS: '/internships/my-applications'
  },
  
  // Alumni
  ALUMNI: {
    LIST: '/alumni',
    CREATE: '/alumni',
    UPDATE: (id) => `/alumni/${id}`,
    DELETE: (id) => `/alumni/${id}`,
    GET: (id) => `/alumni/${id}`,
    PROFILE: '/alumni/profile',
    SUCCESS_STORIES: '/alumni/success-stories',
    NETWORK: '/alumni/network'
  },
  
  // Testimonials
  TESTIMONIALS: {
    LIST: '/testimonials',
    CREATE: '/testimonials',
    UPDATE: (id) => `/testimonials/${id}`,
    DELETE: (id) => `/testimonials/${id}`,
    GET: (id) => `/testimonials/${id}`,
    FEATURED: '/testimonials/featured',
    APPROVE: (id) => `/testimonials/${id}/approve`
  },
  
  // Partners
  PARTNERS: {
    LIST: '/partners',
    CREATE: '/partners',
    UPDATE: (id) => `/partners/${id}`,
    DELETE: (id) => `/partners/${id}`,
    GET: (id) => `/partners/${id}`,
    FEATURED: '/partners/featured'
  },
  
  // Design Settings
  DESIGN_SETTINGS: {
    GET: '/design-settings',
    UPDATE: '/design-settings',
    HERO: '/design-settings/hero',
    COLORS: '/design-settings/colors',
    FONTS: '/design-settings/fonts',
    LAYOUT: '/design-settings/layout'
  },
  
  // Contact Messages
  CONTACT_MESSAGES: {
    LIST: '/contact-messages',
    CREATE: '/contact-messages',
    UPDATE: (id) => `/contact-messages/${id}`,
    DELETE: (id) => `/contact-messages/${id}`,
    GET: (id) => `/contact-messages/${id}`,
    MARK_READ: (id) => `/contact-messages/${id}/mark-read`
  },
  
  // Health Check
  HEALTH: '/health'
};

// Helper function to build full URLs
export const buildUrl = (endpoint, params = {}) => {
  const baseUrl = `${API_ENDPOINTS.BASE_URL}/api${endpoint}`;
  
  if (Object.keys(params).length === 0) {
    return baseUrl;
  }
  
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, value);
    }
  });
  
  return `${baseUrl}?${searchParams.toString()}`;
};

// WebSocket connection helper
export const buildWebSocketUrl = (namespace = '') => {
  const wsUrl = API_ENDPOINTS.WS_URL;
  return namespace ? `${wsUrl}/${namespace}` : wsUrl;
};

// Export base URL for backward compatibility
export const API_BASE_URL = `${API_ENDPOINTS.BASE_URL}/api`;

export default {
  API_ENDPOINTS,
  buildUrl,
  buildWebSocketUrl,
  API_BASE_URL
};
