/**
 * Design Settings Service
 * Handles design settings management operations
 */

import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const designSettingsService = {
  /**
   * Get design settings
   */
  async getDesignSettings(token) {
    try {
      const response = await api.get('/design-settings', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching design settings:', error);
      throw error;
    }
  },

  /**
   * Update all design settings
   */
  async updateDesignSettings(token, settingsData) {
    try {
      const response = await api.put('/design-settings', settingsData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating design settings:', error);
      throw error;
    }
  },

  /**
   * Update banner settings
   */
  async updateBannerSettings(token, bannerData) {
    try {
      const response = await api.put('/design-settings/banner', bannerData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating banner settings:', error);
      throw error;
    }
  },

  /**
   * Update hero settings
   */
  async updateHeroSettings(token, heroData) {
    try {
      const response = await api.put('/design-settings/hero', heroData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating hero settings:', error);
      throw error;
    }
  },

  /**
   * Update footer settings
   */
  async updateFooterSettings(token, footerData) {
    try {
      const response = await api.put('/design-settings/footer', footerData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating footer settings:', error);
      throw error;
    }
  },

  /**
   * Update color scheme
   */
  async updateColorScheme(token, colorData) {
    try {
      const response = await api.put('/design-settings/colors', colorData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating color scheme:', error);
      throw error;
    }
  },

  /**
   * Update announcement settings
   */
  async updateAnnouncementSettings(token, announcementData) {
    try {
      const response = await api.put('/design-settings/announcements', announcementData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating announcement settings:', error);
      throw error;
    }
  },

  /**
   * Reset design settings to defaults
   */
  async resetDesignSettings(token) {
    try {
      const response = await api.post('/design-settings/reset', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error resetting design settings:', error);
      throw error;
    }
  }
};

export default designSettingsService;
