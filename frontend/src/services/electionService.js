/**
 * Election Service
 * Handles all election-related API calls
 */

import apiClient from './apiClient';

const electionService = {
  /**
   * Get all elections
   */
  getAllElections: async () => {
    const response = await apiClient.get('/api/elections');
    return response.data;
  },

  /**
   * Get election by ID
   */
  getElectionById: async (id) => {
    const response = await apiClient.get(`/api/elections/${id}`);
    return response.data;
  },

  /**
   * Create new election
   */
  createElection: async (electionData) => {
    const response = await apiClient.post('/api/elections', electionData);
    return response.data;
  },

  /**
   * Approve election
   */
  approveElection: async (id) => {
    const response = await apiClient.patch(`/api/elections/${id}/approve`);
    return response.data;
  },

  /**
   * Start election
   */
  startElection: async (id) => {
    const response = await apiClient.patch(`/api/elections/${id}/start`);
    return response.data;
  },

  /**
   * Close election
   */
  closeElection: async (id) => {
    const response = await apiClient.patch(`/api/elections/${id}/close`);
    return response.data;
  },

  /**
   * Update election
   */
  updateElection: async (id, electionData) => {
    const response = await apiClient.put(`/api/elections/${id}`, electionData);
    return response.data;
  },

  /**
   * Delete election
   */
  deleteElection: async (id) => {
    const response = await apiClient.delete(`/api/elections/${id}`);
    return response.data;
  },

  /**
   * Export election results
   */
  exportResults: async (id) => {
    const response = await apiClient.get(`/api/elections/${id}/export`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Get election statistics
   */
  getElectionStats: async (id) => {
    const response = await apiClient.get(`/api/elections/${id}/stats`);
    return response.data;
  }
};

export default electionService;
