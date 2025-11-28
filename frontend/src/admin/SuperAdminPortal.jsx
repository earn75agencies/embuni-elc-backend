/**
 * SuperAdminPortal - Dedicated portal for Super Admin
 * 
 * This portal is ONLY for managing admin accounts and monitoring activity.
 * Super Admin does NOT manage content in other modules (Events, Gallery, Members, Posts).
 * 
 * Features:
 * - View all admins with activity summary
 * - Create new admin accounts
 * - Deactivate/remove admin accounts
 * - View activity logs
 * - Monitor admin activity
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Plus, Trash2, RefreshCw, Key, Eye, EyeOff, 
  Search, Filter, Activity, Clock, Mail, Shield, 
  AlertCircle, CheckCircle2, XCircle, Copy, ChevronDown,
  Calendar, FileText, Image, Target, Info, BookOpen,
  Palette, BarChart3, Network, MessageSquare, Megaphone, Crown
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminCredentialService } from '../services/adminCredentialService';
import { adminService } from '../services/adminService';
import { ROLE_LABELS, ROLE_ICONS, ROLE_COLORS, ADMIN_ROLES } from '../constants/adminRoles';
import { toast } from 'react-toastify';

const SuperAdminPortal = () => {
  const { token, adminProfile } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [logsLoading, setLogsLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showLogs, setShowLogs] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [selectedAdmin, setSelectedAdmin] = useState(null);
  const [tempPassword, setTempPassword] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: '',
    adminRole: 'events_admin', // Use correct role name
    department: 'Administration',
    notes: ''
  });
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const roleDropdownRef = useRef(null);

  // Map roles to lucide-react icons
  const ROLE_ICON_COMPONENTS = {
    [ADMIN_ROLES.SUPER_ADMIN]: Crown,
    [ADMIN_ROLES.DESIGN_ADMIN]: Palette, // Home Admin
    [ADMIN_ROLES.ABOUT_ADMIN]: Info, // About Admin
    [ADMIN_ROLES.PROGRAMS_ADMIN]: Target, // Programs Admin
    [ADMIN_ROLES.EVENTS_ADMIN]: Calendar, // Events Admin
    [ADMIN_ROLES.CONTENT_ADMIN]: FileText, // News Admin
    [ADMIN_ROLES.GALLERY_ADMIN]: Image, // Gallery Admin
    [ADMIN_ROLES.RESOURCES_ADMIN]: BookOpen, // Resources Admin
    [ADMIN_ROLES.CONTACT_ADMIN]: Mail, // Contact Admin
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (roleDropdownRef.current && !roleDropdownRef.current.contains(event.target)) {
        setRoleDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    loadAdmins();
    loadActivityLogs();
  }, [token]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminCredentialService.getAllAdminLogins(token);
      setAdmins(response.data || []);
    } catch (error) {
      toast.error('Failed to load admin accounts');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      setLogsLoading(true);
      const response = await adminService.getActivityLogs(token, { limit: 100 });
      setActivityLogs(response.data || []);
    } catch (error) {
      console.error('Failed to load activity logs:', error);
    } finally {
      setLogsLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      toast.error('Email, name, and password are required');
      return;
    }

    if (formData.password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    try {
      // Create the user account with admin role in one step
      const createResponse = await adminCredentialService.createAdminLogin(token, {
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        password: formData.password,
        adminRole: formData.adminRole // Include adminRole in creation
      });

      // If adminRole wasn't included or creation didn't create Admin record, assign it
      if (createResponse.data?.userId && !createResponse.data?.adminId && formData.adminRole) {
        await adminCredentialService.assignAdminRole(token, {
          userId: createResponse.data.userId,
          adminRole: formData.adminRole
        });
      }

      setTempPassword(createResponse.data);
      setFormData({
        email: '',
        firstName: '',
        lastName: '',
        password: '',
        adminRole: 'events_admin', // Use correct role name
        department: 'Administration',
        notes: ''
      });
      setShowCreateForm(false);
      
      toast.success('Admin account created successfully');
      loadAdmins();
    } catch (error) {
      console.error('Admin creation error:', error);
      const errorMessage = error.response?.data?.message || error.response?.data?.error?.message || 'Failed to create admin account';
      const errorDetails = error.response?.data?.errors || error.response?.data?.error?.details;
      
      if (errorDetails) {
        console.error('Error details:', errorDetails);
        toast.error(`${errorMessage}. Check console for details.`);
      } else {
        toast.error(errorMessage);
      }
    }
  };

  const handleDeactivate = async (adminId) => {
    if (!window.confirm('Are you sure you want to deactivate this admin account?')) return;

    try {
      await adminCredentialService.deactivateAdminCredentials(token, adminId);
      toast.success('Admin account deactivated');
      loadAdmins();
    } catch (error) {
      toast.error('Failed to deactivate admin');
    }
  };

  const handleReactivate = async (adminId) => {
    try {
      await adminCredentialService.reactivateAdminCredentials(token, adminId);
      toast.success('Admin account reactivated');
      loadAdmins();
    } catch (error) {
      toast.error('Failed to reactivate admin');
    }
  };

  const handleResetPassword = async (adminId) => {
    if (!window.confirm('Generate a new temporary password for this admin?')) return;

    try {
      const response = await adminCredentialService.resetAdminPassword(token, adminId);
      setTempPassword(response.data);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Copied to clipboard');
  };

  const getActivitySummary = (adminId) => {
    const adminLogs = activityLogs.filter(log => log.admin?.toString() === adminId?.toString());
    const recentLogs = adminLogs.slice(0, 5);
    return {
      total: adminLogs.length,
      recent: recentLogs
    };
  };

  const filteredAdmins = admins.filter(admin => {
    const matchesSearch = 
      admin.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'all' || admin.adminRole === filterRole;
    return matchesSearch && matchesRole;
  });

  const stats = {
    total: admins.length,
    active: admins.filter(a => a.isActive).length,
    inactive: admins.filter(a => !a.isActive).length,
    byRole: admins.reduce((acc, admin) => {
      acc[admin.adminRole] = (acc[admin.adminRole] || 0) + 1;
      return acc;
    }, {})
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
                <Shield size={32} className="text-red-600" />
                Super Admin Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage admin accounts and monitor system activity. You do NOT manage content in other modules.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowLogs(!showLogs); if (!showLogs) loadActivityLogs(); }}
                className="btn-outline flex items-center gap-2"
              >
                <Activity size={20} />
                {showLogs ? 'Hide Logs' : 'View Logs'}
              </button>
              <button
                onClick={loadAdmins}
                className="btn-outline flex items-center gap-2"
              >
                <RefreshCw size={20} />
                Refresh
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Admins</p>
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
              </div>
              <Users className="text-blue-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Activity Logs</p>
                <p className="text-3xl font-bold text-indigo-600">{activityLogs.length}</p>
              </div>
              <Activity className="text-indigo-600" size={32} />
            </div>
          </div>
        </div>

        {/* Temporary Password Alert */}
        {tempPassword && (
          <div className="mb-6 bg-green-100 border-l-4 border-green-600 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-heading font-bold text-green-800 mb-2">
                  Admin Account Created Successfully
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-green-700">
                    <strong>Email:</strong> {tempPassword.adminEmail}
                  </p>
                  <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
                    <code className="text-sm font-mono flex-1">{tempPassword.temporaryPassword}</code>
                    <button
                      onClick={() => copyToClipboard(tempPassword.temporaryPassword, 'password')}
                      className="text-green-600 hover:text-green-700"
                    >
                      {copiedId === 'password' ? (
                        <CheckCircle2 size={20} />
                      ) : (
                        <Copy size={20} />
                      )}
                    </button>
                  </div>
                  <p className="text-green-700 text-xs italic">{tempPassword.note}</p>
                </div>
              </div>
              <button
                onClick={() => setTempPassword(null)}
                className="text-green-600 hover:text-green-700 font-bold text-xl"
              >
                ×
              </button>
            </div>
          </div>
        )}

        {/* Create Admin Form */}
        {showCreateForm && (
          <div className="card p-6 mb-6 bg-blue-50 border-2 border-blue-200">
            <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
              Create New Admin Account
            </h3>
            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="First Name *"
                  className="input-field"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <input
                  type="text"
                  placeholder="Last Name *"
                  className="input-field"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>
              <input
                type="email"
                placeholder="Email Address *"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Temporary Password (min 8 characters) *"
                className="input-field"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                minLength={8}
              />
              <div className="space-y-4">
                {/* Role Selection Dropdown */}
                <div className="relative" ref={roleDropdownRef}>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Admin Role *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
                      className="w-full input-field flex items-center justify-between text-left"
                    >
                      <div className="flex items-center gap-3">
                        {formData.adminRole && ROLE_ICON_COMPONENTS[formData.adminRole] ? (
                          <>
                            {React.createElement(ROLE_ICON_COMPONENTS[formData.adminRole], { 
                              size: 20, 
                              className: "text-neutral-600" 
                            })}
                            <span>{ROLE_LABELS[formData.adminRole] || formData.adminRole}</span>
                          </>
                        ) : (
                          <span className="text-neutral-400">Select a role...</span>
                        )}
                      </div>
                      <ChevronDown 
                        size={20} 
                        className={`text-neutral-400 transition-transform ${roleDropdownOpen ? 'rotate-180' : ''}`} 
                      />
                    </button>
                    
                    {roleDropdownOpen && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg max-h-96 overflow-y-auto">
                        <div className="p-2">
                          {Object.values(ADMIN_ROLES)
                            .filter(role => role !== ADMIN_ROLES.SUPER_ADMIN) // Exclude super admin from selection
                            .map((role) => {
                              const IconComponent = ROLE_ICON_COMPONENTS[role];
                              const isSelected = formData.adminRole === role;
                              return (
                                <div
                                  key={role}
                                  onClick={() => {
                                    setFormData({ ...formData, adminRole: role });
                                    setRoleDropdownOpen(false);
                                  }}
                                  className={`flex items-center gap-3 px-4 py-3 rounded-lg cursor-pointer transition-colors ${
                                    isSelected 
                                      ? 'bg-neutral-800 text-white' 
                                      : 'hover:bg-neutral-50 text-neutral-700'
                                  }`}
                                >
                                  {IconComponent && React.createElement(IconComponent, { 
                                    size: 20,
                                    className: isSelected ? 'text-white' : 'text-neutral-600'
                                  })}
                                  <span className="flex-1">{ROLE_LABELS[role]}</span>
                                  {isSelected && <CheckCircle2 size={18} className="text-white" />}
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Selected Role Display */}
                  {formData.adminRole && (
                    <div className="mt-2 p-3 bg-neutral-50 border border-red-300 rounded-lg">
                      <div className="flex items-center gap-3">
                        {ROLE_ICON_COMPONENTS[formData.adminRole] && React.createElement(
                          ROLE_ICON_COMPONENTS[formData.adminRole], 
                          { size: 20, className: "text-neutral-600" }
                        )}
                        <span className="text-sm font-medium text-neutral-700">
                          {ROLE_LABELS[formData.adminRole]}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
                
                <input
                  type="text"
                  placeholder="Department (optional)"
                  className="input-field"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                />
              </div>
              <textarea
                placeholder="Notes (optional)"
                className="input-field"
                rows={3}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary">
                  Create Admin Account
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters and Search */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search by name or email..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field md:w-64"
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value)}
            >
              <option value="all">All Roles</option>
              {Object.values(ADMIN_ROLES).map(role => (
                <option key={role} value={role}>
                  {ROLE_ICONS[role]} {ROLE_LABELS[role]}
                </option>
              ))}
            </select>
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="btn-primary flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={20} />
              Create Admin
            </button>
          </div>
        </div>

        {/* Admins Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Name</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Email</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Role</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Last Login</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Activity Summary</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAdmins.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-neutral-500">
                    {searchTerm || filterRole !== 'all' 
                      ? 'No admins match your search criteria'
                      : 'No admin accounts created yet'}
                  </td>
                </tr>
              ) : (
                filteredAdmins.map((admin) => {
                  const activity = getActivitySummary(admin.adminId);
                  return (
                    <tr key={admin.adminId} className="border-b border-neutral-100 hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-charcoal">{admin.name}</p>
                          <p className="text-xs text-neutral-500">{admin.userId}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">{admin.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${ROLE_COLORS[admin.adminRole]}`}>
                          {ROLE_ICONS[admin.adminRole]} {ROLE_LABELS[admin.adminRole]}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {admin.lastLogin ? (
                          <div>
                            <p>{new Date(admin.lastLogin).toLocaleDateString()}</p>
                            <p className="text-xs text-neutral-500">
                              {new Date(admin.lastLogin).toLocaleTimeString()}
                            </p>
                          </div>
                        ) : (
                          <span className="text-neutral-400">Never</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <p className="font-medium text-charcoal">{activity.total} actions</p>
                          {activity.recent.length > 0 && (
                            <p className="text-xs text-neutral-500 mt-1">
                              Latest: {activity.recent[0]?.action || 'N/A'}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          admin.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {admin.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResetPassword(admin.adminId)}
                            title="Reset Password"
                            className="text-blue-600 hover:text-blue-800"
                          >
                            <Key size={18} />
                          </button>
                          {admin.isActive ? (
                            <button
                              onClick={() => handleDeactivate(admin.adminId)}
                              title="Deactivate"
                              className="text-red-600 hover:text-red-800"
                            >
                              <EyeOff size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleReactivate(admin.adminId)}
                              title="Reactivate"
                              className="text-green-600 hover:text-green-800"
                            >
                              <Eye size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Activity Logs Panel */}
        {showLogs && (
          <div className="card p-6 mt-6">
            <h3 className="font-heading text-xl font-bold text-charcoal mb-4 flex items-center gap-2">
              <Activity size={24} />
              All Admin Activity Logs
            </h3>
            {logsLoading ? (
              <div className="text-center py-8">
                <div className="spinner mx-auto"></div>
              </div>
            ) : activityLogs.length === 0 ? (
              <p className="text-neutral-500 text-center py-8">No activity logs yet</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activityLogs.map((log, index) => (
                  <div key={index} className="border-l-4 border-blue-500 pl-4 py-2 bg-blue-50 rounded">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <p className="font-medium text-charcoal">
                          {log.action} • {log.module}
                        </p>
                        <p className="text-sm text-neutral-600 mt-1">
                          {log.adminRole && (
                            <span className="inline-block mr-2">
                              {ROLE_ICONS[log.adminRole]} {ROLE_LABELS[log.adminRole]}
                            </span>
                          )}
                          {log.timestamp && new Date(log.timestamp).toLocaleString()}
                        </p>
                        {log.details && (
                          <p className="text-xs text-neutral-500 mt-1">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Info Box */}
        <div className="card p-6 mt-6 bg-yellow-50 border-l-4 border-yellow-500">
          <h3 className="font-heading font-bold mb-2 text-yellow-900 flex items-center gap-2">
            <AlertCircle size={20} />
            Important Notes
          </h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
            <li>Super Admin portal is ONLY for managing admin accounts and monitoring activity</li>
            <li>You do NOT manage content in Events, Gallery, Members, or Posts modules</li>
            <li>Each admin has their own dedicated portal for their role</li>
            <li>All admin actions are logged and can be viewed here</li>
            <li>Share temporary passwords securely with admins</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SuperAdminPortal;
