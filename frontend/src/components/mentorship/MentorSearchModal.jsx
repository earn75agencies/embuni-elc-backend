import React, { useState, useEffect } from 'react';
import { X, Search, Filter, User, MapPin, Briefcase, Star, Clock } from 'lucide-react';
import mentorshipService from '../../services/mentorshipService';

const MentorSearchModal = ({ onClose, onMentorSelected }) => {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    experienceLevel: '',
    interests: '',
    skills: ''
  });
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    message: '',
    goals: [{ title: '', description: '', targetDate: '' }],
    matchingCriteria: {}
  });

  useEffect(() => {
    searchMentors();
  }, [filters]);

  const searchMentors = async () => {
    try {
      setLoading(true);
      const params = {
        ...filters,
        limit: 20
      };
      
      const response = await mentorshipService.findMentors(params);
      setMentors(response.data.data);
    } catch (error) {
      console.error('Error searching mentors:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleMentorSelect = (mentor) => {
    setSelectedMentor(mentor);
    setShowRequestForm(true);
  };

  const handleGoalChange = (index, field, value) => {
    const updatedGoals = [...requestData.goals];
    updatedGoals[index][field] = value;
    setRequestData(prev => ({ ...prev, goals: updatedGoals }));
  };

  const addGoal = () => {
    setRequestData(prev => ({
      ...prev,
      goals: [...prev.goals, { title: '', description: '', targetDate: '' }]
    }));
  };

  const removeGoal = (index) => {
    if (requestData.goals.length > 1) {
      const updatedGoals = requestData.goals.filter((_, i) => i !== index);
      setRequestData(prev => ({ ...prev, goals: updatedGoals }));
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedMentor) return;

    try {
      const filteredGoals = requestData.goals.filter(goal => goal.title.trim());
      const payload = {
        message: requestData.message,
        goals: filteredGoals,
        matchingCriteria: {
          ...filters,
          interests: filters.interests.split(',').map(i => i.trim()).filter(Boolean),
          skills: filters.skills.split(',').map(s => s.trim()).filter(Boolean)
        }
      };

      await onMentorSelected(selectedMentor._id, payload);
      onClose();
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Find a Mentor</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!showRequestForm ? (
          <>
            {/* Search and Filters */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search mentors by name, skills, or expertise..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-2">
                  <select
                    value={filters.industry}
                    onChange={(e) => handleFilterChange('industry', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Industries</option>
                    <option value="technology">Technology</option>
                    <option value="finance">Finance</option>
                    <option value="healthcare">Healthcare</option>
                    <option value="education">Education</option>
                    <option value="consulting">Consulting</option>
                    <option value="marketing">Marketing</option>
                    <option value="nonprofit">Non-profit</option>
                  </select>

                  <select
                    value={filters.experienceLevel}
                    onChange={(e) => handleFilterChange('experienceLevel', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Levels</option>
                    <option value="early">Early Career (0-5 years)</option>
                    <option value="mid">Mid Career (5-10 years)</option>
                    <option value="senior">Senior (10-20 years)</option>
                    <option value="executive">Executive (20+ years)</option>
                  </select>

                  <input
                    type="text"
                    placeholder="Interests (comma-separated)"
                    value={filters.interests}
                    onChange={(e) => handleFilterChange('interests', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />

                  <input
                    type="text"
                    placeholder="Skills (comma-separated)"
                    value={filters.skills}
                    onChange={(e) => handleFilterChange('skills', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : mentors.length === 0 ? (
                <div className="text-center py-12">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No mentors found</h3>
                  <p className="text-gray-600">Try adjusting your filters or search terms</p>
                </div>
              ) : (
                <div className="p-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {mentors.map((mentor) => (
                      <div key={mentor._id} className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-shadow">
                        <div className="flex items-start space-x-3">
                          <img
                            src={mentor.avatar || `https://ui-avatars.com/api/?name=${mentor.name}&background=6366f1&color=fff`}
                            alt={mentor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {mentor.name}
                            </h3>
                            {mentor.profile?.title && (
                              <p className="text-sm text-gray-600">{mentor.profile.title}</p>
                            )}
                            {mentor.profile?.company && (
                              <p className="text-sm text-gray-500">{mentor.profile.company}</p>
                            )}
                          </div>
                          
                          {/* Match Score */}
                          <div className={`px-2 py-1 rounded-full text-xs font-medium border ${getMatchScoreColor(mentor.matchScore)}`}>
                            {mentor.matchScore}% match
                          </div>
                        </div>

                        {/* Expertise */}
                        {mentor.profile?.skills && mentor.profile.skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-600 mb-1">Expertise:</p>
                            <div className="flex flex-wrap gap-1">
                              {mentor.profile.skills.slice(0, 3).map((skill, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                                >
                                  {skill}
                                </span>
                              ))}
                              {mentor.profile.skills.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{mentor.profile.skills.length - 3} more
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Stats */}
                        <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
                          <div className="flex items-center space-x-3">
                            {mentor.profile?.experience && (
                              <span className="flex items-center">
                                <Briefcase className="w-3 h-3 mr-1" />
                                {mentor.profile.experience}
                              </span>
                            )}
                            {mentor.profile?.mentorRating && (
                              <span className="flex items-center">
                                <Star className="w-3 h-3 mr-1 text-yellow-400 fill-current" />
                                {mentor.profile.mentorRating}
                              </span>
                            )}
                          </div>
                          {mentor.profile?.responseTime && (
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {mentor.profile.responseTime}
                            </span>
                          )}
                        </div>

                        {/* Bio */}
                        {mentor.profile?.bio && (
                          <p className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {mentor.profile.bio}
                          </p>
                        )}

                        {/* Action Button */}
                        <button
                          onClick={() => handleMentorSelect(mentor)}
                          className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Request Mentorship
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* Request Form */
          <div className="flex-1 overflow-y-auto p-6">
            <div className="max-w-2xl mx-auto">
              {/* Selected Mentor */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <img
                    src={selectedMentor.avatar || `https://ui-avatars.com/api/?name=${selectedMentor.name}&background=6366f1&color=fff`}
                    alt={selectedMentor.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{selectedMentor.name}</h3>
                    <p className="text-sm text-gray-600">
                      {selectedMentor.profile?.title} at {selectedMentor.profile?.company}
                    </p>
                  </div>
                  <div className={`ml-auto px-3 py-1 rounded-full text-sm font-medium border ${getMatchScoreColor(selectedMentor.matchScore)}`}>
                    {selectedMentor.matchScore}% match
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Personal Message
                </label>
                <textarea
                  value={requestData.message}
                  onChange={(e) => setRequestData(prev => ({ ...prev, message: e.target.value }))}
                  placeholder="Introduce yourself and explain why you'd like this person to be your mentor..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Goals */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mentorship Goals
                </label>
                <div className="space-y-3">
                  {requestData.goals.map((goal, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Goal {index + 1}</h4>
                        {requestData.goals.length > 1 && (
                          <button
                            onClick={() => removeGoal(index)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <input
                        type="text"
                        placeholder="Goal title"
                        value={goal.title}
                        onChange={(e) => handleGoalChange(index, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <textarea
                        placeholder="Goal description"
                        value={goal.description}
                        onChange={(e) => handleGoalChange(index, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                      />
                      <input
                        type="date"
                        value={goal.targetDate}
                        onChange={(e) => handleGoalChange(index, 'targetDate', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={addGoal}
                  className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
                >
                  + Add Another Goal
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => setShowRequestForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handleSubmitRequest}
                  disabled={!requestData.message.trim() || !requestData.goals.some(g => g.title.trim())}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Request
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MentorSearchModal;
