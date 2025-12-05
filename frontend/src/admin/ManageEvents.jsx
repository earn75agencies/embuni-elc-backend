import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Calendar, MapPin, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import { eventService } from '../services/eventService';
import { useAuth } from '../context/AuthContext';
import ProductionImage from '../components/ProductionImage';

const ManageEvents = () => {
  const { token } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
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
    coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
    maxAttendees: '',
    status: 'draft'
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await eventService.getAllEvents({ status: 'all' });
      setEvents(data.events || []);
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
      if (editingEvent) {
        await eventService.updateEvent(token, editingEvent._id, formData);
        toast.success('Event updated successfully');
      } else {
        await eventService.createEvent(token, formData);
        toast.success('Event created successfully');
      }
      setShowModal(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      toast.error('Failed to save event');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await eventService.deleteEvent(token, id);
        toast.success('Event deleted successfully');
        fetchEvents();
      } catch (error) {
        toast.error('Failed to delete event');
      }
    }
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title,
      description: event.description,
      shortDescription: event.shortDescription || '',
      eventType: event.eventType,
      category: event.category,
      startDate: event.startDate?.split('T')[0],
      endDate: event.endDate?.split('T')[0],
      startTime: event.startTime,
      endTime: event.endTime,
      location: event.location,
      coverImage: event.coverImage,
      maxAttendees: event.maxAttendees || '',
      status: event.status
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
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
      maxAttendees: '',
      status: 'draft'
    });
    setEditingEvent(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-charcoal">
            Manage Events
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Create Event
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div key={event._id} className="card overflow-hidden">
                <div className="relative h-48">
                  <ProductionImage
                    src={event.coverImage}
                    alt={event.title}
                    fallbackType="event"
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      event.status === 'published' ? 'bg-green-500 text-white' :
                      event.status === 'draft' ? 'bg-yellow-500 text-white' :
                      'bg-gray-500 text-white'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-heading text-xl font-bold text-charcoal mb-3 line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 mb-4 text-sm text-neutral-600">
                    <div className="flex items-center">
                      <Calendar size={16} className="mr-2 text-primary" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center">
                      <MapPin size={16} className="mr-2 text-primary" />
                      {event.location?.venue}
                    </div>
                    <div className="flex items-center">
                      <Users size={16} className="mr-2 text-primary" />
                      {event.registrationCount || 0} registered
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(event)}
                      className="flex-1 btn-primary py-2 text-sm"
                    >
                      <Edit size={16} className="inline mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(event._id)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Event Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-3xl w-full my-8 p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                {editingEvent ? 'Edit Event' : 'Create New Event'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Event Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Event Type *
                    </label>
                    <select
                      value={formData.eventType}
                      onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
                      className="input-field"
                    >
                      <option value="workshop">Workshop</option>
                      <option value="seminar">Seminar</option>
                      <option value="community-service">Community Service</option>
                      <option value="networking">Networking</option>
                      <option value="training">Training</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="leadership">Leadership</option>
                      <option value="mentorship">Mentorship</option>
                      <option value="service">Service</option>
                      <option value="networking">Networking</option>
                      <option value="skills">Skills</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Description *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows="4"
                    className="input-field resize-none"
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      End Date *
                    </label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Start Time *
                    </label>
                    <input
                      type="time"
                      value={formData.startTime}
                      onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      End Time *
                    </label>
                    <input
                      type="time"
                      value={formData.endTime}
                      onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                      required
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Venue *
                  </label>
                  <input
                    type="text"
                    value={formData.location.venue}
                    onChange={(e) => setFormData({
                      ...formData,
                      location: { ...formData.location, venue: e.target.value }
                    })}
                    required
                    className="input-field"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Max Attendees
                    </label>
                    <input
                      type="number"
                      value={formData.maxAttendees}
                      onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button type="submit" className="btn-primary">
                    {editingEvent ? 'Update Event' : 'Create Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
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
    </div>
  );
};

export default ManageEvents;
