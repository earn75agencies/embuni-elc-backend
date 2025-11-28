import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const API_URL = `${API_BASE_URL}/auth`;

export const adminCredentialService = {
  /**
   * Create new admin login credentials
   */
  async createAdminLogin(token, adminData) {
    const response = await axios.post(`${API_URL}/admin/create-login`, adminData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Assign admin role to existing user
   */
  async assignAdminRole(token, roleData) {
    const response = await axios.post(`${API_URL}/admin/assign-role`, roleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Generate temporary password for admin
   */
  async resetAdminPassword(token, adminId) {
    const response = await axios.post(`${API_URL}/admin/reset-password`, { adminId }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Get all admin logins
   */
  async getAllAdminLogins(token) {
    const response = await axios.get(`${API_URL}/admin/all-logins`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  /**
   * Deactivate admin credentials
   */
  async deactivateAdminCredentials(token, adminId) {
    const response = await axios.put(
      `${API_URL}/admin/${adminId}/deactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  },

  /**
   * Reactivate admin credentials
   */
  async reactivateAdminCredentials(token, adminId) {
    const response = await axios.put(
      `${API_URL}/admin/${adminId}/reactivate`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    return response.data;
  }
};
