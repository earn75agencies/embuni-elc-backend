/**
 * Enhanced EmptyState Component
 * Interactive empty states with animations, helpful CTAs, and engaging illustrations
 */

import React from 'react';
import { cn } from '../../utils/helpers';

// SVG Icons for different empty states
const SearchIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);

const DocumentIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

const InboxIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const HeartIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
  </svg>
);

const CalendarIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-float" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const PhotoIcon = () => (
  <svg className="w-12 h-12 text-gray-400 animate-scale-in" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const EmptyState = ({
  type = 'default', // 'search', 'documents', 'inbox', 'favorites', 'events', 'gallery', 'default'
  title,
  description,
  action,
  secondaryAction,
  className = '',
  animated = true,
  size = 'medium' // 'small', 'medium', 'large'
}) => {
  // Get appropriate icon based on type
  const getIcon = () => {
    const iconMap = {
      search: <SearchIcon />,
      documents: <DocumentIcon />,
      inbox: <InboxIcon />,
      favorites: <HeartIcon />,
      events: <CalendarIcon />,
      gallery: <PhotoIcon />,
      default: <InboxIcon />
    };
    return iconMap[type] || iconMap.default;
  };

  // Size classes
  const sizeClasses = {
    small: 'py-8',
    medium: 'py-12',
    large: 'py-16'
  };

  // Icon size classes
  const iconSizeClasses = {
    small: 'h-8 w-8',
    medium: 'h-12 w-12',
    large: 'h-16 w-16'
  };

  // Default content based on type
  const getDefaultContent = () => {
    const contentMap = {
      search: {
        title: 'No results found',
        description: 'Try adjusting your search terms or filters to find what you\'re looking for.',
        secondaryAction: 'Clear filters'
      },
      documents: {
        title: 'No documents yet',
        description: 'Upload your first document to get started with organizing your files.',
        secondaryAction: 'Learn more'
      },
      inbox: {
        title: 'No messages yet',
        description: 'Your inbox is empty. When you receive messages, they\'ll appear here.',
        secondaryAction: 'Check settings'
      },
      favorites: {
        title: 'No favorites yet',
        description: 'Start adding items to your favorites to quickly access them later.',
        secondaryAction: 'Explore items'
      },
      events: {
        title: 'No upcoming events',
        description: 'There are no events scheduled at the moment. Check back later!',
        secondaryAction: 'View past events'
      },
      gallery: {
        title: 'No images yet',
        description: 'Add your first image to start building your gallery collection.',
        secondaryAction: 'Import photos'
      },
      default: {
        title: 'Nothing here yet',
        description: 'This section is currently empty. Start by adding some content.',
        secondaryAction: 'Get help'
      }
    };
    return contentMap[type] || contentMap.default;
  };

  const defaultContent = getDefaultContent();
  const finalTitle = title || defaultContent.title;
  const finalDescription = description || defaultContent.description;

  return (
    <div className={cn(
      'text-center flex flex-col items-center justify-center',
      sizeClasses[size],
      animated && 'animate-fade-in',
      className
    )}>
      {/* Icon with animated background */}
      <div className={cn(
        'mx-auto flex items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 text-gray-400 mb-6 relative overflow-hidden',
        iconSizeClasses[size],
        'hover-scale'
      )}>
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
        <div className="relative z-10">
          {getIcon()}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto space-y-3 animate-slide-in-up">
        {finalTitle && (
          <h3 className={cn(
            'font-semibold text-gray-900',
            size === 'small' ? 'text-base' : size === 'large' ? 'text-xl' : 'text-lg'
          )}>
            {finalTitle}
          </h3>
        )}
        
        {finalDescription && (
          <p className={cn(
            'text-gray-500 leading-relaxed',
            size === 'small' ? 'text-sm' : 'text-base'
          )}>
            {finalDescription}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className={cn(
        'flex flex-col sm:flex-row gap-3 items-center justify-center mt-6',
        'animate-slide-in-up'
      )}>
        {action && (
          <div className="hover-lift">
            {action}
          </div>
        )}
        
        {secondaryAction && typeof secondaryAction === 'string' ? (
          <button
            className={cn(
              'text-sm text-gray-500 hover:text-gray-700 transition-colors duration-200',
              'hover:underline focus:outline-none focus-ring rounded px-2 py-1'
            )}
            onClick={() => {
              // Handle secondary action click
              console.log('Secondary action clicked');
            }}
          >
            {secondaryAction}
          </button>
        ) : (
          secondaryAction && (
            <div className="hover-lift">
              {secondaryAction}
            </div>
          )
        )}
      </div>

      {/* Decorative elements for larger empty states */}
      {size === 'large' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-blue-200 rounded-full animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-3 h-3 bg-purple-200 rounded-full animate-bounce"></div>
          <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-pink-200 rounded-full animate-pulse"></div>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
