/**
 * EventsAdminPortal - Dedicated portal for Events Coordinator Admin
 * 
 * This portal is ONLY for managing events.
 * Events Admin cannot access other modules (Members, Posts, Gallery).
 * 
 * Features:
 * - Create, edit, delete events
 * - Publish/unpublish events
 * - View event attendance and participation stats
 * - Manage event schedules
 * - Upload event materials
 */

import React, { useState, useEffect } from 'react';
import { 
  Calendar, Plus, Edit, Trash2, Eye, EyeOff, 
  Users, MapPin, Clock, TrendingUp, BarChart3,
  CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { toast } from 'react-toastify';

const EventsAdminPortal = () => {
  const { token, adminProfile } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0,
    upcoming: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    shortDescription: '',
    eventType: 'workshop',
    category: 'leadership',
    startDate: '',
    endDate: '',
    startTime: '',
    endTime: '',
    location: {
      venue: '',
      address: '',
      isVirtual: false,
      virtualLink: ''
    },
    coverImage: '',
    coverImageFile: null,
    maxAttendees: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEvents();
  }, [token]);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents({ status: 'all' });
      const eventsList = data.events || [];
      setEvents(eventsList);
      
      // Calculate stats
      setStats({
        total: eventsList.length,
        published: eventsList.filter(e => e.status === 'published').length,
        draft: eventsList.filter(e => e.status === 'draft').length,
        upcoming: eventsList.filter(e => {
          const eventDate = new Date(e.startDate);
          return eventDate > new Date() && e.status === 'published';
        }).length
      });
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare FormData if file is selected, otherwise use JSON
      let dataToSend;
      const formDataToSend = new FormData();
      
      if (formData.coverImageFile) {
        // Use FormData for file upload
        formDataToSend.append('coverImage', formData.coverImageFile);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('shortDescription', formData.shortDescription);
        formDataToSend.append('eventType', formData.eventType);
        formDataToSend.append('category', formData.category);
        formDataToSend.append('startDate', formData.startDate);
        if (formData.endDate) formDataToSend.append('endDate', formData.endDate);
        formDataToSend.append('startTime', formData.startTime);
        if (formData.endTime) formDataToSend.append('endTime', formData.endTime);
        formDataToSend.append('location', JSON.stringify(formData.location));
        if (formData.maxAttendees) formDataToSend.append('maxAttendees', formData.maxAttendees);
        formDataToSend.append('status', formData.status);
        dataToSend = formDataToSend;
      } else {
        // Use regular JSON (no file upload)
        dataToSend = {
          ...formData,
          coverImageFile: undefined // Remove file reference
        };
      }

      if (editingEvent) {
        await eventService.updateEvent(token, editingEvent._id, dataToSend, formData.coverImageFile);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(token, dataToSend, formData.coverImageFile);
        toast.success('Event created successfully');
      }
      setShowModal(false);
      setEditingEvent(null);
      resetForm();
      fetchEvents();
    } catch (error) {
      const errorMessage = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).join(', ')
        : error.response?.data?.message || 'Failed to save event';
      toast.error(errorMessage);
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    
    try {
      await eventService.deleteEvent(token, eventId);
      toast.success('Event deleted successfully');
      fetchEvents();
    } catch (error) {
      toast.error('Failed to delete event');
    }
  };

  const handleToggleStatus = async (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await eventService.updateEvent(token, event._id, { status: newStatus });
      toast.success(`Event ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchEvents();
    } catch (error) {
      toast.error('Failed to update event status');
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      shortDescription: event.shortDescription || '',
      eventType: event.eventType || 'workshop',
      category: event.category || 'leadership',
      startDate: event.startDate ? event.startDate.split('T')[0] : '',
      endDate: event.endDate ? event.endDate.split('T')[0] : '',
      startTime: event.startTime || '',
      endTime: event.endTime || '',
      location: event.location || {
        venue: '',
        address: '',
        isVirtual: false,
        virtualLink: ''
      },
      coverImage: event.coverImage || '',
      coverImageFile: null,
      maxAttendees: event.maxAttendees || '',
      status: event.status || 'draft'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      shortDescription: '',
      eventType: 'workshop',
      category: 'leadership',
      startDate: '',
      endDate: '',
      startTime: '',
      endTime: '',
      location: {
        venue: '',
        address: '',
        isVirtual: false,
        virtualLink: ''
      },
      coverImage: '',
      coverImageFile: null,
      maxAttendees: '',
      status: 'draft'
    });
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || event.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                <Calendar size={32} className="text-orange-600" />
                Events Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Create, manage, and track chapter events
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingEvent(null); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Event
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Events</p>
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
              </div>
              <Calendar className="text-orange-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Upcoming</p>
                <p className="text-3xl font-bold text-blue-600">{stats.upcoming}</p>
              </div>
              <TrendingUp className="text-blue-600" size={32} />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                placeholder="Search events..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field md:w-48"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No events found</p>
            </div>
          ) : (
            filteredEvents.map((event) => (
              <div key={event._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                {event.coverImage && (
                  <img 
                    src={event.coverImage} 
                    alt={event.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading text-lg font-bold text-charcoal flex-1">
                      {event.title}
                    </h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      event.status === 'published' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
                    {event.shortDescription || event.description}
                  </p>
                  <div className="space-y-2 mb-4 text-sm text-neutral-600">
                    {event.startDate && (
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        {new Date(event.startDate).toLocaleDateString()}
                        {event.startTime && ` at ${event.startTime}`}
                      </div>
                    )}
                    {event.location?.venue && (
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        {event.location.venue}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="btn-outline flex-1 text-sm py-2"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleToggleStatus(event)}
                      className={`btn-outline text-sm py-2 ${
                        event.status === 'published' ? 'text-yellow-600' : 'text-green-600'
                      }`}
                    >
                      {event.status === 'published' ? (
                        <><EyeOff size={16} /> Unpublish</>
                      ) : (
                        <><Eye size={16} /> Publish</>
                      )}
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="btn-outline text-red-600 text-sm py-2"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Event Title *"
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Short Description *"
                className="input-field"
                rows={2}
                value={formData.shortDescription}
                onChange={(e) => setFormData({ ...formData, shortDescription: e.target.value })}
                required
              />
              <textarea
                placeholder="Full Description *"
                className="input-field"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input-field"
                  value={formData.eventType}
                  onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                >
                  <option value="workshop">Workshop</option>
                  <option value="seminar">Seminar</option>
                  <option value="conference">Conference</option>
                  <option value="networking">Networking</option>
                </select>
                <input
                  type="date"
                  className="input-field"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="time"
                  className="input-field"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                />
                <input
                  type="time"
                  className="input-field"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                />
              </div>
              <input
                type="text"
                placeholder="Venue"
                className="input-field"
                value={formData.location.venue}
                onChange={(e) => setFormData({
                  ...formData,
                  location: { ...formData.location, venue: e.target.value }
                })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Cover Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ 
                        ...formData, 
                        coverImageFile: file,
                        coverImage: '' // Clear URL if file is selected
                      });
                    }
                  }}
                />
                {formData.coverImageFile && (
                  <p className="text-sm text-green-600">
                    Selected: {formData.coverImageFile.name}
                  </p>
                )}
                <p className="text-xs text-neutral-500">Or enter image URL:</p>
                <input
                  type="url"
                  placeholder="Cover Image URL (optional)"
                  className="input-field"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    coverImage: e.target.value,
                    coverImageFile: null // Clear file if URL is entered
                  })}
                />
                {formData.coverImage && !formData.coverImageFile && (
                  <img 
                    src={formData.coverImage} 
                    alt="Preview" 
                    className="mt-2 w-full h-32 object-cover rounded"
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                )}
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingEvent(null); resetForm(); }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsAdminPortal;
