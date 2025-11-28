/**
 * Vote Service
 * Handles all voting-related API calls
 */

import apiClient from './apiClient';

const voteService = {
  /**
   * Validate voting link
   */
  validateVotingLink: async (token) => {
    const response = await apiClient.post('/api/vote/validate-link', { token });
    return response.data;
  },

  /**
   * Submit vote
   */
  submitVote: async (voteData) => {
    const response = await apiClient.post('/api/vote/submit', voteData);
    return response.data;
  },

  /**
   * Get election results
   */
  getResults: async (electionId) => {
    const response = await apiClient.get(`/api/vote/results/${electionId}`);
    return response.data;
  },

  /**
   * Get live election results
   */
  getLiveResults: async (electionId) => {
    const response = await apiClient.get(`/api/vote/live-results/${electionId}`);
    return response.data;
  },

  /**
   * Check if user has voted
   */
  checkVoteStatus: async (electionId, token) => {
    const response = await apiClient.get(`/api/vote/status/${electionId}`, {
      params: { token }
    });
    return response.data;
  },

  /**
   * Get voting statistics
   */
  getVotingStats: async (electionId) => {
    const response = await apiClient.get(`/api/vote/stats/${electionId}`);
    return response.data;
  }
};

export default voteService;
