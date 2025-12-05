/**
 * Voting Link Service
 * Handles all voting link-related API calls
 */

import apiClient from './apiClient';

const votingLinkService = {
  /**
   * Generate voting links
   */
  generateLinks: async (electionId, linkData) => {
    const response = await apiClient.post('/api/voting-links/generate', {
      electionId,
      ...linkData
    });
    return response.data;
  },

  /**
   * Get voting links for an election
   */
  getVotingLinks: async (electionId) => {
    const response = await apiClient.get('/api/voting-links', {
      params: { electionId }
    });
    return response.data;
  },

  /**
   * Get voting link by ID
   */
  getVotingLinkById: async (id) => {
    const response = await apiClient.get(`/api/voting-links/${id}`);
    return response.data;
  },

  /**
   * Revoke voting link
   */
  revokeLink: async (id) => {
    const response = await apiClient.patch(`/api/voting-links/${id}/revoke`);
    return response.data;
  },

  /**
   * Reactivate voting link
   */
  reactivateLink: async (id) => {
    const response = await apiClient.patch(`/api/voting-links/${id}/reactivate`);
    return response.data;
  },

  /**
   * Get voting link statistics
   */
  getLinkStats: async (id) => {
    const response = await apiClient.get(`/api/voting-links/${id}/stats`);
    return response.data;
  },

  /**
   * Export voting links
   */
  exportLinks: async (electionId) => {
    const response = await apiClient.get('/api/voting-links/export', {
      params: { electionId },
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Bulk generate links for members
   */
  generateForMemberList: async (electionId, memberIds) => {
    const response = await apiClient.post('/api/voting-links/bulk-generate', {
      electionId,
      memberIds
    });
    return response.data;
  }
};

export default votingLinkService;
