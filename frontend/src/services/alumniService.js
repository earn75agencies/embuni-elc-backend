import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const alumniService = {
  // Get all alumni with filtering and pagination
  async getAllAlumni(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALUMNI.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching alumni:', error);
      throw error;
    }
  },

  // Get alumni profile by ID
  async getAlumniById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALUMNI.GET(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching alumni ${id}:`, error);
      throw error;
    }
  },

  // Create alumni profile
  async createAlumni(token, alumniData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.ALUMNI.CREATE, alumniData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating alumni profile:', error);
      throw error;
    }
  },

  // Update alumni profile
  async updateAlumni(token, id, profileData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.ALUMNI.UPDATE(id), profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating alumni profile:', error);
      throw error;
    }
  },

  // Delete alumni profile
  async deleteAlumni(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.ALUMNI.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting alumni profile:', error);
      throw error;
    }
  },

  // Get user's alumni profile
  async getMyProfile(token) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALUMNI.PROFILE, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
      throw error;
    }
  },

  // Get success stories
  async getSuccessStories(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALUMNI.SUCCESS_STORIES, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching success stories:', error);
      throw error;
    }
  },

  // Get alumni network
  async getNetwork(token, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.ALUMNI.NETWORK, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching alumni network:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  async getAlumni(params = {}) {
    return this.getAllAlumni(params);
  },

  async getAlumniProfile(id) {
    return this.getAlumniById(id);
  },

  async updateProfile(id, profileData) {
    return this.updateAlumni(profileData.token || '', id, profileData);
  },

  async sendConnectionRequest(alumniId, message) {
    try {
      const response = await apiClient.post(`${API_ENDPOINTS.ALUMNI.LIST}/${alumniId}/connect`, { message });
      return response.data;
    } catch (error) {
      console.error('Error sending connection request:', error);
      throw error;
    }
  },

  async respondToConnectionRequest(requestId, action) {
    try {
      const response = await apiClient.put(`${API_ENDPOINTS.ALUMNI.LIST}/connections/${requestId}`, { action });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's connections
  getConnections: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/connections`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit testimonial
  submitTestimonial: async (alumniId, testimonialData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alumni/${alumniId}/testimonials`, testimonialData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get alumni testimonials
  getTestimonials: async (alumniId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/${alumniId}/testimonials`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Search alumni
  searchAlumni: async (query, filters = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/search`, {
        params: { q: query, ...filters }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get alumni statistics
  getAlumniStats: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/stats`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get networking events
  getNetworkingEvents: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/events`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Join networking event
  joinNetworkingEvent: async (eventId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alumni/events/${eventId}/join`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default alumniService;
