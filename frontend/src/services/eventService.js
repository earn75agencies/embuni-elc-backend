import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const eventService = {
  async getAllEvents(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EVENTS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  },

  async getEventById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.EVENTS.GET(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching event ${id}:`, error);
      throw error;
    }
  },

  async createEvent(token, eventData, file = null) {
    try {
      // If file is provided, use FormData, otherwise use JSON
      let data = eventData;
      if (file || eventData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = eventData;
      }

      const response = await apiClient.post(API_ENDPOINTS.EVENTS.CREATE, data);
      return response.data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  },

  async updateEvent(token, id, eventData, file = null) {
    try {
      // If file is provided, use FormData, otherwise use JSON
      let data = eventData;
      if (file || eventData instanceof FormData) {
        // FormData - don't set Content-Type, let browser set it with boundary
        data = eventData;
      }

      const response = await apiClient.put(API_ENDPOINTS.EVENTS.UPDATE(id), data);
      return response.data;
    } catch (error) {
      console.error(`Error updating event ${id}:`, error);
      throw error;
    }
  },

  async deleteEvent(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.EVENTS.DELETE(id));
      return response.data;
    } catch (error) {
      console.error(`Error deleting event ${id}:`, error);
      throw error;
    }
  },

  async registerForEvent(token, id) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.EVENTS.REGISTER(id), {});
      return response.data;
    } catch (error) {
      console.error(`Error registering for event ${id}:`, error);
      throw error;
    }
  }
};
