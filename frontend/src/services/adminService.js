import axios from 'axios';
import { API_BASE_URL } from '../config/api';

const api = axios.create({
  baseURL: `${API_BASE_URL}/admin`,
  headers: {
    'Content-Type': 'application/json'
  }
});

export const adminService = {
  // Dashboard
  async getDashboardStats(token) {
    const response = await api.get('/dashboard/stats', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Profile
  async getAdminProfile(token) {
    const response = await api.get('/profile', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateAdminProfile(token, profileData) {
    const response = await api.put('/profile', profileData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Admin Management (Super Admin only)
  async getAllAdmins(token, params = {}) {
    const response = await api.get('/all', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async getAdminById(token, adminId) {
    const response = await api.get(`/${adminId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async createAdmin(token, adminData) {
    const response = await api.post('/create', adminData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async updateAdminRole(token, adminId, roleData) {
    const response = await api.put(`/${adminId}/role`, roleData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async activateAdmin(token, adminId) {
    const response = await api.put(`/${adminId}/activate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deactivateAdmin(token, adminId) {
    const response = await api.put(`/${adminId}/deactivate`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async deleteAdmin(token, adminId) {
    const response = await api.delete(`/${adminId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  // Activity Logs
  async getActivityLogs(token, params = {}) {
    const response = await api.get('/logs/activity', {
      params,
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async logAdminAction(token, actionData) {
    const response = await api.post('/log-action', actionData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  },

  async exportActivityLogs(token, params = {}) {
    const response = await api.post('/logs/export', {}, {
      params,
      headers: { Authorization: `Bearer ${token}` },
      responseType: 'blob'
    });
    return response.data;
  },

  // Statistics
  async getAdminStats(token) {
    const response = await api.get('/stats/roles', {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  }
};
