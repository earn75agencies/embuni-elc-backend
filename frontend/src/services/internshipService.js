import apiClient from './apiClient';

const internshipService = {
  // Get all internships with filtering
  getInternships: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/internships?${queryParams}`);
    return response;
  },

  // Get internship by ID
  getInternshipById: async (id) => {
    const response = await apiClient.get(`/api/internships/${id}`);
    return response;
  },

  // Create new internship
  createInternship: async (internshipData) => {
    const response = await apiClient.post('/api/internships', internshipData);
    return response;
  },

  // Update internship
  updateInternship: async (id, internshipData) => {
    const response = await apiClient.put(`/api/internships/${id}`, internshipData);
    return response;
  },

  // Delete internship
  deleteInternship: async (id) => {
    const response = await apiClient.delete(`/api/internships/${id}`);
    return response;
  },

  // Apply to internship
  applyToInternship: async (id, applicationData) => {
    const response = await apiClient.post(`/api/internships/${id}/apply`, applicationData);
    return response;
  },

  // Get student's applications
  getStudentApplications: async (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/internships/my-applications?${queryParams}`);
    return response;
  },

  // Get company's internship applications
  getCompanyApplications: async (id, params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/internships/${id}/applications?${queryParams}`);
    return response;
  },

  // Update application status
  updateApplicationStatus: async (id, studentId, statusData) => {
    const response = await apiClient.put(`/api/internships/${id}/applications/${studentId}`, statusData);
    return response;
  },

  // Get internship statistics
  getStats: async () => {
    const response = await apiClient.get('/api/internships/stats');
    return response;
  },

  // Upload application documents
  uploadDocument: async (file, type) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    
    const response = await apiClient.post('/api/internships/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  },

  // Save draft internship
  saveDraft: async (internshipData) => {
    const response = await apiClient.post('/api/internships/draft', internshipData);
    return response;
  },

  // Get saved drafts
  getDrafts: async () => {
    const response = await apiClient.get('/api/internships/drafts');
    return response;
  },

  // Delete draft
  deleteDraft: async (id) => {
    const response = await apiClient.delete(`/api/internships/drafts/${id}`);
    return response;
  },

  // Search internships
  searchInternships: async (searchTerm, filters = {}) => {
    const params = {
      search: searchTerm,
      ...filters
    };
    
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    
    const response = await apiClient.get(`/api/internships/search?${queryParams}`);
    return response;
  },

  // Get recommended internships
  getRecommendedInternships: async () => {
    const response = await apiClient.get('/api/internships/recommended');
    return response;
  },

  // Track internship view
  trackView: async (id) => {
    const response = await apiClient.post(`/api/internships/${id}/view`);
    return response;
  },

  // Track application click
  trackClick: async (id) => {
    const response = await apiClient.post(`/api/internships/${id}/click`);
    return response;
  }
};

export default internshipService;
