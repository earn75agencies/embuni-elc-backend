import apiClient from './apiClient';

const mentorshipService = {
  // Get all mentorships for the current user
  getMentorships: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/mentorship?${queryParams}`);
    return response;
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
