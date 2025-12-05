import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const galleryService = {
  async getAllItems(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GALLERY.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      throw error;
    }
  },

  async getAllGalleryItems(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.GALLERY.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      throw error;
    }
  },

  async getItemById(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.GALLERY.DETAIL(id)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching gallery item ${id}:`, error);
      throw error;
    }
  },

  async createItem(token, itemData, file = null) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // If file is provided, use FormData, otherwise use JSON
      let data = itemData;
      if (file || itemData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = itemData;
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.post(API_ENDPOINTS.GALLERY.CREATE, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  },

  async createGalleryItem(token, itemData, file = null) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // If file is provided, use FormData, otherwise use JSON
      let data = itemData;
      if (file || itemData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = itemData;
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.post(API_ENDPOINTS.GALLERY.CREATE, data, { headers });
      return response.data;
    } catch (error) {
      console.error('Error creating gallery item:', error);
      throw error;
    }
  },

  async updateItem(token, id, itemData, file = null) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // If file is provided, use FormData, otherwise use JSON
      let data = itemData;
      if (file || itemData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = itemData;
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.put(API_ENDPOINTS.GALLERY.UPDATE(id), data, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating gallery item ${id}:`, error);
      throw error;
    }
  },

  async updateGalleryItem(token, id, itemData, file = null) {
    try {
      const headers = {
        Authorization: `Bearer ${token}`
      };

      // If file is provided, use FormData, otherwise use JSON
      let data = itemData;
      if (file || itemData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = itemData;
      } else {
        headers['Content-Type'] = 'application/json';
      }

      const response = await apiClient.put(API_ENDPOINTS.GALLERY.UPDATE(id), data, { headers });
      return response.data;
    } catch (error) {
      console.error(`Error updating gallery item ${id}:`, error);
      throw error;
    }
  },

  async deleteItem(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.GALLERY.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting gallery item ${id}:`, error);
      throw error;
    }
  },

  async deleteGalleryItem(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.GALLERY.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting gallery item ${id}:`, error);
      throw error;
    }
  }
};
