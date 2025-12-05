import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Image as ImageIcon, Filter } from 'lucide-react';
import { toast } from 'react-toastify';
import { galleryService } from '../services/galleryService';
import { useAuth } from '../context/AuthContext';
import ProductionImage from '../components/ProductionImage';

const ManageGallery = () => {
  const { token } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    imageFile: null,
    category: 'event',
    location: '',
    dateTaken: '',
    tags: '',
    isFeatured: false
  });

  useEffect(() => {
    fetchGalleryItems();
  }, []);

  const fetchGalleryItems = async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAllItems();
      setItems(data.items || []);
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
      // Validate that either imageFile or imageUrl is provided
      if (!formData.imageFile && !formData.imageUrl) {
        toast.error('Please provide either an image file or image URL');
        return;
      }

      // Prepare FormData if file is selected, otherwise use JSON
      let dataToSubmit;
      if (formData.imageFile) {
        const formDataToSend = new FormData();
        formDataToSend.append('image', formData.imageFile);
        formDataToSend.append('title', formData.title);
        formDataToSend.append('description', formData.description);
        formDataToSend.append('category', formData.category);
        if (formData.location) formDataToSend.append('location', formData.location);
        if (formData.dateTaken) formDataToSend.append('dateTaken', formData.dateTaken);
        if (formData.tags) {
          const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(Boolean);
          formDataToSend.append('tags', JSON.stringify(tagsArray));
        }
        formDataToSend.append('isFeatured', formData.isFeatured);
        dataToSubmit = formDataToSend;
      } else {
        dataToSubmit = {
          ...formData,
          tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
          imageFile: undefined // Remove file reference
        };
      }
      await galleryService.createItem(token, dataToSubmit, formData.imageFile);
      toast.success('Gallery item added successfully');
      setShowModal(false);
      resetForm();
      fetchGalleryItems();
    } catch (error) {
      toast.error('Failed to add gallery item');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this gallery item?')) {
      try {
        await galleryService.deleteItem(token, id);
        toast.success('Gallery item deleted successfully');
        fetchGalleryItems();
      } catch (error) {
        toast.error('Failed to delete gallery item');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      imageUrl: '',
      imageFile: null,
      category: 'event',
      location: '',
      dateTaken: '',
      tags: '',
      isFeatured: false
    });
  };

  const filteredItems = filterCategory === 'all' 
    ? items 
    : items.filter(item => item.category === filterCategory);

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-charcoal">
            Manage Gallery
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Image
          </button>
        </div>

        {/* Filter */}
        <div className="card p-6 mb-8">
          <div className="flex items-center space-x-4">
            <Filter size={20} className="text-neutral-600" />
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="input-field max-w-xs"
            >
              <option value="all">All Categories</option>
              <option value="event">Events</option>
              <option value="community-service">Community Service</option>
              <option value="training">Training</option>
              <option value="social">Social</option>
              <option value="achievement">Achievements</option>
            </select>
            <div className="text-sm text-neutral-600">
              Total: <span className="font-bold">{filteredItems.length}</span> images
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredItems.map((item) => (
              <div key={item._id} className="card overflow-hidden group">
                <div className="relative aspect-square">
                  <ProductionImage
                    src={item.imageUrl}
                    alt={item.title}
                    fallbackType="gallery"
                    width={400}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  {item.isFeatured && (
                    <div className="absolute top-2 right-2 bg-accent-yellow text-charcoal px-2 py-1 rounded-full text-xs font-bold">
                      Featured
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="w-full btn-primary bg-red-600 hover:bg-red-700 text-sm py-2"
                    >
                      <Trash2 size={16} className="inline mr-2" />
                      Delete
                    </button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-charcoal mb-1 line-clamp-1">
                    {item.title}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-neutral-500">
                    <span className="capitalize">{item.category}</span>
                    <span>{new Date(item.dateTaken).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Image Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                Add New Image
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Image title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
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
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.imageFile.name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      imageUrl: e.target.value,
                      imageFile: null // Clear file if URL is entered
                    })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  {(formData.imageUrl || formData.imageFile) && (
                    <div className="mt-3">
                      <ProductionImage
                        src={formData.imageFile ? URL.createObjectURL(formData.imageFile) : formData.imageUrl}
                        alt="Preview"
                        fallbackType="gallery"
                        width={400}
                        height={300}
                        className="w-full h-48 object-cover rounded-lg"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows="3"
                    className="input-field resize-none"
                    placeholder="Brief description..."
                  ></textarea>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="event">Event</option>
                      <option value="community-service">Community Service</option>
                      <option value="training">Training</option>
                      <option value="social">Social</option>
                      <option value="achievement">Achievement</option>
                      <option value="general">General</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Date Taken
                    </label>
                    <input
                      type="date"
                      value={formData.dateTaken}
                      onChange={(e) => setFormData({ ...formData, dateTaken: e.target.value })}
                      className="input-field"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="input-field"
                    placeholder="e.g., Main Campus Hall"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                    className="input-field"
                    placeholder="leadership, workshop, 2024"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-semibold text-charcoal">
                    Feature this image
                  </label>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button type="submit" className="btn-primary">
                    Add Image
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

export default ManageGallery;
