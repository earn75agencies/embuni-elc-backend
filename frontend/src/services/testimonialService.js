/**
 * Testimonial Service
 * Handles testimonial management operations
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const testimonialService = {
  /**
   * Get all testimonials with optional filtering
   */
  async getTestimonials(token, params = {}) {
    try {
      const response = await api.get('/testimonials', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      throw error;
    }
  },

  /**
   * Get testimonial by ID
   */
  async getTestimonialById(token, testimonialId) {
    try {
      const response = await api.get(`/testimonials/${testimonialId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching testimonial:', error);
      throw error;
    }
  },

  /**
   * Create new testimonial
   */
  async createTestimonial(token, testimonialData) {
    try {
      const response = await api.post('/testimonials', testimonialData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating testimonial:', error);
      throw error;
    }
  },

  /**
   * Update testimonial
   */
  async updateTestimonial(token, testimonialId, testimonialData) {
    try {
      const response = await api.put(`/testimonials/${testimonialId}`, testimonialData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating testimonial:', error);
      throw error;
    }
  },

  /**
   * Delete testimonial
   */
  async deleteTestimonial(token, testimonialId) {
    try {
      const response = await api.delete(`/testimonials/${testimonialId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      throw error;
    }
  },

  /**
   * Approve testimonial
   */
  async approveTestimonial(token, testimonialId, reviewNotes = '') {
    try {
      const response = await api.put(`/testimonials/${testimonialId}/approve`, 
        { reviewNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error approving testimonial:', error);
      throw error;
    }
  },

  /**
   * Reject testimonial
   */
  async rejectTestimonial(token, testimonialId, reviewNotes = '') {
    try {
      const response = await api.put(`/testimonials/${testimonialId}/reject`, 
        { reviewNotes },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
      throw error;
    }
  },

  /**
   * Update testimonial order
   */
  async updateTestimonialOrder(token, testimonials) {
    try {
      const response = await api.put('/testimonials/order', { testimonials }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating testimonial order:', error);
      throw error;
    }
  },

  /**
   * Get public testimonials (for frontend display)
   */
  async getPublicTestimonials(params = {}) {
    try {
      const response = await api.get('/testimonials/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public testimonials:', error);
      throw error;
    }
  },

  /**
   * Get pending testimonials for review
   */
  async getPendingTestimonials(token) {
    try {
      const response = await api.get('/testimonials/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending testimonials:', error);
      throw error;
    }
  }
};

export default testimonialService;
