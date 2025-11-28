import React, { useState, useEffect } from 'react';
import { Search, Filter, Edit, Trash2, CheckCircle, XCircle, Mail, Phone } from 'lucide-react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const ManageMembers = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedMember, setSelectedMember] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/members', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(response.data.members || []);
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (memberId, newStatus) => {
    try {
      await axios.put(
        `/api/members/${memberId}`,
        { membershipStatus: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member status updated');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRoleChange = async (memberId, newRole) => {
    try {
      await axios.put(
        `/api/members/${memberId}`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Member role updated');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update role');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterStatus === 'all' || member.user?.membershipStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-charcoal">
            Manage Members
          </h1>
          <div className="text-sm text-neutral-600">
            Total Members: <span className="font-bold">{members.length}</span>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <input
                type="text"
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-11"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="input-field"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button onClick={fetchMembers} className="btn-primary">
              Refresh
            </button>
          </div>
        </div>

        {/* Members Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Name</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Email</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Student ID</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <tr key={member._id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            {member.user?.avatar ? (
                              <img
                                src={member.user.avatar}
                                alt=""
                                className="w-10 h-10 rounded-full"
                              />
                            ) : (
                              <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-bold">
                                  {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                                </span>
                              </div>
                            )}
                            <div>
                              <div className="font-semibold text-charcoal">
                                {member.user?.firstName} {member.user?.lastName}
                              </div>
                              <div className="text-xs text-neutral-500">
                                Joined {new Date(member.user?.joinedDate).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center text-sm text-neutral-700">
                            <Mail size={14} className="mr-1" />
                            {member.user?.email}
                          </div>
                          {member.user?.phone && (
                            <div className="flex items-center text-xs text-neutral-500 mt-1">
                              <Phone size={12} className="mr-1" />
                              {member.user?.phone}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 text-sm text-neutral-700">
                          {member.user?.studentId || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={member.user?.membershipStatus}
                            onChange={(e) => handleStatusChange(member._id, e.target.value)}
                            className={`text-xs px-3 py-1 rounded-full font-semibold border-0 ${
                              member.user?.membershipStatus === 'active'
                                ? 'bg-green-100 text-green-700'
                                : member.user?.membershipStatus === 'pending'
                                ? 'bg-yellow-100 text-yellow-700'
                                : member.user?.membershipStatus === 'inactive'
                                ? 'bg-gray-100 text-gray-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={member.user?.role}
                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                            className="text-xs px-3 py-1 rounded-lg border border-neutral-300 capitalize"
                          >
                            <option value="member">Member</option>
                            <option value="leader">Leader</option>
                            <option value="moderator">Moderator</option>
                            <option value="admin">Admin</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setSelectedMember(member);
                                setShowModal(true);
                              }}
                              className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                              title="View Details"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm('Are you sure you want to delete this member?')) {
                                  toast.success('Member deleted');
                                }
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-12 text-center text-neutral-500">
                        No members found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Member Detail Modal */}
        {showModal && selectedMember && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal">
                  Member Details
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-neutral-500 hover:text-charcoal"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">First Name</p>
                    <p className="text-charcoal">{selectedMember.user?.firstName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Last Name</p>
                    <p className="text-charcoal">{selectedMember.user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Email</p>
                    <p className="text-charcoal">{selectedMember.user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Phone</p>
                    <p className="text-charcoal">{selectedMember.user?.phone || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Student ID</p>
                    <p className="text-charcoal">{selectedMember.user?.studentId || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Course</p>
                    <p className="text-charcoal">{selectedMember.user?.course || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Year of Study</p>
                    <p className="text-charcoal">{selectedMember.user?.yearOfStudy || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-neutral-600">Joined Date</p>
                    <p className="text-charcoal">
                      {new Date(selectedMember.user?.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {selectedMember.user?.bio && (
                  <div>
                    <p className="text-sm font-semibold text-neutral-600 mb-2">Bio</p>
                    <p className="text-charcoal">{selectedMember.user.bio}</p>
                  </div>
                )}
              </div>
              <div className="mt-6 pt-6 border-t border-neutral-200 flex justify-end space-x-4">
                <button onClick={() => setShowModal(false)} className="btn-outline">
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageMembers;
