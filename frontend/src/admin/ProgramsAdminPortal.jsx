/**
 * ProgramsAdminPortal - Dedicated portal for Programs Admin
 * 
 * Manages programs and activities: Mentorship, Leadership Workshops, Community Service Projects
 */

import React, { useState, useEffect } from 'react';
import { 
  Target, Plus, Edit, Trash2, Search, BookOpen,
  Users, Award, Heart
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const ProgramsAdminPortal = () => {
  const { token } = useAuth();
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProgram, setEditingProgram] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'mentorship', // mentorship, leadership, community_service
    requirements: '',
    outcomes: '',
    status: 'active'
  });

  useEffect(() => {
    // TODO: Fetch programs from API
    setLoading(false);
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // TODO: Implement API call
    toast.success(editingProgram ? 'Program updated' : 'Program created');
    setShowModal(false);
    setEditingProgram(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this program?')) return;
    // TODO: Implement API call
    toast.success('Program deleted');
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: 'mentorship',
      requirements: '',
      outcomes: '',
      status: 'active'
    });
  };

  const programCategories = {
    mentorship: { icon: Users, label: 'Mentorship', color: 'bg-blue-600' },
    leadership: { icon: Award, label: 'Leadership Workshops', color: 'bg-purple-600' },
    community_service: { icon: Heart, label: 'Community Service', color: 'bg-green-600' }
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
                <Target size={32} className="text-blue-600" />
                Programs Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Manage Mentorship, Leadership Workshops, and Community Service Projects
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingProgram(null); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Add Program
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
              placeholder="Search programs..."
              className="input-field pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {programs.length === 0 ? (
            <div className="col-span-full text-center py-12 text-neutral-500">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p>No programs added yet</p>
            </div>
          ) : (
            programs.map((program) => {
              const category = programCategories[program.category] || programCategories.mentorship;
              const IconComponent = category.icon;
              return (
                <div key={program._id} className="card p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${category.color} text-white`}>
                      <IconComponent size={24} />
                    </div>
                    <span className="text-xs bg-neutral-100 px-2 py-1 rounded">
                      {category.label}
                    </span>
                  </div>
                  <h3 className="font-heading text-lg font-bold text-charcoal mb-2">
                    {program.title}
                  </h3>
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-3">
                    {program.description}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingProgram(program); setFormData(program); setShowModal(true); }}
                      className="btn-outline flex-1 text-sm"
                    >
                      <Edit size={16} className="mr-1" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(program._id)}
                      className="btn-outline text-red-600 text-sm"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {editingProgram ? 'Edit Program' : 'Add New Program'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Program Title *"
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Description *"
                className="input-field"
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
              <select
                className="input-field"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              >
                <option value="mentorship">Mentorship</option>
                <option value="leadership">Leadership Workshops</option>
                <option value="community_service">Community Service Projects</option>
              </select>
              <textarea
                placeholder="Participation Requirements"
                className="input-field"
                rows={3}
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
              />
              <textarea
                placeholder="Expected Outcomes"
                className="input-field"
                rows={3}
                value={formData.outcomes}
                onChange={(e) => setFormData({ ...formData, outcomes: e.target.value })}
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingProgram ? 'Update Program' : 'Create Program'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProgram(null); resetForm(); }}
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

export default ProgramsAdminPortal;

