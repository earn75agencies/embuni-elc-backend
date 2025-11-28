/**
 * Partner Service
 * Handles partner management operations
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const partnerService = {
  /**
   * Get all partners with optional filtering
   */
  async getPartners(token, params = {}) {
    try {
      const response = await api.get('/partners', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partners:', error);
      throw error;
    }
  },

  /**
   * Get partner by ID
   */
  async getPartnerById(token, partnerId) {
    try {
      const response = await api.get(`/partners/${partnerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching partner:', error);
      throw error;
    }
  },

  /**
   * Create new partner
   */
  async createPartner(token, partnerData) {
    try {
      const response = await api.post('/partners', partnerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating partner:', error);
      throw error;
    }
  },

  /**
   * Update partner
   */
  async updatePartner(token, partnerId, partnerData) {
    try {
      const response = await api.put(`/partners/${partnerId}`, partnerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating partner:', error);
      throw error;
    }
  },

  /**
   * Delete partner
   */
  async deletePartner(token, partnerId) {
    try {
      const response = await api.delete(`/partners/${partnerId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting partner:', error);
      throw error;
    }
  },

  /**
   * Update partner order
   */
  async updatePartnerOrder(token, partners) {
    try {
      const response = await api.put('/partners/order', { partners }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating partner order:', error);
      throw error;
    }
  },

  /**
   * Get public partners (for frontend display)
   */
  async getPublicPartners(params = {}) {
    try {
      const response = await api.get('/partners/public', { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching public partners:', error);
      throw error;
    }
  }
};

export default partnerService;
