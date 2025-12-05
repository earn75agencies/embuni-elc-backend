/**
 * Production-ready image component with fallback handling
 * Replaces placeholder images with branded fallbacks
 */

import React, { useState, useRef, useEffect } from 'react';
import { getImageUrl, getFallbackImage } from '../utils/imageUtils';

const ProductionImage = ({ 
  src, 
  alt, 
  className = '', 
  fallbackType = 'default',
  width = 400, 
  height = 300,
  onLoad,
  onError,
  ...props 
}) => {
  const [imageSrc, setImageSrc] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (src) {
      const processedSrc = getImageUrl(src);
      setImageSrc(processedSrc);
      setHasError(false);
      setIsLoading(true);
    } else {
      // Use branded fallback immediately if no src
      setImageSrc(getFallbackImage(fallbackType, width, height));
      setHasError(false);
      setIsLoading(false);
    }
  }, [src, fallbackType, width, height]);

  const handleLoad = (e) => {
    setIsLoading(false);
    setHasError(false);
    if (onLoad) onLoad(e);
  };

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setIsLoading(false);
      // Use branded fallback on error
      setImageSrc(getFallbackImage(fallbackType, width, height));
      if (onError) onError();
    }
  };

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-neutral-100 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"></div>
        </div>
      )}
      
      <img
        ref={imgRef}
        src={imageSrc}
        alt={alt || 'Image'}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
        {...props}
      />
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-50">
          <div className="text-center p-4">
            <div className="w-12 h-12 mx-auto mb-2 bg-primary-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-xs text-neutral-500">Image not available</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductionImage;
