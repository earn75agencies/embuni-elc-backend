/**
 * Contact Message Service
 * Handles contact form submissions and message management
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const contactMessageService = {
  /**
   * Submit contact form message
   */
  async submitMessage(messageData) {
    try {
      const response = await api.post('/contact/message', messageData);
      return response.data;
    } catch (error) {
      console.error('Error submitting message:', error);
      throw error;
    }
  },

  /**
   * Get all contact messages with filtering
   */
  async getMessages(token, params = {}) {
    try {
      const response = await api.get('/contact/messages', {
        params,
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  },

  /**
   * Get contact message by ID
   */
  async getMessageById(token, messageId) {
    try {
      const response = await api.get(`/contact/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching message:', error);
      throw error;
    }
  },

  /**
   * Respond to contact message
   */
  async respondToMessage(token, messageId, responseData) {
    try {
      const response = await api.put(`/contact/messages/${messageId}/respond`, responseData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error responding to message:', error);
      throw error;
    }
  },

  /**
   * Update message status
   */
  async updateMessageStatus(token, messageId, statusData) {
    try {
      const response = await api.put(`/contact/messages/${messageId}/status`, statusData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating message status:', error);
      throw error;
    }
  },

  /**
   * Delete contact message
   */
  async deleteMessage(token, messageId) {
    try {
      const response = await api.delete(`/contact/messages/${messageId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting message:', error);
      throw error;
    }
  },

  /**
   * Get pending messages
   */
  async getPendingMessages(token) {
    try {
      const response = await api.get('/contact/messages/pending', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching pending messages:', error);
      throw error;
    }
  },

  /**
   * Get message statistics
   */
  async getMessageStats(token) {
    try {
      const response = await api.get('/contact/messages/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching message stats:', error);
      throw error;
    }
  }
};

export default contactMessageService;
