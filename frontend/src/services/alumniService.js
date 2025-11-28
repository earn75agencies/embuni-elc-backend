import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const alumniService = {
  // Get all alumni with filtering and pagination
  getAlumni: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get alumni profile by ID
  getAlumniProfile: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/alumni/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update alumni profile
  updateProfile: async (id, profileData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/alumni/${id}`, profileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Send connection request
  sendConnectionRequest: async (alumniId, message) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/alumni/${alumniId}/connect`, { message });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Respond to connection request
  respondToConnectionRequest: async (requestId, action) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/alumni/connections/${requestId}`, { action });
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
