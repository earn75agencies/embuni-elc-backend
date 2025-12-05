import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const contactService = {
  /**
   * Get contact information
   * Public endpoint - no authentication required
   */
  async getContactInfo() {
    try {
      const response = await api.get('/contact');
      return response.data.data;
    } catch (error) {
      console.error('Error fetching contact info:', error);
      throw error;
    }
  },

  /**
   * Update contact information
   * Admin only - requires authentication
   */
  async updateContactInfo(token, contactData) {
    try {
      const response = await api.put('/contact', contactData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating contact info:', error);
      throw error;
    }
  }
};

