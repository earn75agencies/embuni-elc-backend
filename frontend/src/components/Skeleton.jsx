/**
 * Skeleton Loading Components
 * Modern loading placeholders for better UX
 */

import React from 'react';

/**
 * Base Skeleton component
 */
export const Skeleton = ({ 
  className = '', 
  variant = 'rectangular',
  width,
  height,
  animation = 'pulse',
  ...props 
}) => {
  const baseClasses = 'bg-neutral-200 dark:bg-neutral-700';
  
  const variantClasses = {
    rectangular: 'rounded',
    circular: 'rounded-full',
    text: 'rounded h-4',
    rounded: 'rounded-lg'
  };

  const animationClasses = {
    pulse: 'animate-pulse',
    wave: 'animate-shimmer',
    none: ''
  };

  const style = {
    ...(width && { width: typeof width === 'number' ? `${width}px` : width }),
    ...(height && { height: typeof height === 'number' ? `${height}px` : height })
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      {...props}
    />
  );
};

/**
 * Skeleton for text lines
 */
export const SkeletonText = ({ lines = 3, className = '' }) => (
  <div className={`space-y-2 ${className}`}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? '75%' : '100%'}
        className="h-4"
      />
    ))}
  </div>
);

/**
 * Skeleton for cards
 */
export const SkeletonCard = ({ className = '' }) => (
  <div className={`card p-6 ${className}`}>
    <Skeleton variant="rounded" width="60%" height={24} className="mb-4" />
    <SkeletonText lines={3} className="mb-4" />
    <Skeleton variant="rounded" width="40%" height={32} />
  </div>
);

/**
 * Skeleton for avatar
 */
export const SkeletonAvatar = ({ size = 40, className = '' }) => (
  <Skeleton
    variant="circular"
    width={size}
    height={size}
    className={className}
  />
);

/**
 * Skeleton for image
 */
export const SkeletonImage = ({ aspectRatio = '16/9', className = '' }) => (
  <div
    className={`w-full ${className}`}
    style={{ aspectRatio }}
  >
    <Skeleton variant="rounded" width="100%" height="100%" />
  </div>
);

/**
 * Skeleton for table rows
 */
export const SkeletonTableRow = ({ columns = 4, className = '' }) => (
  <tr className={className}>
    {Array.from({ length: columns }).map((_, i) => (
      <td key={i} className="px-4 py-3">
        <Skeleton variant="text" width={i === 0 ? '80%' : '60%'} />
      </td>
    ))}
  </tr>
);

export default Skeleton;

