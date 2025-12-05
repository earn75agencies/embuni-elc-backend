/**
 * PartnersAdminPortal - Dedicated portal for Partners Admin
 * 
 * Oversees partner organizations, sponsors, and collaborations.
 * Manages partners section on home page.
 */

import React, { useState, useEffect } from 'react';
import { 
  Network, Plus, Edit, Trash2, Search, Filter,
  Globe, Mail, Phone, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { partnerService } from '../services/partnerService';

const PartnersAdminPortal = () => {
  const { token } = useAuth();
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPartner, setEditingPartner] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    website: '',
    logo: '',
    logoFile: null,
    type: 'sponsor', // sponsor, partner, collaborator
    contactEmail: '',
    contactPhone: '',
    status: 'active'
  });

  useEffect(() => {
    fetchPartners();
  }, [token]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const response = await partnerService.getPartners(token, {
        type: filterType !== 'all' ? filterType : undefined,
        search: searchTerm || undefined
      });
      setPartners(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load partners');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPartner) {
        await partnerService.updatePartner(token, editingPartner._id, formData);
        toast.success('Partner updated successfully');
      } else {
        await partnerService.createPartner(token, formData);
        toast.success('Partner added successfully');
      }
      setShowModal(false);
      setEditingPartner(null);
      resetForm();
      fetchPartners();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save partner');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this partner?')) return;
    try {
      await partnerService.deletePartner(token, id);
      toast.success('Partner deleted');
      fetchPartners();
    } catch (error) {
      toast.error('Failed to delete partner');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      website: '',
      logo: '',
      logoFile: null,
      type: 'sponsor',
      contactEmail: '',
      contactPhone: '',
      status: 'active'
    });
  };

  const handleEdit = (partner) => {
    setEditingPartner(partner);
    setFormData({
      name: partner.name || '',
      description: partner.description || '',
      website: partner.website || '',
      logo: partner.logo || '',
      logoFile: null,
      type: partner.type || 'sponsor',
      contactEmail: partner.contactEmail || '',
      contactPhone: partner.contactPhone || '',
      status: partner.status || 'active'
    });
    setShowModal(true);
  };

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         partner.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || partner.type === filterType;
    return matchesSearch && matchesType;
  });

  const partnerTypes = {
    sponsor: 'Sponsor',
    partner: 'Partner',
    collaborator: 'Collaborator'
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-neutral-900 flex items-center gap-3">
                <Network className="w-8 h-8 text-amber-600" />
                Partners Management
              </h1>
              <p className="text-neutral-600 mt-2">
                Manage partner organizations, sponsors, and collaborations
              </p>
            </div>
            <button
              onClick={() => {
                resetForm();
                setEditingPartner(null);
                setShowModal(true);
              }}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Partner
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
                  placeholder="Search partners..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="sm:w-48">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {Object.entries(partnerTypes).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Partners List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-neutral-600">Loading partners...</p>
          </div>
        ) : filteredPartners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Network className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">No partners found</h3>
            <p className="text-neutral-600 mb-4">Get started by adding your first partner organization</p>
            <button
              onClick={() => {
                resetForm();
                setEditingPartner(null);
                setShowModal(true);
              }}
              className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700"
            >
              Add Partner
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPartners.map((partner) => (
              <div key={partner._id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-neutral-900 mb-1">{partner.name}</h3>
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      partner.type === 'sponsor' ? 'bg-amber-100 text-amber-800' :
                      partner.type === 'partner' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {partnerTypes[partner.type] || partner.type}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(partner)}
                      className="p-2 text-neutral-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(partner._id)}
                      className="p-2 text-neutral-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                {partner.logo && (
                  <div className="mb-4">
                    <img src={partner.logo} alt={partner.name} className="w-full h-32 object-contain rounded" />
                  </div>
                )}
                {partner.description && (
                  <p className="text-sm text-neutral-600 mb-4 line-clamp-2">{partner.description}</p>
                )}
                <div className="space-y-2 text-sm text-neutral-600">
                  {partner.website && (
                    <div className="flex items-center gap-2">
                      <LinkIcon className="w-4 h-4" />
                      <a href={partner.website} target="_blank" rel="noopener noreferrer" className="hover:text-amber-600 truncate">
                        {partner.website}
                      </a>
                    </div>
                  )}
                  {partner.contactEmail && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      <span className="truncate">{partner.contactEmail}</span>
                    </div>
                  )}
                  {partner.contactPhone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      <span>{partner.contactPhone}</span>
                    </div>
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
                  {editingPartner ? 'Edit Partner' : 'Add New Partner'}
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Partner Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Type *</label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      {Object.entries(partnerTypes).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Website URL</label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ 
                          ...formData, 
                          logoFile: file,
                          logo: '' // Clear URL if file is selected
                        });
                      }
                    }}
                  />
                  {formData.logoFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.logoFile.name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                  <input
                    type="url"
                    value={formData.logo}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      logo: e.target.value,
                      logoFile: null // Clear file if URL is entered
                    })}
                    className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    placeholder="https://example.com/logo.png"
                  />
                  {(formData.logo || formData.logoFile) && (
                    <div className="mt-3">
                      <img
                        src={formData.logoFile ? URL.createObjectURL(formData.logoFile) : formData.logo}
                        alt="Preview"
                        className="w-32 h-32 object-contain rounded-lg bg-neutral-100 p-2"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Contact Email</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">Contact Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone}
                      onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                      className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      setEditingPartner(null);
                      resetForm();
                    }}
                    className="px-4 py-2 text-neutral-700 bg-neutral-100 rounded-lg hover:bg-neutral-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    {editingPartner ? 'Update' : 'Create'} Partner
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

export default PartnersAdminPortal;

