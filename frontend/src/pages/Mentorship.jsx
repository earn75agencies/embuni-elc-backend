import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Users, 
  Search, 
  Calendar, 
  Target, 
  MessageSquare, 
  Star,
  Filter,
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp
} from 'lucide-react';
import mentorshipService from '../services/mentorshipService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import MentorshipCard from '../components/mentorship/MentorshipCard';
import MentorSearchModal from '../components/mentorship/MentorSearchModal';
import MentorshipStats from '../components/mentorship/MentorshipStats';

const Mentorship = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mentorships, setMentorships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [role, setRole] = useState('all');
  const [showSearchModal, setShowSearchModal] = useState(false);

  useEffect(() => {
    fetchMentorships();
    fetchStats();
  }, [filter, role]);

  const fetchMentorships = async () => {
    try {
      setLoading(true);
      const params = {};
      if (filter !== 'all') params.status = filter;
      if (role !== 'all') params.role = role;

      const response = await mentorshipService.getMentorships(params);
      setMentorships(response.data.data);
    } catch (error) {
      console.error('Error fetching mentorships:', error);
      toast.error('Failed to load mentorships');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await mentorshipService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleMentorshipAction = async (mentorshipId, action, data) => {
    try {
      switch (action) {
        case 'accept':
        case 'decline':
          await mentorshipService.respondToRequest(mentorshipId, { action, ...data });
          toast.success(`Request ${action}ed successfully`);
          break;
        case 'schedule':
          await mentorshipService.scheduleSession(mentorshipId, data);
          toast.success('Session scheduled successfully');
          break;
        case 'updateGoal':
          await mentorshipService.updateGoalProgress(mentorshipId, data.goalId, data);
          toast.success('Goal updated successfully');
          break;
        case 'feedback':
          await mentorshipService.submitFeedback(mentorshipId, data);
          toast.success('Feedback submitted successfully');
          break;
        default:
          break;
      }
      fetchMentorships();
      fetchStats();
    } catch (error) {
      console.error('Error performing mentorship action:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      active: 'text-green-600 bg-green-50 border-green-200',
      completed: 'text-blue-600 bg-blue-50 border-blue-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200',
      on_hold: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <Clock className="w-4 h-4" />,
      active: <CheckCircle className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />,
      on_hold: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  if (loading && mentorships.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Mentorship Program</h1>
              <p className="mt-2 text-gray-600">
                Connect with experienced mentors and accelerate your growth
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {user?.profile?.isMentor === false && (
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Find Mentor
                </button>
              )}
              <button
                onClick={() => navigate('/mentorship/calendar')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Calendar className="w-4 h-4 mr-2" />
                Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8">
            <MentorshipStats stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Filters:</span>
            </div>
            
            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Status:</label>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <label className="text-sm text-gray-600">Role:</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All</option>
                <option value="mentor">As Mentor</option>
                <option value="mentee">As Mentee</option>
              </select>
            </div>
          </div>
        </div>

        {/* Mentorships List */}
        <div className="space-y-4">
          {mentorships.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No mentorships found</h3>
              <p className="text-gray-600 mb-4">
                {filter === 'all' && role === 'all' 
                  ? 'Start your mentorship journey by finding a mentor or becoming one.'
                  : 'Try adjusting your filters to see more results.'
                }
              </p>
              {user?.profile?.isMentor === false && filter === 'all' && role === 'all' && (
                <button
                  onClick={() => setShowSearchModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Find a Mentor
                </button>
              )}
            </div>
          ) : (
            mentorships.map((mentorship) => (
              <MentorshipCard
                key={mentorship._id}
                mentorship={mentorship}
                currentUserId={user?._id}
                onAction={handleMentorshipAction}
                getStatusColor={getStatusColor}
                getStatusIcon={getStatusIcon}
              />
            ))
          )}
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <LoadingSpinner size="lg" />
          </div>
        )}
      </div>

      {/* Mentor Search Modal */}
      {showSearchModal && (
        <MentorSearchModal
          onClose={() => setShowSearchModal(false)}
          onMentorSelected={async (mentorId, data) => {
            try {
              await mentorshipService.sendRequest(mentorId, data);
              toast.success('Mentorship request sent successfully');
              setShowSearchModal(false);
              fetchMentorships();
            } catch (error) {
              console.error('Error sending mentorship request:', error);
              toast.error(error.response?.data?.message || 'Failed to send request');
            }
          }}
        />
      )}
    </div>
  );
};

export default Mentorship;
