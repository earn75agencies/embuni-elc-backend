import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const internshipService = {
  // Get all internships with filtering
  async getAllInternships(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INTERNSHIPS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching internships:', error);
      throw error;
    }
  },

  // Get internship by ID
  async getInternshipById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INTERNSHIPS.GET(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching internship ${id}:`, error);
      throw error;
    }
  },

  // Create new internship
  async createInternship(token, internshipData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INTERNSHIPS.CREATE, internshipData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating internship:', error);
      throw error;
    }
  },

  // Update internship
  async updateInternship(token, id, internshipData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.INTERNSHIPS.UPDATE(id), internshipData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating internship:', error);
      throw error;
    }
  },

  // Delete internship
  async deleteInternship(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.INTERNSHIPS.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting internship:', error);
      throw error;
    }
  },

  // Apply to internship
  async applyToInternship(token, id, applicationData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.INTERNSHIPS.APPLY.replace(':id', id), applicationData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error applying to internship:', error);
      throw error;
    }
  },

  // Get student's applications
  async getMyApplications(token, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INTERNSHIPS.MY_APPLICATIONS, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching applications:', error);
      throw error;
    }
  },

  // Get all applications (for admins)
  async getApplications(token, params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.INTERNSHIPS.APPLICATIONS, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching all applications:', error);
      throw error;
    }
  },

  // Legacy methods for backward compatibility
  async getInternships(params = {}) {
    return this.getAllInternships(params);
  },

  async getStudentApplications(params = {}) {
    return this.getMyApplications(params.token || '', params);
  },
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
