import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const courseService = {
  // Get all courses with filtering and pagination
  async getAllCourses(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching courses:', error);
      throw error;
    }
  },

  // Get course by ID
  async getCourseById(id) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.GET(id));
      return response.data;
    } catch (error) {
      console.error(`Error fetching course ${id}:`, error);
      throw error;
    }
  },

  // Create new course
  async createCourse(token, courseData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COURSES.CREATE, courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating course:', error);
      throw error;
    }
  },

  // Update course
  async updateCourse(token, id, courseData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.COURSES.UPDATE(id), courseData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating course:', error);
      throw error;
    }
  },

  // Delete course
  async deleteCourse(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.COURSES.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting course:', error);
      throw error;
    }
  },

  // Enroll in a course
  async enrollInCourse(token, courseId) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COURSES.ENROLL, { courseId }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error enrolling in course:', error);
      throw error;
    }
  },

  // Get user's enrollments
  async getUserEnrollments(token, status = '') {
    try {
      const params = status ? { status } : {};
      const response = await apiClient.get(API_ENDPOINTS.COURSES.ENROLLMENTS, { 
        params,
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollments:', error);
      throw error;
    }
  },

  // Get enrollment details
  async getEnrollmentById(token, enrollmentId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.ENROLLMENT_DETAIL(enrollmentId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching enrollment details:', error);
      throw error;
    }
  },

  // Update lesson progress
  async updateProgress(token, progressData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COURSES.PROGRESS_UPDATE, progressData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating progress:', error);
      throw error;
    }
  },

  // Get course progress
  async getCourseProgress(token, courseId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.PROGRESS_GET(courseId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course progress:', error);
      throw error;
    }
  },

  // Submit assessment
  async submitAssessment(token, assessmentData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.COURSES.ASSESSMENT_SUBMIT, assessmentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  },

  // Get course analytics (for instructors)
  async getCourseAnalytics(token, courseId) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.COURSES.ANALYTICS(courseId), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching course analytics:', error);
      throw error;
    }
  }
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
