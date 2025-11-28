/**
 * MembershipAdminPortal - Dedicated portal for Membership Admin
 * 
 * This portal is ONLY for managing members.
 * Membership Admin cannot access other modules (Events, Gallery, Posts).
 * 
 * Features:
 * - Approve/reject new member applications
 * - Edit member profiles
 * - Track member participation
 * - Update member status
 */

import React, { useState, useEffect } from 'react';
import { 
  Users, UserCheck, UserX, Edit, Search, Filter,
  CheckCircle2, XCircle, Clock, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { memberService } from '../services/memberService';
import { toast } from 'react-toastify';

const MembershipAdminPortal = () => {
  const { token } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    active: 0,
    inactive: 0
  });

  useEffect(() => {
    fetchMembers();
  }, [token]);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const data = await memberService.getAllMembers();
      const membersList = data.members || [];
      setMembers(membersList);
      
      setStats({
        total: membersList.length,
        pending: membersList.filter(m => m.membershipStatus === 'pending').length,
        active: membersList.filter(m => m.membershipStatus === 'active').length,
        inactive: membersList.filter(m => m.membershipStatus === 'inactive').length
      });
    } catch (error) {
      console.error('Error fetching members:', error);
      toast.error('Failed to load members');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (memberId) => {
    if (!window.confirm('Approve this membership application?')) return;
    
    try {
      await memberService.updateMemberStatus(token, memberId, { membershipStatus: 'active' });
      toast.success('Member approved successfully');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to approve member');
    }
  };

  const handleReject = async (memberId) => {
    if (!window.confirm('Reject this membership application?')) return;
    
    try {
      await memberService.updateMemberStatus(token, memberId, { membershipStatus: 'inactive' });
      toast.success('Member application rejected');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to reject member');
    }
  };

  const handleUpdateStatus = async (memberId, newStatus) => {
    try {
      await memberService.updateMemberStatus(token, memberId, { membershipStatus: newStatus });
      toast.success('Member status updated');
      fetchMembers();
    } catch (error) {
      toast.error('Failed to update member status');
    }
  };

  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.user?.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.membershipNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || member.membershipStatus === filterStatus;
    return matchesSearch && matchesStatus;
  });

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
                <Users size={32} className="text-teal-600" />
                Membership Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Approve applications and manage member profiles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Members</p>
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
              </div>
              <Users className="text-teal-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Active</p>
                <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Inactive</p>
                <p className="text-3xl font-bold text-red-600">{stats.inactive}</p>
              </div>
              <XCircle className="text-red-600" size={32} />
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
                placeholder="Search by name, email, or membership number..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select
              className="input-field md:w-48"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Members Table */}
        <div className="card overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50">
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Member</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Email</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Membership #</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Status</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Joined</th>
                <th className="px-6 py-3 text-left text-sm font-bold text-charcoal">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-8 text-center text-neutral-500">
                    No members found
                  </td>
                </tr>
              ) : (
                filteredMembers.map((member) => (
                  <tr key={member._id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-charcoal">
                          {member.user?.firstName} {member.user?.lastName}
                        </p>
                        {member.user?.phone && (
                          <p className="text-xs text-neutral-500">{member.user.phone}</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{member.user?.email}</td>
                    <td className="px-6 py-4 text-sm font-mono">{member.membershipNumber}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        member.membershipStatus === 'active'
                          ? 'bg-green-100 text-green-800'
                          : member.membershipStatus === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {member.membershipStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {member.joinedDate 
                        ? new Date(member.joinedDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {member.membershipStatus === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(member._id)}
                              className="text-green-600 hover:text-green-800"
                              title="Approve"
                            >
                              <UserCheck size={18} />
                            </button>
                            <button
                              onClick={() => handleReject(member._id)}
                              className="text-red-600 hover:text-red-800"
                              title="Reject"
                            >
                              <UserX size={18} />
                            </button>
                          </>
                        )}
                        {member.membershipStatus === 'active' && (
                          <button
                            onClick={() => handleUpdateStatus(member._id, 'inactive')}
                            className="text-yellow-600 hover:text-yellow-800"
                            title="Deactivate"
                          >
                            <UserX size={18} />
                          </button>
                        )}
                        {member.membershipStatus === 'inactive' && (
                          <button
                            onClick={() => handleUpdateStatus(member._id, 'active')}
                            className="text-green-600 hover:text-green-800"
                            title="Activate"
                          >
                            <UserCheck size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MembershipAdminPortal;
