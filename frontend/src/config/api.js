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
