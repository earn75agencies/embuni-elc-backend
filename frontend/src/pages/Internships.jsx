import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Briefcase, 
  Search, 
  Filter, 
  MapPin, 
  Clock, 
  DollarSign,
  Calendar,
  Building,
  Users,
  TrendingUp,
  Plus,
  Eye,
  ExternalLink
} from 'lucide-react';
import internshipService from '../services/internshipService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import LoadingSpinner from '../components/LoadingSpinner';
import InternshipCard from '../components/internship/InternshipCard';
import InternshipFilters from '../components/internship/InternshipFilters';
import InternshipStats from '../components/internship/InternshipStats';

const Internships = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    isPaid: '',
    remote: '',
    schedule: '',
    duration: '',
    skills: '',
    featured: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchInternships();
    fetchStats();
  }, [filters, pagination.page, sortBy, sortOrder, searchTerm]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
        sortBy,
        sortOrder
      };

      if (searchTerm) {
        params.search = searchTerm;
      }

      const response = await internshipService.getInternships(params);
      setInternships(response.data.data);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Error fetching internships:', error);
      toast.error('Failed to load internships');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await internshipService.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination(prev => ({ ...prev, page: 1 }));
    fetchInternships();
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const handleInternshipAction = async (action, internshipId, data) => {
    try {
      switch (action) {
        case 'apply':
          await internshipService.applyToInternship(internshipId, data);
          toast.success('Application submitted successfully!');
          fetchInternships(); // Refresh to update application counts
          break;
        case 'view':
          await internshipService.trackView(internshipId);
          navigate(`/internships/${internshipId}`);
          break;
        case 'edit':
          navigate(`/internships/${internshipId}/edit`);
          break;
        case 'delete':
          if (window.confirm('Are you sure you want to delete this internship?')) {
            await internshipService.deleteInternship(internshipId);
            toast.success('Internship deleted successfully');
            fetchInternships();
          }
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error performing internship action:', error);
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const clearFilters = () => {
    setFilters({
      industry: '',
      location: '',
      isPaid: '',
      remote: '',
      schedule: '',
      duration: '',
      skills: '',
      featured: ''
    });
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const getSortIcon = (field) => {
    if (sortBy !== field) return null;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Internship Opportunities</h1>
              <p className="mt-2 text-gray-600">
                Discover exciting internship opportunities from partner companies
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/internships/my-applications')}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                My Applications
              </button>
              {(user?.role === 'admin' || user?.profile?.isCompany) && (
                <button
                  onClick={() => navigate('/internships/post')}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Post Internship
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {stats && (
          <div className="mb-8">
            <InternshipStats stats={stats} />
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mb-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search internships by title, company, or skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
              <button
                type="button"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
                {Object.values(filters).some(v => v !== '') && (
                  <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    Active
                  </span>
                )}
              </button>
              {Object.values(filters).some(v => v !== '') && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Clear
                </button>
              )}
            </div>
          </form>

          {/* Expandable Filters */}
          {showFilters && (
            <InternshipFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          )}

          {/* Sort Options */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Sort by:</span>
              <button
                onClick={() => handleSort('createdAt')}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  sortBy === 'createdAt' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Date Posted {getSortIcon('createdAt')}
              </button>
              <button
                onClick={() => handleSort('applicationDeadline')}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  sortBy === 'applicationDeadline' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Deadline {getSortIcon('applicationDeadline')}
              </button>
              <button
                onClick={() => handleSort('title')}
                className={`text-sm px-3 py-1 rounded transition-colors ${
                  sortBy === 'title' ? 'bg-blue-100 text-blue-800' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Title {getSortIcon('title')}
              </button>
            </div>

            <div className="text-sm text-gray-600">
              Showing {internships.length} of {pagination.total} opportunities
            </div>
          </div>
        </div>

        {/* Internships List */}
        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : internships.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
              <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
              <p className="text-gray-600 mb-4">
                {Object.values(filters).some(v => v !== '') || searchTerm
                  ? 'Try adjusting your filters or search terms'
                  : 'Check back later for new opportunities'
                }
              </p>
              {(Object.values(filters).some(v => v !== '') || searchTerm) && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {internships.map((internship) => (
                  <InternshipCard
                    key={internship._id}
                    internship={internship}
                    onAction={handleInternshipAction}
                    currentUser={user}
                  />
                ))}
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {[...Array(pagination.pages)].map((_, index) => {
                    const page = index + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 rounded-lg transition-colors ${
                          page === pagination.page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                  
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Internships;
