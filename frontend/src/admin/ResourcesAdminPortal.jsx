/**
 * ResourcesAdminPortal - Dedicated portal for Resources Admin
 * 
 * Uploads and manages PDFs, handbooks, guides, and reference documents
 */

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit, Trash2, Upload, Download, FileText, Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ResourcesAdminPortal = () => {
  const { token } = useAuth();
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingResource, setEditingResource] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'handbook', // handbook, constitution, guide, scholarship, reference
    fileUrl: '',
    fileType: 'pdf'
  });

  useEffect(() => {
    // TODO: Fetch resources from API
    setLoading(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: API call
    toast.success(editingResource ? 'Resource updated' : 'Resource added');
    setShowModal(false);
    setEditingResource(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this resource?')) return;
    // TODO: API call
    toast.success('Resource deleted');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'handbook',
      fileUrl: '',
      fileType: 'pdf'
    });
  };

  const categories = {
    handbook: 'Handbook',
    constitution: 'Constitution',
    guide: 'Guide',
    scholarship: 'Scholarship',
    reference: 'Reference'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
                <BookOpen size={32} className="text-emerald-600" />
                Resources Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Upload and manage PDFs, handbooks, guides, and reference documents
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingResource(null); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Resource
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
            <input
              type="text"
              placeholder="Search resources..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral-500">
              <BookOpen size={48} className="mx-auto mb-4 opacity-50" />
              <p>No resources uploaded yet</p>
            </div>
          ) : (
            resources.map((resource) => (
              <div key={resource._id} className="card p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-emerald-100 rounded-lg">
                    <FileText className="text-emerald-600" size={24} />
                  </div>
                  <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                    {categories[resource.category]}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-charcoal mb-2">{resource.title}</h3>
                <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{resource.description}</p>
                <div className="flex gap-2">
                  {resource.fileUrl && (
                    <a
                      href={resource.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-outline flex-1 text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Download
                    </a>
                  )}
                  <button
                    onClick={() => { setEditingResource(resource); setFormData(resource); setShowModal(true); }}
                    className="btn-outline text-sm"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(resource._id)}
                    className="btn-outline text-red-600 text-sm"
                  >
                    <Trash2 size={16} />
                  </button>
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
                {editingResource ? 'Edit Resource' : 'Add New Resource'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Resource Title *"
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
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="handbook">Handbook</option>
                <option value="constitution">Constitution</option>
                <option value="guide">Guide</option>
                <option value="scholarship">Scholarship</option>
                <option value="reference">Reference</option>
              </select>
              <input
                type="url"
                placeholder="File URL (PDF) *"
                className="input-field"
                value={formData.fileUrl}
                onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingResource ? 'Update Resource' : 'Add Resource'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingResource(null); resetForm(); }}
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

export default ResourcesAdminPortal;

