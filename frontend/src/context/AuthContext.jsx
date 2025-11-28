import React, { createContext, useState, useContext, useEffect, useCallback, useMemo } from 'react';
import { authService } from '../services/authService';
import { adminService } from '../services/adminService';
import { checkPermission } from '../constants/adminRoles';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      const userData = await authService.getProfile(token);
      setUser(userData);
      
      // Load admin profile if user is admin
      if (userData && (userData.role === 'admin' || userData.role === 'moderator')) {
        try {
          const adminData = await adminService.getAdminProfile(token);
          setAdminProfile(adminData.data);
        } catch (error) {
          // Not an admin or admin profile doesn't exist
          setAdminProfile(null);
        }
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      logout();
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = useCallback(async (email, password) => {
    const response = await authService.login(email, password);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    
    // Load admin profile if admin
    if (response.user && (response.user.role === 'admin' || response.user.role === 'moderator')) {
      try {
        const adminData = await adminService.getAdminProfile(response.token);
        setAdminProfile(adminData.data);
      } catch (error) {
        // Admin profile not found - user might not have Admin record yet
        // This is okay, they can still log in but won't have admin permissions
        console.warn('Admin profile not found:', error.response?.data?.message || error.message);
        setAdminProfile(null);
      }
    }
    
    return response;
  }, []);

  const register = useCallback(async (userData) => {
    const response = await authService.register(userData);
    setToken(response.token);
    setUser(response.user);
    localStorage.setItem('token', response.token);
    return response;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setAdminProfile(null);
    setToken(null);
    localStorage.removeItem('token');
  }, []);

  const updateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const isAdmin = useMemo(() => {
    return user && (user.role === 'admin' || user.role === 'moderator');
  }, [user]);

  const hasPermission = useCallback((permission) => {
    if (!adminProfile || !adminProfile.adminRole) return false;
    if (adminProfile.adminRole === 'super_admin') return true; // Super admin has all permissions
    return checkPermission(adminProfile.adminRole, permission);
  }, [adminProfile]);

  const isAuthenticated = useMemo(() => !!user, [user]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    adminProfile,
    token,
    loading,
    login,
    register,
    logout,
    updateUser,
    isAdmin,
    hasPermission,
    isAuthenticated
  }), [user, adminProfile, token, loading, login, register, logout, updateUser, isAdmin, hasPermission, isAuthenticated]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
