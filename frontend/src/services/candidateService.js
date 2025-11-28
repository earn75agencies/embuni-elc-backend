/**
 * Candidate Service
 * Handles all candidate-related API calls
 */

import apiClient from './apiClient';

const candidateService = {
  /**
   * Get all candidates for an election
   */
  getCandidates: async (electionId) => {
    const response = await apiClient.get(`/api/candidates`, {
      params: { electionId }
    });
    return response.data;
  },

  /**
   * Get candidate by ID
   */
  getCandidateById: async (id) => {
    const response = await apiClient.get(`/api/candidates/${id}`);
    return response.data;
  },

  /**
   * Create new candidate
   */
  createCandidate: async (candidateData) => {
    const response = await apiClient.post('/api/candidates', candidateData);
    return response.data;
  },

  /**
   * Update candidate
   */
  updateCandidate: async (id, candidateData) => {
    const response = await apiClient.put(`/api/candidates/${id}`, candidateData);
    return response.data;
  },

  /**
   * Delete candidate
   */
  deleteCandidate: async (id) => {
    const response = await apiClient.delete(`/api/candidates/${id}`);
    return response.data;
  },

  /**
   * Update candidate order
   */
  updateCandidateOrder: async (candidates) => {
    const response = await apiClient.put('/api/candidates/reorder', { candidates });
    return response.data;
  },

  /**
   * Upload candidate photo
   */
  uploadPhoto: async (candidateId, formData) => {
    const response = await apiClient.post(`/api/candidates/${candidateId}/photo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  /**
   * Approve candidate
   */
  approveCandidate: async (id) => {
    const response = await apiClient.patch(`/api/candidates/${id}/approve`);
    return response.data;
  },

  /**
   * Reject candidate
   */
  rejectCandidate: async (id, reason) => {
    const response = await apiClient.patch(`/api/candidates/${id}/reject`, { reason });
    return response.data;
  }
};

export default candidateService;
