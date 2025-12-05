
/**
 * ContentAdminPortal - Dedicated portal for Content Admin
 * 
 * This portal is ONLY for managing posts and announcements.
 * Content Admin cannot access other modules (Events, Gallery, Members).
 * 
 * Features:
 * - Create, edit, delete posts
 * - Publish/unpublish posts
 * - Manage news and announcements
 */

import React, { useState, useEffect } from 'react';
import { 
  FileText, Plus, Edit, Trash2, Eye, EyeOff,
  Search, Filter, CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { postService } from '../services/postService';
import { toast } from 'react-toastify';

const ContentAdminPortal = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    published: 0,
    draft: 0
  });

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'news',
    tags: '',
    featuredImage: '',
    featuredImageFile: null,
    status: 'draft'
  });

  useEffect(() => {
    fetchPosts();
  }, [token]);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      // Admin can see all posts including drafts
      const data = await postService.getAllPosts({ status: 'all' });
      const postsList = data.posts || data.data?.posts || [];
      setPosts(postsList);
      
      setStats({
        total: postsList.length,
        published: postsList.filter(p => p.status === 'published').length,
        draft: postsList.filter(p => p.status === 'draft').length
      });
    } catch (error) {
      console.error('Error fetching posts:', error);
      const errorMessage = error.response?.data?.message || 'Failed to load posts';
      toast.error(errorMessage);
      // Set empty array on error to prevent UI issues
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingPost) {
        await postService.updatePost(token, editingPost._id, formData);
        toast.success('Post updated successfully');
      } else {
        await postService.createPost(token, formData);
        toast.success('Post created successfully');
      }
      setShowModal(false);
      setEditingPost(null);
      resetForm();
      fetchPosts();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save post');
    }
  };

  const handleDelete = async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      await postService.deletePost(token, postId);
      toast.success('Post deleted successfully');
      fetchPosts();
    } catch (error) {
      toast.error('Failed to delete post');
    }
  };

  const handleToggleStatus = async (post) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await postService.updatePost(token, post._id, { status: newStatus });
      toast.success(`Post ${newStatus === 'published' ? 'published' : 'unpublished'}`);
      fetchPosts();
    } catch (error) {
      toast.error('Failed to update post status');
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title || '',
      content: post.content || '',
      excerpt: post.excerpt || '',
      category: post.category || 'news',
      tags: post.tags?.join(', ') || '',
      featuredImage: post.featuredImage || '',
      featuredImageFile: null,
      status: post.status || 'draft'
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      excerpt: '',
      category: 'news',
      tags: '',
      featuredImage: '',
      featuredImageFile: null,
      status: 'draft'
    });
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = 
      post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
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
                <FileText size={32} className="text-purple-600" />
                Content Management Portal
              </h1>
              <p className="text-neutral-600 mt-1">
                Create and manage news posts and announcements
              </p>
            </div>
            <button
              onClick={() => { resetForm(); setEditingPost(null); setShowModal(true); }}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={20} />
              Create Post
            </button>
          </div>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Total Posts</p>
                <p className="text-3xl font-bold text-charcoal">{stats.total}</p>
              </div>
              <FileText className="text-purple-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Published</p>
                <p className="text-3xl font-bold text-green-600">{stats.published}</p>
              </div>
              <CheckCircle2 className="text-green-600" size={32} />
            </div>
          </div>
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-neutral-600 mb-1">Drafts</p>
                <p className="text-3xl font-bold text-yellow-600">{stats.draft}</p>
              </div>
              <Clock className="text-yellow-600" size={32} />
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
                placeholder="Search posts..."
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
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="card p-12 text-center text-neutral-500">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p>No posts found</p>
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div key={post._id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex gap-6">
                  {post.featuredImage && (
                    <div className="w-32 h-32 bg-neutral-100 rounded overflow-hidden flex-shrink-0">
                      <img 
                        src={post.featuredImage} 
                        alt={post.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-heading text-xl font-bold text-charcoal">
                        {post.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        post.status === 'published' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.status}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3 line-clamp-2">
                      {post.excerpt || post.content}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-neutral-500 mb-4">
                      {post.category && (
                        <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {post.category}
                        </span>
                      )}
                      {post.createdAt && (
                        <span>
                          {new Date(post.createdAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(post)}
                        className="btn-outline text-sm py-2"
                      >
                        <Edit size={16} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleToggleStatus(post)}
                        className={`btn-outline text-sm py-2 ${
                          post.status === 'published' ? 'text-yellow-600' : 'text-green-600'
                        }`}
                      >
                        {post.status === 'published' ? (
                          <><EyeOff size={16} className="mr-1" /> Unpublish</>
                        ) : (
                          <><Eye size={16} className="mr-1" /> Publish</>
                        )}
                      </button>
                      <button
                        onClick={() => handleDelete(post._id)}
                        className="btn-outline text-red-600 text-sm py-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input
                type="text"
                placeholder="Post Title *"
                className="input-field"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              <textarea
                placeholder="Excerpt (short summary)"
                className="input-field"
                rows={2}
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              />
              <textarea
                placeholder="Content *"
                className="input-field"
                rows={8}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                required
              />
              <div className="grid grid-cols-2 gap-4">
                <select
                  className="input-field"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="news">News</option>
                  <option value="announcement">Announcement</option>
                  <option value="update">Update</option>
                  <option value="event">Event</option>
                </select>
                <div>
                  <input
                    type="file"
                    accept="image/*"
                    className="input-field"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        setFormData({ 
                          ...formData, 
                          featuredImageFile: file,
                          featuredImage: '' // Clear URL if file is selected
                        });
                      }
                    }}
                  />
                  {formData.featuredImageFile && (
                    <p className="text-sm text-green-600 mt-2">
                      Selected: {formData.featuredImageFile.name}
                    </p>
                  )}
                  <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                  <input
                    type="url"
                    placeholder="Featured Image URL"
                    className="input-field"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      featuredImage: e.target.value,
                      featuredImageFile: null // Clear file if URL is entered
                    })}
                  />
                  {(formData.featuredImage || formData.featuredImageFile) && (
                    <div className="mt-3">
                      <img
                        src={formData.featuredImageFile ? URL.createObjectURL(formData.featuredImageFile) : formData.featuredImage}
                        alt="Preview"
                        className="w-full h-32 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <input
                type="text"
                placeholder="Tags (comma-separated)"
                className="input-field"
                value={formData.tags}
                onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              />
              <div className="flex gap-3">
                <button type="submit" className="btn-primary flex-1">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingPost(null); resetForm(); }}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentAdminPortal;

