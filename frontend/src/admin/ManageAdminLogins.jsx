import React, { useState, useEffect } from 'react';
import { Plus, Key, Trash2, RefreshCw, Copy, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { adminCredentialService } from '../services/adminCredentialService';
import { ROLE_LABELS, ROLE_ICONS } from '../constants/adminRoles';
import { toast } from 'react-toastify';

/**
 * ManageAdminLogins - Super Admin interface for assigning login credentials
 */
const ManageAdminLogins = () => {
  const { token } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const [tempPassword, setTempPassword] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    password: ''
  });
  const [assignData, setAssignData] = useState({
    userId: '',
    adminRole: 'events_admin'
  });

  useEffect(() => {
    loadAdmins();
  }, [token]);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const response = await adminCredentialService.getAllAdminLogins(token);
      setAdmins(response.data);
    } catch (error) {
      toast.error('Failed to load admin logins');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAdmin = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.firstName || !formData.lastName || !formData.password) {
      toast.error('All fields are required');
      return;
    }

    try {
      const response = await adminCredentialService.createAdminLogin(token, formData);
      
      // Show temp password alert
      setTempPassword(response.data);
      setFormData({ email: '', firstName: '', lastName: '', password: '' });
      setShowCreateForm(false);
      
      toast.success('Admin login created successfully');
      loadAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create admin login');
    }
  };

  const handleAssignRole = async (e) => {
    e.preventDefault();

    if (!assignData.userId || !assignData.adminRole) {
      toast.error('Please select user and role');
      return;
    }

    try {
      await adminCredentialService.assignAdminRole(token, assignData);
      setAssignData({ userId: '', adminRole: 'events_admin' });
      setShowAssignForm(false);
      toast.success('Admin role assigned successfully');
      loadAdmins();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to assign role');
    }
  };

  const handleResetPassword = async (adminId) => {
    if (!window.confirm('Generate new temporary password for this admin?')) return;

    try {
      const response = await adminCredentialService.resetAdminPassword(token, adminId);
      setTempPassword(response.data);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error('Failed to reset password');
    }
  };

  const handleDeactivate = async (adminId) => {
    if (!window.confirm('Deactivate this admin account?')) return;

    try {
      await adminCredentialService.deactivateAdminCredentials(token, adminId);
      toast.success('Admin deactivated');
      loadAdmins();
    } catch (error) {
      toast.error('Failed to deactivate admin');
    }
  };

  const handleReactivate = async (adminId) => {
    if (!window.confirm('Reactivate this admin account?')) return;

    try {
      await adminCredentialService.reactivateAdminCredentials(token, adminId);
      toast.success('Admin reactivated');
      loadAdmins();
    } catch (error) {
      toast.error('Failed to reactivate admin');
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Temporary Password Alert */}
      {tempPassword && (
        <div className="bg-green-100 border-l-4 border-green-600 p-4 rounded">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-heading font-bold text-green-800 mb-2">Temporary Password Generated</h3>
              <p className="text-green-700 text-sm mb-3">
                <strong>Email:</strong> {tempPassword.adminEmail}
              </p>
              <div className="flex items-center gap-2 bg-white p-3 rounded border border-green-300">
                <code className="text-sm font-mono">{tempPassword.temporaryPassword}</code>
                <button
                  onClick={() => copyToClipboard(tempPassword.temporaryPassword, 'password')}
                  className="text-green-600 hover:text-green-700"
                >
                  {copiedId === 'password' ? (
                    <Check size={18} />
                  ) : (
                    <Copy size={18} />
                  )}
                </button>
              </div>
              <p className="text-green-700 text-xs mt-2 italic">{tempPassword.note}</p>
            </div>
            <button
              onClick={() => setTempPassword(null)}
              className="text-green-600 hover:text-green-700 font-bold"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          Create New Admin Login
        </button>
        <button
          onClick={() => setShowAssignForm(!showAssignForm)}
          className="btn-secondary flex items-center gap-2"
        >
          <Key size={20} />
          Assign Role to User
        </button>
        <button
          onClick={loadAdmins}
          className="btn-outline flex items-center gap-2"
        >
          <RefreshCw size={20} />
          Refresh
        </button>
      </div>

      {/* Create Admin Form */}
      {showCreateForm && (
        <div className="card p-6 bg-blue-50 border-2 border-blue-200">
          <h3 className="font-heading font-bold text-lg mb-4">Create New Admin Login</h3>
          <form onSubmit={handleCreateAdmin} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="First Name"
                className="input-field"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              />
              <input
                type="text"
                placeholder="Last Name"
                className="input-field"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              />
            </div>
            <input
              type="email"
              placeholder="Email Address"
              className="input-field"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <input
              type="password"
              placeholder="Initial Password (min 8 characters)"
              className="input-field"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            />
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Create Login</button>
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

      {/* Assign Role Form */}
      {showAssignForm && (
        <div className="card p-6 bg-purple-50 border-2 border-purple-200">
          <h3 className="font-heading font-bold text-lg mb-4">Assign Admin Role</h3>
          <form onSubmit={handleAssignRole} className="space-y-4">
            <input
              type="text"
              placeholder="User ID"
              className="input-field"
              value={assignData.userId}
              onChange={(e) => setAssignData({ ...assignData, userId: e.target.value })}
            />
            <select
              className="input-field"
              value={assignData.adminRole}
              onChange={(e) => setAssignData({ ...assignData, adminRole: e.target.value })}
            >
              <option value="super_admin">👑 Super Admin</option>
              <option value="design_admin">🏠 Home Admin</option>
              <option value="about_admin">ℹ️ About Admin</option>
              <option value="programs_admin">🎯 Programs Admin</option>
              <option value="events_admin">📅 Events Admin</option>
              <option value="content_admin">📝 News Admin</option>
              <option value="gallery_admin">🖼️ Gallery Admin</option>
              <option value="resources_admin">📚 Resources Admin</option>
              <option value="contact_admin">📧 Contact Admin</option>
            </select>
            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Assign Role</button>
              <button
                type="button"
                onClick={() => setShowAssignForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Admin Logins Table */}
      <div className="card overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-neutral-200 bg-neutral-50">
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Admin</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Email</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Role</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Department</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Last Login</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Status</th>
              <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-neutral-500">
                  No admin logins created yet
                </td>
              </tr>
            ) : (
              admins.map((admin) => (
                <tr key={admin.adminId} className="border-b border-neutral-100 hover:bg-neutral-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-charcoal">{admin.name}</p>
                      <p className="text-xs text-neutral-500">{admin.userId}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm">{admin.email}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                      {ROLE_ICONS[admin.adminRole]} {ROLE_LABELS[admin.adminRole]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">{admin.department}</td>
                  <td className="px-6 py-4 text-sm">
                    {admin.lastLogin
                      ? new Date(admin.lastLogin).toLocaleDateString()
                      : 'Never'}
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
                  <td className="px-6 py-4 text-sm">
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
                          <Trash2 size={18} />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleReactivate(admin.adminId)}
                          title="Reactivate"
                          className="text-green-600 hover:text-green-800"
                        >
                          <RefreshCw size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Help Section */}
      <div className="card p-6 bg-yellow-50 border-l-4 border-yellow-500">
        <h3 className="font-heading font-bold mb-3 text-yellow-900">How to Assign Admin Logins</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-800">
          <li><strong>Create New Admin:</strong> Click "Create New Admin Login" to create new login credentials from scratch</li>
          <li><strong>Assign Role:</strong> Click "Assign Role to User" to give admin privileges to an existing user</li>
          <li><strong>Reset Password:</strong> Click the key icon to generate a temporary password for any admin</li>
          <li><strong>Manage Status:</strong> Deactivate admins when they leave, reactivate if they return</li>
          <li><strong>Share Credentials:</strong> Use the copy button to safely copy temporary passwords</li>
        </ol>
      </div>
    </div>
  );
};

export default ManageAdminLogins;
