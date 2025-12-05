/**
 * Gallery Grid Component
 * Optimized with React.memo and useCallback for better performance
 */

import React, { useState, useCallback, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';
import ProductionImage from './ProductionImage';

const GalleryGrid = ({ items }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openLightbox = useCallback((item, index) => {
    setSelectedImage(item);
    setCurrentIndex(index);
  }, []);

  const closeLightbox = useCallback(() => {
    setSelectedImage(null);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentIndex(prev => {
      const newIndex = (prev - 1 + items.length) % items.length;
      setSelectedImage(items[newIndex]);
      return newIndex;
    });
  }, [items]);

  const goToNext = useCallback(() => {
    setCurrentIndex(prev => {
      const newIndex = (prev + 1) % items.length;
      setSelectedImage(items[newIndex]);
      return newIndex;
    });
  }, [items]);

  return (
    <>
      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item, index) => (
          <div
            key={item._id}
            onClick={() => openLightbox(item, index)}
            className="card cursor-pointer group aspect-square overflow-hidden"
          >
            <ProductionImage
              src={item.imageUrl}
              alt={item.title}
              fallbackType="gallery"
              width={400}
              height={400}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
              <div className="text-white">
                <h3 className="font-heading font-bold mb-1">{item.title}</h3>
                {item.category && (
                  <span className="text-xs px-2 py-1 bg-white/20 rounded">
                    {item.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-accent-yellow transition-colors"
          >
            <X size={32} />
          </button>

          <button
            onClick={goToPrevious}
            className="absolute left-4 text-white hover:text-accent-yellow transition-colors"
          >
            <ChevronLeft size={48} />
          </button>

          <button
            onClick={goToNext}
            className="absolute right-4 text-white hover:text-accent-yellow transition-colors"
          >
            <ChevronRight size={48} />
          </button>

          <div className="max-w-5xl w-full">
            <ProductionImage
              src={selectedImage.imageUrl}
              alt={selectedImage.title}
              fallbackType="gallery"
              className="w-full h-auto max-h-[80vh] object-contain"
            />
            <div className="text-white text-center mt-4">
              <h3 className="font-heading text-xl font-bold mb-2">
                {selectedImage.title}
              </h3>
              {selectedImage.description && (
                <p className="text-neutral-300">{selectedImage.description}</p>
              )}
              <p className="text-neutral-400 text-sm mt-2">
                {currentIndex + 1} / {items.length}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default React.memo(GalleryGrid);
