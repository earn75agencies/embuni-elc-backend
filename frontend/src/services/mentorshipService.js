import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const mentorshipService = {
  // Get all mentors
  async getMentors(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENTORSHIP.MENTORS, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching mentors:', error);
      throw error;
    }
  },

  // Get mentorship requests
  async getMentorshipRequests(token, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENTORSHIP.MENTORSHIP_REQUESTS, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mentorship requests:', error);
      throw error;
    }
  },

  // Create mentorship request
  async createMentorshipRequest(token, requestData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MENTORSHIP.CREATE_REQUEST, requestData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating mentorship request:', error);
      throw error;
    }
  },

  // Update mentorship request
  async updateMentorshipRequest(token, id, updateData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MENTORSHIP.UPDATE_REQUEST(id), updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating mentorship request:', error);
      throw error;
    }
  },

  // Get mentorship sessions
  async getSessions(token, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENTORSHIP.SESSIONS, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching sessions:', error);
      throw error;
    }
  },

  // Create mentorship session
  async createSession(token, sessionData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MENTORSHIP.CREATE_SESSION, sessionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating session:', error);
      throw error;
    }
  },

  // Update mentorship session
  async updateSession(token, id, sessionData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.MENTORSHIP.UPDATE_SESSION(id), sessionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating session:', error);
      throw error;
    }
  },

  // Submit feedback
  async submitFeedback(token, feedbackData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.MENTORSHIP.FEEDBACK, feedbackData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting feedback:', error);
      throw error;
    }
  },

  // Get mentorship stats
  async getStats(token) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.MENTORSHIP.STATS, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching mentorship stats:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  async getMentorships(params = {}) {
    return this.getMentorshipRequests(params.token || '', params);
  },

  async getMentorshipById(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.MENTORSHIP.MENTORSHIP_REQUESTS}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching mentorship:', error);
      throw error;
    }
  },

  async findMentors(params = {}) {
    return this.getMentors(params);
  },

  async sendRequest(mentorId, data) {
    return this.createMentorshipRequest(data.token || '', { mentorId, ...data });
  },

  async respondToRequest(id, data) {
    return this.updateMentorshipRequest(data.token || '', id, data);
  },

  // Get mentorship by ID
  getMentorshipById: async (id) => {
    const response = await apiClient.get(`/api/mentorship/${id}`);
    return response;
  },

  // Find potential mentors
  findMentors: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/mentorship/find-mentors?${queryParams}`);
    return response;
  },

  // Send mentorship request
  sendRequest: async (mentorId, data) => {
    const response = await apiClient.post('/api/mentorship/request', {
      mentorId,
      ...data
    });
    return response;
  },

  // Respond to mentorship request
  respondToRequest: async (id, data) => {
    const response = await apiClient.post(`/api/mentorship/${id}/respond`, data);
    return response;
  },

  // Schedule a session
  scheduleSession: async (id, sessionData) => {
    const response = await apiClient.post(`/api/mentorship/${id}/sessions`, sessionData);
    return response;
  },

  // Update goal progress
  updateGoalProgress: async (id, goalId, data) => {
    const response = await apiClient.put(`/api/mentorship/${id}/goals/${goalId}`, data);
    return response;
  },

  // Submit feedback
  submitFeedback: async (id, feedbackData) => {
    const response = await apiClient.post(`/api/mentorship/${id}/feedback`, feedbackData);
    return response;
  },

  // Get mentorship statistics
  getStats: async () => {
    const response = await apiClient.get('/api/mentorship/stats');
    return response;
  },

  // Update mentorship profile
  updateProfile: async (profileData) => {
    const response = await apiClient.put('/api/mentorship/profile', profileData);
    return response;
  },

  // Get mentorship availability
  getAvailability: async (mentorId) => {
    const response = await apiClient.get(`/api/mentorship/availability/${mentorId}`);
    return response;
  },

  // Set availability (for mentors)
  setAvailability: async (availabilityData) => {
    const response = await apiClient.post('/api/mentorship/availability', availabilityData);
    return response;
  },

  // Get mentorship resources
  getResources: async () => {
    const response = await apiClient.get('/api/mentorship/resources');
    return response;
  },

  // Upload session file
  uploadSessionFile: async (mentorshipId, sessionId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
    
    const response = await apiClient.post(
      `/api/mentorship/${mentorshipId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response;
  },

  // Get session history
  getSessionHistory: async (mentorshipId) => {
    const response = await apiClient.get(`/api/mentorship/${mentorshipId}/sessions`);
    return response;
  },

  // Cancel mentorship
  cancelMentorship: async (id, reason) => {
    const response = await apiClient.post(`/api/mentorship/${id}/cancel`, { reason });
    return response;
  },

  // Pause mentorship
  pauseMentorship: async (id, reason) => {
    const response = await apiClient.post(`/api/mentorship/${id}/pause`, { reason });
    return response;
  },

  // Resume mentorship
  resumeMentorship: async (id) => {
    const response = await apiClient.post(`/api/mentorship/${id}/resume`);
    return response;
  }
};

export default mentorshipService;
