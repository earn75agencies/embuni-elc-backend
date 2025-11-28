import React, { useState, useEffect } from 'react';
import { Search, Filter, BookOpen, Clock, Users, Star, Play, CheckCircle, Lock, Award, TrendingUp, Calendar, User, X } from 'lucide-react';
import courseService from '../services/courseService';

const Learning = () => {
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('discover');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    sort: 'createdAt'
  });
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showCourseModal, setShowCourseModal] = useState(false);

  useEffect(() => {
    if (activeTab === 'discover') {
      fetchCourses();
    } else {
      fetchEnrollments();
    }
  }, [activeTab, filters]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses(filters);
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async () => {
    try {
      setLoading(true);
      const response = await courseService.getUserEnrollments();
      setEnrollments(response.data || []);
    } catch (error) {
      console.error('Error fetching enrollments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      setLoading(true);
      const response = await courseService.getCourses({ ...filters, search: searchQuery });
      setCourses(response.data.courses || []);
    } catch (error) {
      console.error('Error searching courses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await courseService.enrollInCourse(courseId);
      fetchCourses();
    } catch (error) {
      console.error('Error enrolling in course:', error);
    }
  };

  const viewCourseDetails = async (courseId) => {
    try {
      const response = await courseService.getCourseById(courseId);
      setSelectedCourse(response.data);
      setShowCourseModal(true);
    } catch (error) {
      console.error('Error fetching course details:', error);
    }
  };

  const isEnrolled = (courseId) => {
    return enrollments.some(enrollment => enrollment.course._id === courseId);
  };

  const getProgressColor = (percentage) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Learning Hub</h1>
          <p className="text-gray-600">Develop your skills with our comprehensive courses</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <BookOpen className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Available Courses</p>
                <p className="text-2xl font-semibold text-gray-900">{courses.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Award className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Enrolled</p>
                <p className="text-2xl font-semibold text-gray-900">{enrollments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollments.filter(e => e.status === 'completed').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Avg. Progress</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {enrollments.length > 0 
                    ? Math.round(enrollments.reduce((sum, e) => sum + e.progress.percentage, 0) / enrollments.length)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('discover')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discover'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Discover Courses
            </button>
            <button
              onClick={() => setActiveTab('my-courses')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my-courses'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              My Courses
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        {activeTab === 'discover' && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Search courses..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                <option value="Leadership">Leadership</option>
                <option value="Technical Skills">Technical Skills</option>
                <option value="Professional Development">Professional Development</option>
                <option value="Entrepreneurship">Entrepreneurship</option>
                <option value="Communication">Communication</option>
                <option value="Project Management">Project Management</option>
              </select>
              <select
                value={filters.level}
                onChange={(e) => setFilters({ ...filters, level: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
              <select
                value={filters.sort}
                onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="createdAt">Newest First</option>
                <option value="ratings.average">Highest Rated</option>
                <option value="enrollment.currentStudents">Most Popular</option>
              </select>
            </div>
            <div className="mt-4">
              <button
                onClick={handleSearch}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : activeTab === 'discover' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <div key={course._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={course.thumbnail || '/default-course.jpg'}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-t-lg"
                  />
                  {course.isFree && (
                    <span className="absolute top-4 right-4 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      FREE
                    </span>
                  )}
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-blue-600 font-medium">{course.category}</span>
                    <span className="text-sm text-gray-500">{course.level}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{course.description}</p>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <Clock className="h-4 w-4 mr-1" />
                    {course.duration}h
                    <Users className="h-4 w-4 ml-4 mr-1" />
                    {course.enrollment.currentStudents} students
                    <Star className="h-4 w-4 ml-4 mr-1 text-yellow-500" />
                    {course.ratings.average.toFixed(1)}
                  </div>

                  <div className="flex items-center mb-4">
                    <img
                      src={course.instructor.avatar || '/default-avatar.png'}
                      alt={course.instructor.name}
                      className="w-6 h-6 rounded-full mr-2"
                    />
                    <span className="text-sm text-gray-600">{course.instructor.name}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => viewCourseDetails(course._id)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      View Details
                    </button>
                    {isEnrolled(course._id) ? (
                      <button
                        disabled
                        className="px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm"
                      >
                        Enrolled
                      </button>
                    ) : (
                      <button
                        onClick={() => handleEnroll(course._id)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                      >
                        Enroll
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {enrollments.map((enrollment) => (
              <div key={enrollment._id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <img
                      src={enrollment.course.thumbnail || '/default-course.jpg'}
                      alt={enrollment.course.title}
                      className="w-16 h-16 rounded-lg object-cover mr-4"
                    />
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">{enrollment.course.title}</h3>
                      <p className="text-gray-600 text-sm">{enrollment.course.category}</p>
                      <div className="flex items-center mt-2">
                        <User className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-600 mr-4">{enrollment.course.instructor.name}</span>
                        <Calendar className="h-4 w-4 mr-1 text-gray-500" />
                        <span className="text-sm text-gray-600">
                          Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 text-right">
                    <div className="mb-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        enrollment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        enrollment.status === 'active' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                      </span>
                    </div>
                    <div className="w-32">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{enrollment.progress.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${getProgressColor(enrollment.progress.percentage)}`}
                          style={{ width: `${enrollment.progress.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
                    Continue Learning
                  </button>
                  <button
                    onClick={() => viewCourseDetails(enrollment.course._id)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Course Details Modal */}
        {showCourseModal && selectedCourse && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">{selectedCourse.title}</h2>
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-6">
                  <img
                    src={selectedCourse.thumbnail || '/default-course.jpg'}
                    alt={selectedCourse.title}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{selectedCourse.duration} hours</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{selectedCourse.enrollment.currentStudents} students</span>
                  </div>
                  <div className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    <span>{selectedCourse.ratings.average.toFixed(1)} ({selectedCourse.ratings.count} reviews)</span>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedCourse.description}</p>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Learning Objectives</h3>
                  <ul className="list-disc list-inside text-gray-600">
                    {selectedCourse.learningObjectives?.map((objective, index) => (
                      <li key={index}>{objective}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Course Content</h3>
                  <div className="space-y-4">
                    {selectedCourse.syllabus?.map((week, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-2">Week {week.week}: {week.title}</h4>
                        <p className="text-sm text-gray-600 mb-2">{week.description}</p>
                        <div className="space-y-1">
                          {week.lessons?.map((lesson, lessonIndex) => (
                            <div key={lessonIndex} className="flex items-center text-sm text-gray-600">
                              <Play className="h-3 w-3 mr-2" />
                              {lesson.title} ({lesson.duration} min)
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  {isEnrolled(selectedCourse._id) ? (
                    <button
                      disabled
                      className="px-6 py-3 bg-green-100 text-green-800 rounded-lg font-medium"
                    >
                      Already Enrolled
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        handleEnroll(selectedCourse._id);
                        setShowCourseModal(false);
                      }}
                      className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
                    >
                      Enroll Now
                    </button>
                  )}
                  <button
                    onClick={() => setShowCourseModal(false)}
                    className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Learning;
