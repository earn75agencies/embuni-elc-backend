/**
 * News Page Component
 * Optimized with useMemo, useCallback for better performance
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Newspaper, Clock, User, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import ProductionImage from '../components/ProductionImage';
import { postService } from '../services/postService';

const News = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => [
    { value: 'all', label: 'All News' },
    { value: 'news', label: 'News' },
    { value: 'announcement', label: 'Announcements' },
    { value: 'achievement', label: 'Achievements' },
    { value: 'event-recap', label: 'Event Recaps' }
  ], []);

  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await postService.getAllPosts({ status: 'published' });
      const allPosts = data.posts || [];
      setPosts(allPosts);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  // Memoize filtered posts and featured post
  const { filteredPosts, featuredPost } = useMemo(() => {
    const filtered = activeCategory === 'all' 
      ? posts 
      : posts.filter(post => post.category === activeCategory);
    
    const featured = posts.find(post => post.isFeatured);
    
    return { filteredPosts: filtered, featuredPost: featured };
  }, [posts, activeCategory]);

  const formatDate = useCallback((date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="flex items-center space-x-3 mb-4">
            <Newspaper size={40} />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">News & Updates</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Stay informed about the latest news, achievements, and announcements from our community
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding">
        <div className="container-custom">
          {loading ? (
            <LoadingSpinner fullScreen text="Loading news..." />
          ) : (
            <>
              {/* Featured Post */}
              {featuredPost && (
                <div className="card overflow-hidden mb-12 hover:shadow-large transition-all">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="h-64 md:h-auto">
                      <ProductionImage
                        src={featuredPost.featuredImage}
                        alt={featuredPost.title}
                        fallbackType="post"
                        width={600}
                        height={400}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-8 md:p-12 flex flex-col justify-center">
                      <span className="inline-block px-3 py-1 bg-accent-yellow text-charcoal text-xs font-bold rounded-full mb-4 w-fit">
                        Featured
                      </span>
                      <h2 className="font-heading text-2xl md:text-3xl font-bold text-charcoal mb-4">
                        {featuredPost.title}
                      </h2>
                      <p className="text-neutral-600 mb-6 leading-relaxed">
                        {featuredPost.excerpt}
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-neutral-500 mb-6">
                        <div className="flex items-center">
                          <Clock size={16} className="mr-1" />
                          {formatDate(featuredPost.publishedAt)}
                        </div>
                        <div className="flex items-center">
                          <User size={16} className="mr-1" />
                          {featuredPost.author?.firstName} {featuredPost.author?.lastName}
                        </div>
                      </div>
                      <Link
                        to={`/news/${featuredPost._id}`}
                        className="inline-flex items-center text-primary font-semibold hover:text-primary-dark group"
                      >
                        Read Full Story
                        <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Category Filter */}
              <div className="flex justify-center space-x-2 mb-12 flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    onClick={() => setActiveCategory(category.value)}
                    className={`px-6 py-2 rounded-lg font-medium transition-all ${
                      activeCategory === category.value
                        ? 'bg-primary text-white'
                        : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>

              {/* Posts Grid */}
              {filteredPosts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredPosts.map((post) => (
                    <div key={post._id} className="card group hover:scale-105">
                      <div className="relative h-48 overflow-hidden">
                        <ProductionImage
                          src={post.featuredImage}
                          alt={post.title}
                          fallbackType="post"
                          width={400}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-accent-blue text-white text-xs font-bold rounded-full">
                            {post.category}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="font-heading text-xl font-bold text-charcoal mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                          {post.title}
                        </h3>
                        <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-4">
                          <span>{formatDate(post.publishedAt)}</span>
                          <span>{post.views || 0} views</span>
                        </div>
                        <Link
                          to={`/news/${post._id}`}
                          className="block w-full text-center btn-outline"
                        >
                          Read More
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Newspaper size={64} className="mx-auto text-neutral-400 mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-neutral-700 mb-2">
                    No Posts Found
                  </h3>
                  <p className="text-neutral-600">
                    Check back later for new updates!
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default News;
