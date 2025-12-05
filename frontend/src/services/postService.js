import apiClient from './apiClient';
import { API_ENDPOINTS } from '../config/api';

export const postService = {
  async getAllPosts(params = {}) {
    try {
      const response = await apiClient.get(API_ENDPOINTS.POSTS.LIST, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching posts:', error);
      throw error;
    }
  },

  async getPostById(id) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.POSTS.DETAIL(id)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post ${id}:`, error);
      throw error;
    }
  },

  async getPostBySlug(slug) {
    try {
      const response = await apiClient.get(`${API_ENDPOINTS.POSTS.BY_SLUG(slug)}`);
      return response.data;
    } catch (error) {
      console.error(`Error fetching post by slug ${slug}:`, error);
      throw error;
    }
  },

  async createPost(token, postData) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POSTS.CREATE, postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  },

  async updatePost(token, id, postData) {
    try {
      const response = await apiClient.put(API_ENDPOINTS.POSTS.UPDATE(id), postData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      throw error;
    }
  },

  async deletePost(token, id) {
    try {
      const response = await apiClient.delete(API_ENDPOINTS.POSTS.DELETE(id), {
        headers: { Authorization: `Bearer ${token}` }
      });
      return response.data;
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      throw error;
    }
  },

  async addComment(token, id, content) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.POSTS.ADD_COMMENT(id), 
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      return response.data;
    } catch (error) {
      console.error(`Error adding comment to post ${id}:`, error);
      throw error;
    }
  }
};
