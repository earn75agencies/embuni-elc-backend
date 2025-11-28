/**
 * GalleryAdminPortal - Dedicated portal for Gallery Admin
 * 
 * This portal is ONLY for managing gallery images.
 * Gallery Admin cannot access other modules (Events, Members, Posts).
 * 
 * Features:
 * - Upload images to gallery
 * - Edit, delete gallery items
 * - Tag and caption images
 * - Organize gallery content
 */

import React, { useState, useEffect } from 'react';
import { 
  Image, Plus, Edit, Trash2, Upload, Tag, 
  Search, Filter, Grid, List, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { galleryService } from '../services/galleryService';
import { toast } from 'react-toastify';

const GalleryAdminPortal = () => {
  const { token } = useAuth();
  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    tags: '',
    category: 'general'
  });

  useEffect(() => {
    fetchGalleryItems();
  }, [token]);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAllGalleryItems();
      setGalleryItems(data.items || []);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      toast.error('Failed to load gallery items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Prepare FormData if file is selected, otherwise use JSON
      let dataToSend;
      if (formData.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', formData.imageFile);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        if (formData.tags) formDataToSend.append('tags', formData.tags);
        formDataToSend.append('category', formData.category);
        dataToSend = formDataToSend;
      } else {
        dataToSend = {
          ...formData,
          imageFile: undefined // Remove file reference
        };
      }

      if (editingItem) {
        await galleryService.updateGalleryItem(token, editingItem._id, dataToSend, formData.imageFile);
        toast.success('Gallery item updated successfully');
      } else {
        await galleryService.createGalleryItem(token, dataToSend, formData.imageFile);
        toast.success('Gallery item created successfully');
      }
      setShowModal(false);
      setEditingItem(null);
      resetForm();
      fetchGalleryItems();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save gallery item');
    }
  };

  const handleDelete = async (itemId) => {
    if (!window.confirm('Are you sure you want to delete this gallery item?')) return;
    
    try {
      await galleryService.deleteGalleryItem(token, itemId);
      toast.success('Gallery item deleted successfully');
      fetchGalleryItems();
    } catch (error) {
      toast.error('Failed to delete gallery item');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      title: item.title || '',
      description: item.description || '',
      imageUrl: item.imageUrl || '',
      imageFile: null,
      tags: item.tags?.join(', ') || '',
      category: item.category || 'general'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      tags: '',
      category: 'general'
    });
  };

  const filteredItems = galleryItems.filter(item =>
    item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
                <Image size={32} className="text-purple-600" />
                Gallery Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Upload, organize, and manage gallery images
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingItem(null); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Upload Image
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Images</p>
                <p className="text-3xl font-bold text-charcoal">{galleryItems.length}</p>
              </div>
              <Image className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Categories</p>
                <p className="text-3xl font-bold text-charcoal">
                  {new Set(galleryItems.map(item => item.category)).size}
                </p>
              </div>
              <Tag className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Tags</p>
                <p className="text-3xl font-bold text-charcoal">
                  {new Set(galleryItems.flatMap(item => item.tags || [])).size}
                </p>
              </div>
              <Tag className="text-purple-600" size={32} />
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
                placeholder="Search by title or tags..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-neutral-200'}`}
              >
                <Grid size={20} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-neutral-200'}`}
              >
                <List size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Gallery Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredItems.length === 0 ? (
              <div className="col-span-full text-center py-12 text-neutral-500">
                <Image size={48} className="mx-auto mb-4 opacity-50" />
                <p>No gallery items found</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} className="card overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-neutral-100">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={48} className="text-neutral-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="bg-white p-2 rounded shadow hover:bg-blue-50"
                      >
                        <Edit size={16} className="text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(item._id)}
                        className="bg-white p-2 rounded shadow hover:bg-red-50"
                      >
                        <Trash2 size={16} className="text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-charcoal mb-1 line-clamp-1">
                      {item.title}
                    </h3>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {item.tags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredItems.length === 0 ? (
              <div className="text-center py-12 text-neutral-500">
                <Image size={48} className="mx-auto mb-4 opacity-50" />
                <p>No gallery items found</p>
              </div>
            ) : (
              filteredItems.map((item) => (
                <div key={item._id} className="card p-4 flex gap-4">
                  <div className="w-32 h-32 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Image size={32} className="text-neutral-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-charcoal mb-1">{item.title}</h3>
                    <p className="text-sm text-neutral-600 mb-2 line-clamp-2">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {item.tags.map((tag, idx) => (
                          <span key={idx} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(item)}
                      className="btn-outline"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="btn-outline text-red-600"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {editingItem ? 'Edit Gallery Item' : 'Upload New Image'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Image Title *"
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                className="input-field"
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
              <div className="space-y-2">
                <label className="block text-sm font-medium text-neutral-700">
                  Image *
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
                        imageFile: file,
                        imageUrl: '' // Clear URL if file is selected
                      });
                    }
                  }}
                />
                {formData.imageFile && (
                  <p className="text-sm text-green-600">
                    Selected: {formData.imageFile.name}
                  </p>
                )}
                <p className="text-xs text-neutral-500">Or enter image URL:</p>
                <input
                  type="url"
                  placeholder="Image URL (optional)"
                  className="input-field"
                  value={formData.imageUrl}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    imageUrl: e.target.value,
                    imageFile: null // Clear file if URL is entered
                  })}
                />
                {(formData.imageUrl || formData.imageFile) && (
                  <div className="mt-2">
                    <img 
                      src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl} 
                      alt="Preview" 
                      className="w-full h-48 object-cover rounded"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                className="input-field"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="general">General</option>
                <option value="events">Events</option>
                <option value="members">Members</option>
                <option value="activities">Activities</option>
              </select>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingItem ? 'Update' : 'Upload'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingItem(null); resetForm(); }}
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

export default GalleryAdminPortal;
