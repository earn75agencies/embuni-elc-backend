import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const courseService = {
  // Get all courses with filtering and pagination
  getCourses: async (params = {}) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get course by ID
  getCourseById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Enroll in a course
  enrollInCourse: async (courseId) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/enroll`, { courseId });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get user's enrollments
  getUserEnrollments: async (status = '') => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(`${API_BASE_URL}/courses/enrollments/my`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get enrollment details
  getEnrollmentById: async (enrollmentId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/enrollments/${enrollmentId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update lesson progress
  updateProgress: async (progressData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/progress`, progressData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get course progress
  getCourseProgress: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/progress`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Submit assessment
  submitAssessment: async (assessmentData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses/assessments/submit`, assessmentData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Get course analytics (for instructors)
  getCourseAnalytics: async (courseId) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/courses/${courseId}/analytics`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Create new course (for instructors)
  createCourse: async (courseData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/courses`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Update course (for instructors)
  updateCourse: async (courseId, courseData) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/courses/${courseId}`, courseData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  },

  // Delete course (for instructors)
  deleteCourse: async (courseId) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/courses/${courseId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }
};

export default courseService;
