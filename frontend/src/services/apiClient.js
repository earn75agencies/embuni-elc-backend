/**
 * Centralized API Client
 * Provides a unified axios instance with interceptors for:
 * - Automatic token injection
 * - Error handling
 * - Request/response logging
 * - Retry logic for failed requests
 */

import axios from 'axios';
import { toast } from 'react-toastify';
import { API_BASE_URL } from '../config/api';

/**
 * Create axios instance with default configuration
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // 30 seconds
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Request interceptor - Add auth token to requests
 */
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Add request timestamp for debugging
    config.metadata = { startTime: new Date() };

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response interceptor - Handle errors and logging
 */
apiClient.interceptors.response.use(
  (response) => {
    // Log request duration in development
    if (import.meta.env.DEV && response.config.metadata) {
      const duration = new Date() - response.config.metadata.startTime;
      console.debug(`API ${response.config.method?.toUpperCase()} ${response.config.url} - ${duration}ms`);
    }

    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Handle network errors
    if (!error.response) {
      const errorMessage = error.message || 'Network error. Please check your connection.';
      if (!originalRequest._retry) {
        toast.error(errorMessage);
      }
      return Promise.reject(new Error(errorMessage));
    }

    const { status, data } = error.response;

    // Handle 401 Unauthorized - Token expired or invalid
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Clear token and redirect to login
      localStorage.removeItem('token');
      
      // Only show toast if not already on login page
      if (!window.location.pathname.includes('/login')) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 1500);
      }

      return Promise.reject(error);
    }

    // Handle 403 Forbidden
    if (status === 403) {
      const message = data?.error?.message || data?.message || 'You do not have permission to perform this action.';
      if (!originalRequest._skipErrorToast) {
        toast.error(message);
      }
    }

    // Handle 404 Not Found
    if (status === 404) {
      const message = data?.error?.message || data?.message || 'Resource not found.';
      if (!originalRequest._skipErrorToast) {
        console.warn('404 Error:', message);
      }
    }

    // Handle 429 Rate Limit
    if (status === 429) {
      const message = data?.error?.message || data?.message || 'Too many requests. Please try again later.';
      toast.error(message);
    }

    // Handle 500+ Server Errors
    if (status >= 500) {
      const message = data?.error?.message || data?.message || 'Server error. Please try again later.';
      if (!originalRequest._skipErrorToast) {
        toast.error(message);
      }
    }

    // Extract error message from response
    const errorMessage = data?.error?.message || data?.message || error.message || 'An error occurred';

    return Promise.reject({
      ...error,
      message: errorMessage,
      status,
      data: data?.data || data
    });
  }
);

/**
 * Retry logic for failed requests
 * @param {Function} fn - Function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Delay between retries in ms
 * @returns {Promise}
 */
export const retryRequest = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0 && error.response?.status >= 500) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return retryRequest(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

/**
 * Helper to make requests with retry logic
 * @param {Function} requestFn - Axios request function
 * @param {Object} options - Options for retry
 * @returns {Promise}
 */
export const requestWithRetry = async (requestFn, options = {}) => {
  const { retries = 0, delay = 1000, skipErrorToast = false } = options;
  
  if (skipErrorToast) {
    requestFn._skipErrorToast = true;
  }

  if (retries > 0) {
    return retryRequest(requestFn, retries, delay);
  }

  return requestFn();
};

export default apiClient;

