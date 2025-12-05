/**
 * TestimonialsAdminPortal - Dedicated portal for Testimonials Admin
 * 
 * Collects, verifies, and publishes testimonials from students, alumni, or partners.
 */

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Plus, Edit, Trash2, Search, Filter,
  CheckCircle2, XCircle, Clock, User, Star
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { testimonialService } from '../services/testimonialService';

const TestimonialsAdminPortal = () => {
  const { token } = useAuth();
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [formData, setFormData] = useState({
    authorName: '',
    authorRole: '', // student, alumni, partner, faculty
    authorImage: '',
    authorImageFile: null,
    content: '',
    rating: 5,
    status: 'pending', // pending, approved, rejected
    featured: false
  });

  useEffect(() => {
    fetchTestimonials();
  }, [token]);

  const fetchTestimonials = async () => {
    try {
      setLoading(true);
      const response = await testimonialService.getTestimonials(token, {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
      setTestimonials(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load testimonials');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTestimonial) {
        await testimonialService.updateTestimonial(token, editingTestimonial._id, formData);
        toast.success('Testimonial updated successfully');
      } else {
        await testimonialService.createTestimonial(token, formData);
        toast.success('Testimonial created successfully');
      }
      setShowModal(false);
      setEditingTestimonial(null);
      resetForm();
      fetchTestimonials();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save testimonial');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this testimonial?')) return;
    try {
      await testimonialService.deleteTestimonial(token, id);
      toast.success('Testimonial deleted');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to delete testimonial');
    }
  };

  const handleApprove = async (id) => {
    try {
      await testimonialService.updateTestimonial(token, id, { status: 'approved' });
      toast.success('Testimonial approved');
      fetchTestimonials();
    } catch (error) {
      toast.error('Failed to approve testimonial');
    }
  };

  const resetForm = () => {
    setFormData({
      authorName: '',
      authorRole: '',
      authorImage: '',
      authorImageFile: null,
      content: '',
      rating: 5,
      status: 'pending',
      featured: false
    });
  };

  const handleEdit = (testimonial) => {
    setEditingTestimonial(testimonial);
    setFormData({
      authorName: testimonial.authorName || '',
      authorRole: testimonial.authorRole || '',
      authorImage: testimonial.authorImage || '',
      authorImageFile: null,
      content: testimonial.content || '',
      rating: testimonial.rating || 5,
      status: testimonial.status || 'pending',
      featured: testimonial.featured || false
    });
    setShowModal(true);
  };

  const filteredTestimonials = testimonials.filter(testimonial => {
    const matchesSearch = testimonial.authorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         testimonial.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || testimonial.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const authorRoles = {
    student: 'Student',
    alumni: 'Alumni',
    partner: 'Partner',
    faculty: 'Faculty'
  };

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <MessageSquare className="w-8 h-8 text-rose-600" />
                Testimonials Management
              </h1>
              <p className="text-neutral-600 mt-2">
                Collect, verify, and publish testimonials from students, alumni, or partners
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingTestimonial(null);
                setShowModal(true);
              }}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Testimonial
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
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Testimonials List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-rose-600"></div>
            <p className="mt-4 text-neutral-600">Loading testimonials...</p>
          </div>
        ) : filteredTestimonials.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <MessageSquare className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No testimonials found</h3>
            <p className="text-neutral-600 mb-4">Get started by adding your first testimonial</p>
            <button
              onClick={() => {
                resetForm();
                setEditingTestimonial(null);
                setShowModal(true);
              }}
              className="bg-rose-600 text-white px-4 py-2 rounded-lg hover:bg-rose-700"
            >
              Add Testimonial
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredTestimonials.map((testimonial) => (
              <div key={testimonial._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3 flex-1">
                    {testimonial.authorImage ? (
                      <img src={testimonial.authorImage} alt={testimonial.authorName} className="w-12 h-12 rounded-full object-cover" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center">
                        <User className="w-6 h-6 text-rose-600" />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-neutral-900">{testimonial.authorName}</h3>
                      <p className="text-sm text-neutral-600">{authorRoles[testimonial.authorRole] || testimonial.authorRole}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {testimonial.status === 'pending' && (
                      <button
                        onClick={() => handleApprove(testimonial._id)}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                        title="Approve"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(testimonial)}
                      className="p-2 text-neutral-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(testimonial._id)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex items-center gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < testimonial.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-neutral-700 italic">"{testimonial.content}"</p>
                </div>
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-1 text-xs rounded-full ${statusColors[testimonial.status] || 'bg-neutral-100'}`}>
                    {testimonial.status}
                  </span>
                  {testimonial.featured && (
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                      Featured
                    </span>
                  )}
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
                  {editingTestimonial ? 'Edit Testimonial' : 'Add New Testimonial'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Author Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.authorName}
                      onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Author Role *</label>
                    <select
                      required
                      value={formData.authorRole}
                      onChange={(e) => setFormData({ ...formData, authorRole: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="">Select role</option>
                      {Object.entries(authorRoles).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Author Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ 
                          ...formData, 
                          authorImageFile: file,
                          authorImage: '' // Clear URL if file is selected
                        });
                      }
                    }}
                  />
                  {formData.authorImageFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.authorImageFile.name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                  <input
                    type="url"
                    value={formData.authorImage}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      authorImage: e.target.value,
                      authorImageFile: null // Clear file if URL is entered
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="https://example.com/photo.jpg"
                  />
                  {(formData.authorImage || formData.authorImageFile) && (
                    <div className="mt-3">
                      <img
                        src={formData.authorImageFile ? URL.createObjectURL(formData.authorImageFile) : formData.authorImage}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded-full"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Rating *</label>
                  <div className="flex items-center gap-2">
                    {[...Array(5)].map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData({ ...formData, rating: i + 1 })}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            i < formData.rating ? 'text-yellow-400 fill-current' : 'text-neutral-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-neutral-600">{formData.rating} / 5</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Testimonial Content *</label>
                  <textarea
                    required
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    placeholder="Enter the testimonial text..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-rose-500"
                    >
                      <option value="pending">Pending</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.featured}
                        onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                        className="w-4 h-4 text-rose-600 rounded focus:ring-rose-500"
                      />
                      <span className="text-sm text-neutral-700">Featured Testimonial</span>
                    </label>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingTestimonial(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    {editingTestimonial ? 'Update' : 'Create'} Testimonial
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

export default TestimonialsAdminPortal;

