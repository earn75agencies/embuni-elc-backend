/**
 * Lazy Loading Image Component
 * Modern image component with lazy loading, error handling, and placeholder
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useIntersectionObserver } from '../hooks/useIntersectionObserver';
import { SkeletonImage } from './Skeleton';

const LazyImage = ({
  src,
  alt,
  className = '',
  placeholder,
  fallback,
  onLoad,
  onError,
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState(placeholder || null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [ref, isIntersecting] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    if (isIntersecting && src && !isLoaded && !hasError) {
      const img = new Image();
      
      img.onload = () => {
        setImageSrc(src);
        setIsLoaded(true);
        onLoad?.();
      };
      
      img.onerror = () => {
        setHasError(true);
        if (fallback) {
          setImageSrc(fallback);
        }
        onError?.();
      };
      
      img.src = src;
    }
  }, [isIntersecting, src, isLoaded, hasError, fallback, onLoad, onError]);

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`}>
      {!isLoaded && !hasError && (
        <div className="absolute inset-0">
          <SkeletonImage />
        </div>
      )}
      {imageSrc && (
        <img
          src={imageSrc}
          alt={alt}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          } ${className}`}
          loading="lazy"
          {...props}
        />
      )}
      {hasError && !fallback && (
        <div className="flex items-center justify-center bg-neutral-100 text-neutral-400 min-h-[200px]">
          <span className="text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default React.memo(LazyImage);

