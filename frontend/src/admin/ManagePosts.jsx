import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { toast } from 'react-toastify';
import { postService } from '../services/postService';
import { useAuth } from '../context/AuthContext';
import ProductionImage from '../components/ProductionImage';

const ManagePosts = () => {
  const { token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'news',
    featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
    featuredImageFile: null,
    status: 'draft',
    isFeatured: false
  });

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await postService.getAllPosts({ status: 'all' });
      setPosts(data.posts || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast.error('Failed to load posts');
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
      resetForm();
      fetchPosts();
    } catch (error) {
      toast.error('Failed to save post');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await postService.deletePost(token, id);
        toast.success('Post deleted successfully');
        fetchPosts();
      } catch (error) {
        toast.error('Failed to delete post');
      }
    }
  };

  const handleEdit = (post) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      featuredImage: post.featuredImage,
      featuredImageFile: null,
      status: post.status,
      isFeatured: post.isFeatured
    });
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      category: 'news',
      featuredImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800',
      featuredImageFile: null,
      status: 'draft',
      isFeatured: false
    });
    setEditingPost(null);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        <div className="flex justify-between items-center mb-8">
          <h1 className="font-heading text-4xl font-bold text-charcoal">
            Manage Posts
          </h1>
          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="btn-primary flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Create Post
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Title</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Category</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Status</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Published</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-charcoal">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {posts.map((post) => (
                    <tr key={post._id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <ProductionImage
                            src={post.featuredImage}
                            alt=""
                            fallbackType="post"
                            width={80}
                            height={60}
                            className="w-16 h-12 object-cover rounded"
                          />
                          <div>
                            <div className="font-semibold text-charcoal line-clamp-1">
                              {post.title}
                            </div>
                            {post.isFeatured && (
                              <span className="text-xs text-accent-yellow font-bold">
                                ⭐ Featured
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue rounded-full text-xs font-semibold capitalize">
                          {post.category}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          post.status === 'published' ? 'bg-green-100 text-green-700' :
                          post.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {post.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        <div className="flex items-center">
                          <Eye size={16} className="mr-1" />
                          {post.views || 0}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-neutral-700">
                        {post.publishedAt 
                          ? new Date(post.publishedAt).toLocaleDateString()
                          : 'Not published'
                        }
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(post)}
                            className="p-2 text-accent-blue hover:bg-accent-blue/10 rounded-lg transition-colors"
                          >
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(post._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Post Form Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-xl max-w-3xl w-full my-8 p-8">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                {editingPost ? 'Edit Post' : 'Create New Post'}
              </h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Post Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="input-field"
                    placeholder="Enter post title"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="input-field"
                    >
                      <option value="news">News</option>
                      <option value="announcement">Announcement</option>
                      <option value="achievement">Achievement</option>
                      <option value="event-recap">Event Recap</option>
                      <option value="blog">Blog</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Status *
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="input-field"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Excerpt *
                  </label>
                  <textarea
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    required
                    rows="2"
                    className="input-field resize-none"
                    placeholder="Brief summary of the post"
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Content *
                  </label>
                  <textarea
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    rows="10"
                    className="input-field resize-none"
                    placeholder="Full post content..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-charcoal mb-2">
                    Featured Image
                  </label>
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
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      featuredImage: e.target.value,
                      featuredImageFile: null // Clear file if URL is entered
                    })}
                    className="input-field"
                    placeholder="https://example.com/image.jpg"
                  />
                  {(formData.featuredImage || formData.featuredImageFile) && (
                    <div className="mt-3">
                      <img
                        src={formData.featuredImageFile ? URL.createObjectURL(formData.featuredImageFile) : formData.featuredImage}
                        alt="Preview"
                        className="w-full h-48 object-cover rounded-lg"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    checked={formData.isFeatured}
                    onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                    className="mr-2"
                  />
                  <label htmlFor="isFeatured" className="text-sm font-semibold text-charcoal">
                    Feature this post
                  </label>
                </div>

                <div className="flex space-x-4 pt-6 border-t">
                  <button type="submit" className="btn-primary">
                    {editingPost ? 'Update Post' : 'Create Post'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false);
                      resetForm();
                    }}
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
    </div>
  );
};

export default ManagePosts;
