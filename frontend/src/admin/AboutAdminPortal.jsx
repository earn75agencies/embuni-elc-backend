/**
 * AboutAdminPortal - Dedicated portal for About Page Admin
 * 
 * Edits Mission, Vision, Core Values, and Leadership Team profiles
 */

import React, { useState, useEffect } from 'react';
import { 
  Info, Save, Plus, Edit, Trash2, Upload, Users
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const AboutAdminPortal = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('mission'); // mission, vision, values, leadership

  const [missionData, setMissionData] = useState({
    title: 'Our Mission',
    content: ''
  });

  const [visionData, setVisionData] = useState({
    title: 'Our Vision',
    content: ''
  });

  const [valuesData, setValuesData] = useState({
    title: 'Core Values',
    values: []
  });

  const [leadershipTeam, setLeadershipTeam] = useState([]);
  const [showLeaderModal, setShowLeaderModal] = useState(false);
  const [editingLeader, setEditingLeader] = useState(null);
  const [leaderForm, setLeaderForm] = useState({
    name: '',
    role: '',
    bio: '',
    photo: '',
    photoFile: null,
    email: ''
  });

  useEffect(() => {
    // TODO: Fetch about page data from API
    setLoading(false);
  }, [token]);

  const handleSaveMission = async () => {
    setSaving(true);
    // TODO: API call
    toast.success('Mission updated successfully');
    setSaving(false);
  };

  const handleSaveVision = async () => {
    setSaving(true);
    // TODO: API call
    toast.success('Vision updated successfully');
    setSaving(false);
  };

  const handleSaveValues = async () => {
    setSaving(true);
    // TODO: API call
    toast.success('Core Values updated successfully');
    setSaving(false);
  };

  const handleAddValue = () => {
    setValuesData({
      ...valuesData,
      values: [...valuesData.values, { title: '', description: '' }]
    });
  };

  const handleLeaderSubmit = async (e) => {
    e.preventDefault();
    // TODO: API call
    toast.success(editingLeader ? 'Leader updated' : 'Leader added');
    setShowLeaderModal(false);
    setEditingLeader(null);
    setLeaderForm({ name: '', role: '', bio: '', photo: '', photoFile: null, email: '' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
            <Info size={32} className="text-indigo-600" />
            About Page Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Edit Mission, Vision, Core Values, and Leadership Team profiles
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="card p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['mission', 'vision', 'values', 'leadership'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-indigo-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Mission Tab */}
        {activeTab === 'mission' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-4">Mission</h2>
            <textarea
              className="input-field"
              rows={8}
              value={missionData.content}
              onChange={(e) => setMissionData({ ...missionData, content: e.target.value })}
              placeholder="Enter mission statement..."
            />
            <button onClick={handleSaveMission} disabled={saving} className="btn-primary mt-4">
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Mission'}
            </button>
          </div>
        )}

        {/* Vision Tab */}
        {activeTab === 'vision' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-4">Vision</h2>
            <textarea
              className="input-field"
              rows={8}
              value={visionData.content}
              onChange={(e) => setVisionData({ ...visionData, content: e.target.value })}
              placeholder="Enter vision statement..."
            />
            <button onClick={handleSaveVision} disabled={saving} className="btn-primary mt-4">
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Vision'}
            </button>
          </div>
        )}

        {/* Core Values Tab */}
        {activeTab === 'values' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal">Core Values</h2>
              <button onClick={handleAddValue} className="btn-outline">
                <Plus size={18} className="mr-2" />
                Add Value
              </button>
            </div>
            <div className="space-y-4">
              {valuesData.values.map((value, index) => (
                <div key={index} className="border border-neutral-200 rounded-lg p-4">
                  <input
                    type="text"
                    placeholder="Value Title"
                    className="input-field mb-2"
                    value={value.title}
                    onChange={(e) => {
                      const newValues = [...valuesData.values];
                      newValues[index].title = e.target.value;
                      setValuesData({ ...valuesData, values: newValues });
                    }}
                  />
                  <textarea
                    placeholder="Description"
                    className="input-field"
                    rows={2}
                    value={value.description}
                    onChange={(e) => {
                      const newValues = [...valuesData.values];
                      newValues[index].description = e.target.value;
                      setValuesData({ ...valuesData, values: newValues });
                    }}
                  />
                </div>
              ))}
            </div>
            <button onClick={handleSaveValues} disabled={saving} className="btn-primary mt-4">
              <Save size={18} className="mr-2" />
              {saving ? 'Saving...' : 'Save Core Values'}
            </button>
          </div>
        )}

        {/* Leadership Team Tab */}
        {activeTab === 'leadership' && (
          <div className="card p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-heading text-2xl font-bold text-charcoal">Leadership Team</h2>
              <button
                onClick={() => { setEditingLeader(null); setLeaderForm({ name: '', role: '', bio: '', photo: '', photoFile: null, email: '' }); setShowLeaderModal(true); }}
                className="btn-primary"
              >
                <Plus size={18} className="mr-2" />
                Add Leader
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {leadershipTeam.length === 0 ? (
                <div className="col-span-full text-center py-12 text-neutral-500">
                  <Users size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No leadership team members added yet</p>
                </div>
              ) : (
                leadershipTeam.map((leader) => (
                  <div key={leader._id} className="border border-neutral-200 rounded-lg p-4 text-center">
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-neutral-100 overflow-hidden">
                      {leader.photo ? (
                        <img src={leader.photo} alt={leader.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Users size={32} className="text-neutral-400" />
                        </div>
                      )}
                    </div>
                    <h3 className="font-heading font-bold text-charcoal">{leader.name}</h3>
                    <p className="text-sm text-neutral-600 mb-2">{leader.role}</p>
                    <p className="text-xs text-neutral-500 line-clamp-2">{leader.bio}</p>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => { setEditingLeader(leader); setLeaderForm(leader); setShowLeaderModal(true); }}
                        className="btn-outline flex-1 text-sm"
                      >
                        <Edit size={14} />
                      </button>
                      <button className="btn-outline text-red-600 text-sm">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Leader Modal */}
      {showLeaderModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {editingLeader ? 'Edit Leader' : 'Add Leader'}
              </h2>
            </div>
            <form onSubmit={handleLeaderSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Name *"
                className="input-field"
                value={leaderForm.name}
                onChange={(e) => setLeaderForm({ ...leaderForm, name: e.target.value })}
                required
              />
              <input
                type="text"
                placeholder="Role/Position *"
                className="input-field"
                value={leaderForm.role}
                onChange={(e) => setLeaderForm({ ...leaderForm, role: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="input-field"
                value={leaderForm.email}
                onChange={(e) => setLeaderForm({ ...leaderForm, email: e.target.value })}
              />
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Profile Photo *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setLeaderForm({ 
                        ...leaderForm, 
                        photoFile: file,
                        photo: '' // Clear URL if file is selected
                      });
                    }
                  }}
                />
                {leaderForm.photoFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {leaderForm.photoFile.name}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                <input
                  type="url"
                  placeholder="Profile Photo URL"
                  className="input-field"
                  value={leaderForm.photo}
                  onChange={(e) => setLeaderForm({ 
                    ...leaderForm, 
                    photo: e.target.value,
                    photoFile: null // Clear file if URL is entered
                  })}
                />
                {(leaderForm.photo || leaderForm.photoFile) && (
                  <div className="mt-3">
                    <img
                      src={leaderForm.photoFile ? URL.createObjectURL(leaderForm.photoFile) : leaderForm.photo}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-full"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
              <textarea
                placeholder="Bio *"
                className="input-field"
                rows={4}
                value={leaderForm.bio}
                onChange={(e) => setLeaderForm({ ...leaderForm, bio: e.target.value })}
                required
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingLeader ? 'Update Leader' : 'Add Leader'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowLeaderModal(false); setEditingLeader(null); }}
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

export default AboutAdminPortal;
// End of AboutAdminPortal.jsx
