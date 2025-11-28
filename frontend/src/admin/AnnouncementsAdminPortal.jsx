/**
 * AnnouncementsAdminPortal - Dedicated portal for Announcements Admin
 * 
 * Updates and manages important announcements and notifications for the university community.
 */

import React, { useState, useEffect } from 'react';
import { 
  Megaphone, Plus, Edit, Trash2, Search, Filter,
  Calendar, Clock, Eye, EyeOff, AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AnnouncementsAdminPortal = () => {
  const { token } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    type: 'info', // info, warning, urgent, event
    priority: 'normal', // low, normal, high, urgent
    startDate: '',
    endDate: '',
    status: 'draft', // draft, published, archived
    targetAudience: 'all' // all, students, members, public
  });

  useEffect(() => {
    fetchAnnouncements();
  }, [token]);

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call
      // const response = await announcementService.getAnnouncements(token);
      // setAnnouncements(response.data);
      setAnnouncements([]); // Placeholder
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load announcements');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // TODO: Implement API call
      // if (editingAnnouncement) {
      //   await announcementService.updateAnnouncement(token, editingAnnouncement._id, formData);
      //   toast.success('Announcement updated successfully');
      // } else {
      //   await announcementService.createAnnouncement(token, formData);
      //   toast.success('Announcement created successfully');
      // }
      toast.success(editingAnnouncement ? 'Announcement updated' : 'Announcement created');
      setShowModal(false);
      setEditingAnnouncement(null);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save announcement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      // TODO: Implement API call
      // await announcementService.deleteAnnouncement(token, id);
      toast.success('Announcement deleted');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to delete announcement');
    }
  };

  const handlePublish = async (id) => {
    try {
      // TODO: Implement API call
      // await announcementService.updateAnnouncement(token, id, { status: 'published' });
      toast.success('Announcement published');
      fetchAnnouncements();
    } catch (error) {
      toast.error('Failed to publish announcement');
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      type: 'info',
      priority: 'normal',
      startDate: '',
      endDate: '',
      status: 'draft',
      targetAudience: 'all'
    });
  };

  const handleEdit = (announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title || '',
      content: announcement.content || '',
      type: announcement.type || 'info',
      priority: announcement.priority || 'normal',
      startDate: announcement.startDate ? announcement.startDate.split('T')[0] : '',
      endDate: announcement.endDate ? announcement.endDate.split('T')[0] : '',
      status: announcement.status || 'draft',
      targetAudience: announcement.targetAudience || 'all'
    });
    setShowModal(true);
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || announcement.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const typeColors = {
    info: 'bg-blue-100 text-blue-800',
    warning: 'bg-yellow-100 text-yellow-800',
    urgent: 'bg-red-100 text-red-800',
    event: 'bg-green-100 text-green-800'
  };

  const priorityColors = {
    low: 'bg-neutral-100 text-neutral-800',
    normal: 'bg-blue-100 text-blue-800',
    high: 'bg-orange-100 text-orange-800',
    urgent: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Megaphone className="w-8 h-8 text-sky-600" />
                Announcements Management
              </h1>
              <p className="text-neutral-600 mt-2">
                Update and manage important announcements and notifications for the university community
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingAnnouncement(null);
                setShowModal(true);
              }}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Create Announcement
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
        </div>

        {/* Announcements List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
            <p className="mt-4 text-neutral-600">Loading announcements...</p>
          </div>
        ) : filteredAnnouncements.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Megaphone className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No announcements found</h3>
            <p className="text-neutral-600 mb-4">Get started by creating your first announcement</p>
            <button
              onClick={() => {
                resetForm();
                setEditingAnnouncement(null);
                setShowModal(true);
              }}
              className="bg-sky-600 text-white px-4 py-2 rounded-lg hover:bg-sky-700"
            >
              Create Announcement
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAnnouncements.map((announcement) => (
              <div key={announcement._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-neutral-900">{announcement.title}</h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${typeColors[announcement.type] || 'bg-neutral-100'}`}>
                        {announcement.type}
                      </span>
                      <span className={`px-2 py-1 text-xs rounded-full ${priorityColors[announcement.priority] || 'bg-neutral-100'}`}>
                        {announcement.priority}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3 line-clamp-2">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500">
                      {announcement.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>Start: {new Date(announcement.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      {announcement.endDate && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          <span>End: {new Date(announcement.endDate).toLocaleDateString()}</span>
                        </div>
                      )}
                      <span className="capitalize">Audience: {announcement.targetAudience}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    {announcement.status === 'draft' && (
                      <button
                        onClick={() => handlePublish(announcement._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Publish"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(announcement)}
                      className="p-2 text-neutral-600 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(announcement._id)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    announcement.status === 'published' ? 'bg-green-100 text-green-800' :
                    announcement.status === 'draft' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-neutral-100 text-neutral-800'
                  }`}>
                    {announcement.status}
                  </span>
                  <span className="text-xs text-neutral-500">
                    Created: {new Date(announcement.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b">
                <h2 className="text-2xl font-bold text-neutral-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Create New Announcement'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter announcement title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Content *</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={5}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    placeholder="Enter announcement content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="info">Info</option>
                      <option value="warning">Warning</option>
                      <option value="urgent">Urgent</option>
                      <option value="event">Event</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Priority *</label>
                    <select
                      required
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="low">Low</option>
                      <option value="normal">Normal</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">End Date</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Target Audience</label>
                    <select
                      value={formData.targetAudience}
                      onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="all">All</option>
                      <option value="students">Students</option>
                      <option value="members">Members</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingAnnouncement(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                  >
                    {editingAnnouncement ? 'Update' : 'Create'} Announcement
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnnouncementsAdminPortal;

