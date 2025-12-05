import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const memberService = {
  /**
   * Get all members
   */
  getAllMembers: async () => {
    try {
      const response = await api.get('/members');
      return response.data;
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  /**
   * Get member by ID
   */
  getMemberById: async (memberId) => {
    try {
      const response = await api.get(`/members/${memberId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  /**
   * Update member status
   */
  updateMemberStatus: async (token, memberId, statusData) => {
    try {
      const response = await api.patch(`/members/${memberId}`, statusData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating member status:', error);
      throw error;
    }
  },

  /**
   * Update member profile
   */
  updateMemberProfile: async (token, memberId, profileData) => {
    try {
      const response = await api.patch(`/members/${memberId}`, profileData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating member profile:', error);
      throw error;
    }
  },

  /**
   * Get member statistics
   */
  getMemberStats: async (token) => {
    try {
      const response = await api.get('/members/stats', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching member stats:', error);
      throw error;
    }
  },

  /**
   * Search members
   */
  searchMembers: async (query, filters = {}) => {
    try {
      const response = await api.get('/members/search', {
        params: {
          q: query,
          ...filters
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error searching members:', error);
      throw error;
    }
  },

  /**
   * Bulk update member statuses
   */
  bulkUpdateStatus: async (token, memberIds, statusData) => {
    try {
      const response = await api.patch('/members/bulk', {
        memberIds,
        ...statusData
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating members:', error);
      throw error;
    }
  },

  /**
   * Export members data
   */
  exportMembers: async (token, format = 'csv') => {
    try {
      const response = await api.get('/members/export', {
        params: { format },
        headers: {
          Authorization: `Bearer ${token}`
        },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      return response.data;
    } catch (error) {
      console.error('Error exporting members:', error);
      throw error;
    }
  }
};

export default memberService;
