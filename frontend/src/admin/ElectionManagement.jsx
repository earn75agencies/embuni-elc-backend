/**
 * Election Management Portal
 * For Chapter Admins and Super Admins
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, Plus, CheckCircle2, XCircle, Clock, 
  Users, BarChart3, Settings, Send, Download
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { buildUrl } from '../config/api';

const ElectionManagement = () => {
  const { token, adminProfile, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [elections, setElections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [selectedElection, setSelectedElection] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    chapter: '',
    startTime: '',
    endTime: '',
    allowMultiplePositions: true,
    requireVerification: true,
    publicResults: false
  });

  useEffect(() => {
    loadElections();
  }, [token]);

  const loadElections = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        buildUrl('/elections', { status: 'all' }),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      const data = await response.json();
      
      if (data.success) {
        setElections(data.data);
      }
    } catch (error) {
      console.error('Failed to load elections:', error);
      toast.error('Failed to load elections');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateElection = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch(
        buildUrl('/elections'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Election created successfully. Awaiting approval.');
        setShowCreateModal(false);
        setFormData({
          title: '',
          description: '',
          chapter: '',
          startTime: '',
          endTime: '',
          allowMultiplePositions: true,
          requireVerification: true,
          publicResults: false
        });
        loadElections();
      } else {
        toast.error(data.message || 'Failed to create election');
      }
    } catch (error) {
      console.error('Create election error:', error);
      toast.error('Failed to create election');
    }
  };

  const handleApprove = async (electionId) => {
    try {
      const response = await fetch(
        buildUrl(`/elections/${electionId}/approve`),
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Election approved');
        loadElections();
      } else {
        toast.error(data.message || 'Failed to approve election');
      }
    } catch (error) {
      toast.error('Failed to approve election');
    }
  };

  const handleStart = async (electionId) => {
    try {
      const response = await fetch(
        buildUrl(`/elections/${electionId}/start`),
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Election started');
        loadElections();
      } else {
        toast.error(data.message || 'Failed to start election');
      }
    } catch (error) {
      toast.error('Failed to start election');
    }
  };

  const handleClose = async (electionId) => {
    if (!window.confirm('Are you sure you want to close this election? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(
        buildUrl(`/elections/${electionId}/close`),
        {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success('Election closed');
        loadElections();
      } else {
        toast.error(data.message || 'Failed to close election');
      }
    } catch (error) {
      toast.error('Failed to close election');
    }
  };

  const handleGenerateLinks = async (electionId) => {
    try {
      const response = await fetch(
        buildUrl('/voting-links/generate'),
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            electionId,
            sendEmails: true
          })
        }
      );

      const data = await response.json();

      if (data.success) {
        toast.success(`Generated ${data.data.total} voting links`);
        setShowLinkModal(false);
      } else {
        toast.error(data.message || 'Failed to generate links');
      }
    } catch (error) {
      toast.error('Failed to generate voting links');
    }
  };

  const handleExport = async (electionId) => {
    try {
      const response = await fetch(
        buildUrl(`/elections/${electionId}/export`, { format: 'csv' }),
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `election-${electionId}-results.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Results exported successfully');
    } catch (error) {
      toast.error('Failed to export results');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
                <Calendar size={32} className="text-primary" />
                Election Management
              </h1>
              <p className="text-neutral-600 mt-1">
                Create and manage elections for your chapter
              </p>
            </div>
            {hasPermission('MANAGE_EVENTS') && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Create Election
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        <div className="grid grid-cols-1 gap-6">
          {elections.length === 0 ? (
            <div className="card p-12 text-center text-neutral-500">
              <Calendar size={48} className="mx-auto mb-4 opacity-50" />
              <p>No elections created yet</p>
            </div>
          ) : (
            elections.map((election) => (
              <div key={election._id} className="card p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="font-heading text-xl font-bold text-charcoal mb-2">
                      {election.title}
                    </h3>
                    {election.description && (
                      <p className="text-neutral-600 mb-3">{election.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-neutral-600">
                      <span>Chapter: {election.chapter}</span>
                      <span>•</span>
                      <span>
                        {new Date(election.startTime).toLocaleDateString()} - {new Date(election.endTime).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    election.status === 'active' ? 'bg-green-100 text-green-800' :
                    election.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                    election.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {election.status}
                  </span>
                </div>

                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <Users size={16} />
                    {election.totalVotesCast || 0} votes
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-600">
                    <BarChart3 size={16} />
                    {election.turnoutPercentage || 0}% turnout
                  </div>
                </div>

                <div className="flex gap-3">
                  <Link
                    to={`/elections/${election._id}/results`}
                    className="btn-outline text-sm"
                  >
                    View Results
                  </Link>
                  <Link
                    to={`/admin/elections/${election._id}/manage`}
                    className="btn-outline text-sm"
                  >
                    <Settings size={16} className="mr-1" />
                    Manage
                  </Link>
                  {hasPermission('MANAGE_ADMINS') && election.status === 'pending' && (
                    <button
                      onClick={() => handleApprove(election._id)}
                      className="btn-outline text-sm text-green-600"
                    >
                      <CheckCircle2 size={16} className="mr-1" />
                      Approve
                    </button>
                  )}
                  {election.status === 'approved' && (
                    <button
                      onClick={() => handleStart(election._id)}
                      className="btn-outline text-sm text-blue-600"
                    >
                      Start Election
                    </button>
                  )}
                  {election.status === 'active' && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedElection(election);
                          setShowLinkModal(true);
                        }}
                        className="btn-outline text-sm"
                      >
                        <Send size={16} className="mr-1" />
                        Generate Links
                      </button>
                      <button
                        onClick={() => handleClose(election._id)}
                        className="btn-outline text-sm text-red-600"
                      >
                        <XCircle size={16} className="mr-1" />
                        Close
                      </button>
                    </>
                  )}
                  {election.status === 'closed' && (
                    <button
                      onClick={() => handleExport(election._id)}
                      className="btn-outline text-sm"
                    >
                      <Download size={16} className="mr-1" />
                      Export Results
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create Election Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                Create New Election
              </h2>
            </div>
            <form onSubmit={handleCreateElection} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Election Title *"
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
              <input
                type="text"
                placeholder="Chapter *"
                className="input-field"
                value={formData.chapter}
                onChange={(e) => setFormData({ ...formData, chapter: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="input-field"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  Create Election
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Links Modal */}
      {showLinkModal && selectedElection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                Generate Voting Links
              </h2>
            </div>
            <div className="p-6">
              <p className="text-neutral-600 mb-4">
                Generate unique voting links for all verified members of <strong>{selectedElection.chapter}</strong>.
                Links will be sent via email if configured.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => handleGenerateLinks(selectedElection._id)}
                  className="btn-primary flex-1"
                >
                  Generate & Send Links
                </button>
                <button
                  onClick={() => {
                    setShowLinkModal(false);
                    setSelectedElection(null);
                  }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ElectionManagement;

