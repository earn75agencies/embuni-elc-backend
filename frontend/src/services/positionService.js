/**
 * Position Service
 * Handles all position-related API calls
 */

import apiClient from './apiClient';

const positionService = {
  /**
   * Get positions for an election
   */
  getPositions: async (electionId) => {
    const response = await apiClient.get(`/api/elections/${electionId}/positions`);
    return response.data;
  },

  /**
   * Get position by ID
   */
  getPositionById: async (id) => {
    const response = await apiClient.get(`/api/positions/${id}`);
    return response.data;
  },

  /**
   * Create new position
   */
  createPosition: async (electionId, positionData) => {
    const response = await apiClient.post(`/api/elections/${electionId}/positions`, positionData);
    return response.data;
  },

  /**
   * Update position
   */
  updatePosition: async (id, positionData) => {
    const response = await apiClient.put(`/api/positions/${id}`, positionData);
    return response.data;
  },

  /**
   * Delete position
   */
  deletePosition: async (id) => {
    const response = await apiClient.delete(`/api/positions/${id}`);
    return response.data;
  },

  /**
   * Update position order
   */
  updatePositionOrder: async (positions) => {
    const response = await apiClient.put('/api/positions/reorder', { positions });
    return response.data;
  },

  /**
   * Get position statistics
   */
  getPositionStats: async (id) => {
    const response = await apiClient.get(`/api/positions/${id}/stats`);
    return response.data;
  }
};

export default positionService;
