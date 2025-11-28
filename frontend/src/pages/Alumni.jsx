import React, { useState, useEffect } from 'react';
import { Search, Filter, Users, Calendar, Award, MapPin, Briefcase, Linkedin, Twitter, Globe, Mail, Phone, Star, Send, UserCheck, UserX, X } from 'lucide-react';
import alumniService from '../services/alumniService';

const Alumni = () => {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    graduationYear: '',
    industry: '',
    location: '',
    company: ''
  });
  const [selectedAlumni, setSelectedAlumni] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [stats, setStats] = useState(null);
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);

  useEffect(() => {
    fetchAlumni();
    fetchStats();
    fetchConnections();
  }, []);

  const fetchAlumni = async () => {
    try {
      setLoading(true);
      const response = await alumniService.getAlumni(filters);
      setAlumni(response.data.alumni || []);
    } catch (error) {
      console.error('Error fetching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await alumniService.getAlumniStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await alumniService.getConnections();
      setConnections(response.data.connections || []);
      setPendingRequests(response.data.pendingRequests || []);
    } catch (error) {
      console.error('Error fetching connections:', error);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await alumniService.searchAlumni(searchQuery, filters);
      setAlumni(response.data.alumni || []);
    } catch (error) {
      console.error('Error searching alumni:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (alumniId) => {
    try {
      await alumniService.sendConnectionRequest(alumniId, 'I would like to connect with you!');
      fetchConnections();
    } catch (error) {
      console.error('Error sending connection request:', error);
    }
  };

  const handleConnectionResponse = async (requestId, action) => {
    try {
      await alumniService.respondToConnectionRequest(requestId, action);
      fetchConnections();
    } catch (error) {
      console.error('Error responding to connection request:', error);
    }
  };

  const viewProfile = async (alumniId) => {
    try {
      const response = await alumniService.getAlumniProfile(alumniId);
      setSelectedAlumni(response.data);
      setShowProfileModal(true);
    } catch (error) {
      console.error('Error fetching alumni profile:', error);
    }
  };

  const isConnected = (alumniId) => {
    return connections.some(conn => conn.alumniId === alumniId);
  };

  const hasPendingRequest = (alumniId) => {
    return pendingRequests.some(req => req.alumniId === alumniId);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Alumni Network</h1>
          <p className="text-gray-600">Connect with Equity Leaders Program graduates worldwide</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Alumni</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.totalAlumni}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <Briefcase className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Industries</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.industries}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <MapPin className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Countries</p>
                  <p className="text-2xl font-semibold text-gray-900">{stats.countries}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-orange-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Your Connections</p>
                  <p className="text-2xl font-semibold text-gray-900">{connections.length}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search alumni..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={filters.industry}
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Industries</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Education">Education</option>
              <option value="Non-profit">Non-profit</option>
              <option value="Government">Government</option>
            </select>
            <select
              value={filters.location}
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Locations</option>
              <option value="Nairobi">Nairobi</option>
              <option value="Mombasa">Mombasa</option>
              <option value="Kisumu">Kisumu</option>
              <option value="International">International</option>
            </select>
          </div>
          <div className="mt-4 flex gap-4">
            <button
              onClick={handleSearch}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Search
            </button>
            <button
              onClick={fetchAlumni}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Pending Connection Requests */}
        {pendingRequests.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
            <h3 className="text-lg font-semibold text-yellow-800 mb-3">Pending Connection Requests</h3>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div key={request._id} className="flex items-center justify-between bg-white p-3 rounded-lg">
                  <div>
                    <p className="font-medium">{request.name}</p>
                    <p className="text-sm text-gray-600">{request.message}</p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleConnectionResponse(request._id, 'accept')}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleConnectionResponse(request._id, 'reject')}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                    >
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alumni Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading alumni...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {alumni.map((alumnus) => (
              <div key={alumnus._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <img
                      src={alumnus.profileImage || '/default-avatar.png'}
                      alt={alumnus.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900">{alumnus.name}</h3>
                      <p className="text-sm text-gray-600">{alumnus.currentPosition}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Briefcase className="h-4 w-4 mr-2" />
                      {alumnus.company}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2" />
                      {alumnus.location}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-2" />
                      Class of {alumnus.graduationYear}
                    </div>
                  </div>

                  <div className="flex gap-2 mb-4">
                    {alumnus.skills?.slice(0, 3).map((skill, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewProfile(alumnus._id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Profile
                    </button>
                    {isConnected(alumnus._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm"
                      >
                        Connected
                      </button>
                    ) : hasPendingRequest(alumnus._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm"
                      >
                        Pending
                      </button>
                    ) : (
                      <button
                        onClick={() => handleConnect(alumnus._id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Connect
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Profile Modal */}
        {showProfileModal && selectedAlumni && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Alumni Profile</h2>
                  <button
                    onClick={() => setShowProfileModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="flex items-center mb-6">
                  <img
                    src={selectedAlumni.profileImage || '/default-avatar.png'}
                    alt={selectedAlumni.name}
                    className="w-24 h-24 rounded-full object-cover"
                  />
                  <div className="ml-6">
                    <h3 className="text-xl font-semibold text-gray-900">{selectedAlumni.name}</h3>
                    <p className="text-gray-600">{selectedAlumni.currentPosition}</p>
                    <p className="text-gray-600">{selectedAlumni.company}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Contact Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2" />
                        {selectedAlumni.email}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2" />
                        {selectedAlumni.phone}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <MapPin className="h-4 w-4 mr-2" />
                        {selectedAlumni.location}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Professional Background</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Industry:</strong> {selectedAlumni.industry}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Experience:</strong> {selectedAlumni.yearsOfExperience} years
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Graduation:</strong> Class of {selectedAlumni.graduationYear}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Skills & Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedAlumni.skills?.map((skill, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Bio</h4>
                  <p className="text-gray-600">{selectedAlumni.bio}</p>
                </div>

                <div className="mt-6">
                  <h4 className="font-semibold text-gray-900 mb-2">Achievements</h4>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedAlumni.achievements?.map((achievement, index) => (
                      <li key={index}>{achievement}</li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 flex gap-4">
                  {selectedAlumni.linkedin && (
                    <a
                      href={selectedAlumni.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-800"
                    >
                      <Linkedin className="h-5 w-5 mr-1" />
                      LinkedIn
                    </a>
                  )}
                  {selectedAlumni.twitter && (
                    <a
                      href={selectedAlumni.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-400 hover:text-blue-600"
                    >
                      <Twitter className="h-5 w-5 mr-1" />
                      Twitter
                    </a>
                  )}
                  {selectedAlumni.website && (
                    <a
                      href={selectedAlumni.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-gray-600 hover:text-gray-800"
                    >
                      <Globe className="h-5 w-5 mr-1" />
                      Website
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alumni;
