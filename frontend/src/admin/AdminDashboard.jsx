import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, FileText, Image, LogOut, Settings, 
  Shield, BarChart3, FolderOpen, Key, CheckCircle2, 
  Clock, AlertCircle, TrendingUp, UserCheck, FileCheck,
  Target, Info, BookOpen, Mail, Palette, Network,
  MessageSquare, Megaphone
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import StatsCard from '../components/admin/StatsCard';
import ActivityLog from '../components/admin/ActivityLog';
import { 
  ROLE_LABELS, 
  ROLE_ICONS, 
  ROLE_COLORS,
  PERMISSIONS,
  ADMIN_ROLES
} from '../constants/adminRoles';

const AdminDashboard = () => {
  const { user, adminProfile, token, logout, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, [token]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const dashStats = await adminService.getDashboardStats(token);
      setStats(dashStats.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  // Get role-specific modules based on permissions
  const getAvailableModules = () => {
    if (!adminProfile) return [];
    
    const modules = [];
    const role = adminProfile.adminRole;

    // Super Admin - Only admin management (not content)
    if (role === ADMIN_ROLES.SUPER_ADMIN) {
      modules.push(
        { icon: Shield, label: 'Admin Management', path: '/superadmin', color: 'bg-red-600', description: 'Manage admin accounts and roles' },
        { icon: Settings, label: 'System Security', path: '/admin/manage-security', color: 'bg-red-600', description: 'Configure security settings' },
        { icon: FileText, label: 'Server Logs', path: '/admin/manage-logs', color: 'bg-red-600', description: 'View system logs and backups' },
        { icon: BarChart3, label: 'Reports', path: '/admin/reports', color: 'bg-indigo-600', description: 'View analytics and reports' }
      );
    }
    // Events Admin
    else if (role === ADMIN_ROLES.EVENTS_ADMIN) {
      modules.push(
        { icon: Calendar, label: 'Events Manager', path: '/admin/events', color: 'bg-orange-600', description: 'Create and manage events' },
        { icon: Users, label: 'Volunteers', path: '/admin/volunteers', color: 'bg-orange-600', description: 'Manage volunteer lists' },
        { icon: UserCheck, label: 'Attendance Records', path: '/admin/attendance', color: 'bg-orange-600', description: 'Track event attendance' }
      );
    }
    // Content Admin (Blog Admin)
    else if (role === ADMIN_ROLES.CONTENT_ADMIN) {
      modules.push(
        { icon: FileText, label: 'Blog Manager', path: '/admin/blog', color: 'bg-purple-600', description: 'Create and manage blog posts and news articles' },
        { icon: CheckCircle2, label: 'Approve Posts', path: '/admin/blog?tab=approvals', color: 'bg-purple-600', description: 'Approve member posts' }
      );
    }
    // Gallery Admin
    else if (role === ADMIN_ROLES.GALLERY_ADMIN) {
      modules.push(
        { icon: Image, label: 'Gallery Manager', path: '/admin/gallery', color: 'bg-pink-600', description: 'Upload and manage gallery items' },
        { icon: TrendingUp, label: 'Hero Content', path: '/admin/manage-design', color: 'bg-pink-600', description: 'Manage home page sliders' }
      );
    }
    // Programs Admin
    else if (role === ADMIN_ROLES.PROGRAMS_ADMIN) {
      modules.push(
        { icon: Target, label: 'Programs Manager', path: '/admin/programs', color: 'bg-blue-600', description: 'Manage programs and activities' }
      );
    }
    // About Admin
    else if (role === ADMIN_ROLES.ABOUT_ADMIN) {
      modules.push(
        { icon: Info, label: 'About Page Editor', path: '/admin/manage-about', color: 'bg-indigo-600', description: 'Edit Mission, Vision, Core Values, and Leadership Team' }
      );
    }
    // Resources Admin
    else if (role === ADMIN_ROLES.RESOURCES_ADMIN) {
      modules.push(
        { icon: BookOpen, label: 'Resources Manager', path: '/admin/manage-resources', color: 'bg-emerald-600', description: 'Upload and manage PDFs and documents' }
      );
    }
    // Contact Admin (User Support Admin)
    else if (role === ADMIN_ROLES.CONTACT_ADMIN) {
      modules.push(
        { icon: Mail, label: 'User Support', path: '/admin/support', color: 'bg-cyan-600', description: 'Handle contact form submissions and user queries' }
      );
    }
    // Design Admin (Home Admin)
    else if (role === ADMIN_ROLES.DESIGN_ADMIN) {
      modules.push(
        { icon: Palette, label: 'Home Page Manager', path: '/admin/manage-design', color: 'bg-violet-600', description: 'Manage home page content, hero sections, banners, and design' }
      );
    }

    return modules;
  };

  const adminStats = [
    { 
      icon: Users, 
      label: 'Total Members', 
      value: stats?.totalUsers || 0,
      color: 'bg-blue-600'
    },
    { 
      icon: Calendar, 
      label: 'Events', 
      value: stats?.totalEvents || 0,
      color: 'bg-green-600'
    },
    { 
      icon: FileText, 
      label: 'Posts', 
      value: stats?.totalPosts || 0,
      color: 'bg-purple-600'
    },
    { 
      icon: Users, 
      label: 'Active Admins', 
      value: stats?.activeAdmins || 0,
      color: adminProfile?.adminRole === ADMIN_ROLES.SUPER_ADMIN ? 'bg-red-600' : 'bg-indigo-600'
    }
  ];

  const availableModules = getAvailableModules();
  const roleColor = adminProfile ? ROLE_COLORS[adminProfile.adminRole] : 'bg-neutral-600';

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Header */}
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6 flex justify-between items-center">
          <div>
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              Admin Dashboard
            </h1>
            {adminProfile && (
              <div className="flex items-center gap-2 mt-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${roleColor}`}>
                  {ROLE_ICONS[adminProfile.adminRole]} {ROLE_LABELS[adminProfile.adminRole]}
                </span>
                {adminProfile.department && (
                  <span className="text-neutral-600 text-sm">
                    • {adminProfile.department}
                  </span>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {hasPermission(PERMISSIONS.MANAGE_SECURITY) && (
              <Link to="/admin/security" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
                <Shield size={24} className="text-neutral-600" />
              </Link>
            )}
            <Link to="/admin/settings" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
              <Settings size={24} className="text-neutral-600" />
            </Link>
            <button 
              onClick={() => { logout(); navigate('/'); }}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
            >
              <LogOut size={24} className="text-red-600" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="py-8">
        <div className="container-custom">
          {/* Welcome Message */}
          {adminProfile && (
            <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
              <h2 className="font-heading text-xl font-bold text-charcoal mb-1">
                Welcome, {user?.firstName || user?.name || 'Admin'}!
              </h2>
              <p className="text-neutral-600 text-sm">
                You're logged in as {ROLE_LABELS[adminProfile.adminRole]}. 
                {adminProfile.adminRole === ADMIN_ROLES.SUPER_ADMIN && ' You manage admin accounts and monitor system activity. You do NOT manage content.'}
                {adminProfile.adminRole === ADMIN_ROLES.EVENTS_ADMIN && ' Manage events, upload posters, and track attendance.'}
                {adminProfile.adminRole === ADMIN_ROLES.CONTENT_ADMIN && ' Create and manage news posts and announcements.'}
                {adminProfile.adminRole === ADMIN_ROLES.GALLERY_ADMIN && ' Upload, organize, and manage gallery images.'}
                {adminProfile.adminRole === ADMIN_ROLES.PROGRAMS_ADMIN && ' Manage programs and activities.'}
                {adminProfile.adminRole === ADMIN_ROLES.ABOUT_ADMIN && ' Edit About page content and leadership team.'}
                {adminProfile.adminRole === ADMIN_ROLES.RESOURCES_ADMIN && ' Upload and manage documents and resources.'}
                {adminProfile.adminRole === ADMIN_ROLES.CONTACT_ADMIN && ' Monitor messages and manage contact information.'}
                {adminProfile.adminRole === ADMIN_ROLES.DESIGN_ADMIN && ' Manage home page content, hero sections, banners, and design.'}
              </p>
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {adminStats.map((stat, index) => (
              <StatsCard
                key={index}
                title={stat.label}
                value={stat.value}
                icon={stat.icon}
                color={stat.color}
              />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Available Modules */}
            <div className="lg:col-span-2">
              <div className="card p-6">
                <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
                  Your Modules
                </h3>
                {availableModules.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500">
                    <AlertCircle size={48} className="mx-auto mb-2 opacity-50" />
                    <p>No modules available for your role.</p>
                    <p className="text-sm mt-1">Contact Super Admin to assign permissions.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableModules.map((module, index) => {
                      const IconComponent = module.icon;
                      return (
                        <Link
                          key={index}
                          to={module.path}
                          className="p-4 border-2 border-neutral-200 rounded-lg hover:border-blue-400 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start gap-3">
                            <div className={`p-2 rounded-lg ${module.color} text-white group-hover:scale-110 transition-transform`}>
                              <IconComponent size={24} />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-heading font-bold text-charcoal mb-1 group-hover:text-blue-600 transition-colors">
                                {module.label}
                              </h4>
                              <p className="text-sm text-neutral-600">
                                {module.description}
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Profile Card */}
              {adminProfile && (
                <div className="card p-6">
                  <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
                    Your Profile
                  </h3>
                  <div className="space-y-2 text-sm">
                    <p>
                      <span className="font-medium text-neutral-700">Name:</span>{' '}
                      <span className="text-charcoal">{user?.firstName} {user?.lastName}</span>
                    </p>
                    <p>
                      <span className="font-medium text-neutral-700">Email:</span>{' '}
                      <span className="text-charcoal">{user?.email}</span>
                    </p>
                    {adminProfile.department && (
                      <p>
                        <span className="font-medium text-neutral-700">Department:</span>{' '}
                        <span className="text-charcoal">{adminProfile.department}</span>
                      </p>
                    )}
                    <p>
                      <span className="font-medium text-neutral-700">Last Login:</span>{' '}
                      <span className="text-charcoal">
                        {adminProfile.lastLogin 
                          ? new Date(adminProfile.lastLogin).toLocaleDateString()
                          : 'First login'}
                      </span>
                    </p>
                  </div>
                </div>
              )}

              {/* Quick Actions */}
              <div className="card p-6">
                <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  {hasPermission(PERMISSIONS.MANAGE_MEMBERS) && (
                    <Link to="/admin/members" className="block w-full btn-primary text-center text-sm py-2">
                      View Members
                    </Link>
                  )}
                  {hasPermission(PERMISSIONS.MANAGE_EVENTS) && (
                    <Link to="/admin/events" className="block w-full btn-secondary text-center text-sm py-2">
                      Manage Events
                    </Link>
                  )}
                  {hasPermission(PERMISSIONS.MANAGE_POSTS) && (
                    <Link to="/admin/posts" className="block w-full btn-outline text-center text-sm py-2">
                      Manage Posts
                    </Link>
                  )}
                  {hasPermission(PERMISSIONS.VIEW_REPORTS) && (
                    <Link to="/admin/reports" className="block w-full btn-outline text-center text-sm py-2">
                      View Reports
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {hasPermission(PERMISSIONS.VIEW_LOGS) && (
            <div className="card p-6">
              <h3 className="font-heading text-lg font-bold text-charcoal mb-4">
                Recent Activity
              </h3>
              <ActivityLog 
                activities={stats?.recentActivity || []}
                isLoading={loading}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
