/**
 * SkeletonImage Component
 * A skeleton placeholder for images while loading
 */

import React from 'react';

const SkeletonImage = ({ 
  width = '100%', 
  height = '200px', 
  className = '' 
}) => {
  return (
    <div 
      className={`animate-pulse bg-gray-200 rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
};

export { SkeletonImage };
export default SkeletonImage;
