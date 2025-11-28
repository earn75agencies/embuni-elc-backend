/**
 * Gallery Page Component
 * Optimized with useMemo, useCallback for better performance
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Image as ImageIcon, Filter } from 'lucide-react';
import GalleryGrid from '../components/GalleryGrid';
import LoadingSpinner from '../components/LoadingSpinner';
import { galleryService } from '../services/galleryService';

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = useMemo(() => [
    { value: 'all', label: 'All Photos' },
    { value: 'event', label: 'Events' },
    { value: 'community-service', label: 'Community Service' },
    { value: 'training', label: 'Training' },
    { value: 'social', label: 'Social' },
    { value: 'achievement', label: 'Achievements' }
  ], []);

  const fetchGalleryItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await galleryService.getAllItems();
      const allItems = data.items || [];
      setItems(allItems);
    } catch (error) {
      console.error('Error fetching gallery items:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGalleryItems();
  }, [fetchGalleryItems]);

  // Memoize filtered items to avoid recalculation
  const filteredItems = useMemo(() => {
    if (activeCategory === 'all') return items;
    return items.filter(item => item.category === activeCategory);
  }, [items, activeCategory]);

  const handleCategoryFilter = useCallback((category) => {
    setActiveCategory(category);
  }, []);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="flex items-center space-x-3 mb-4">
            <ImageIcon size={40} />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Gallery</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Explore moments captured from our events, activities, and community impact
          </p>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="section-padding">
        <div className="container-custom">
          {/* Category Filter */}
          <div className="flex items-center justify-center space-x-2 mb-12 flex-wrap gap-2">
            <Filter size={20} className="text-neutral-600" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryFilter(category.value)}
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

          {/* Gallery Grid */}
          {loading ? (
            <LoadingSpinner fullScreen text="Loading gallery..." />
          ) : filteredItems.length > 0 ? (
            <GalleryGrid items={filteredItems} />
          ) : (
            <div className="text-center py-20">
              <ImageIcon size={64} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="font-heading text-2xl font-bold text-neutral-700 mb-2">
                No Images Found
              </h3>
              <p className="text-neutral-600">
                Check back later for new photos!
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Gallery;
