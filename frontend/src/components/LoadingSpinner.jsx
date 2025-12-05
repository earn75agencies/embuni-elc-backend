/**
 * Enhanced LoadingSpinner Component
 * Interactive and friendly loading states with animations
 */

import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, Sparkles, Zap, Heart } from 'lucide-react';

const SIZE_CLASSES = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8',
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
};

const LoadingSpinner = ({ 
  size = 'md', 
  text = 'Loading...', 
  fullScreen = false,
  variant = 'default',
  className = '',
  showProgress = false,
  progress = 0,
  interactive = false
}) => {
  const [dots, setDots] = useState('');
  const [pulse, setPulse] = useState(false);

  // Animated dots for loading text
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Pulse effect for interactive loading
  useEffect(() => {
    if (interactive) {
      const pulseInterval = setInterval(() => {
        setPulse(prev => !prev);
      }, 2000);
      return () => clearInterval(pulseInterval);
    }
  }, [interactive]);

  const sizeClass = useMemo(() => SIZE_CLASSES[size] || SIZE_CLASSES.md, [size]);

  const getLoadingIcon = useMemo(() => {
    switch (variant) {
      case 'sparkles':
        return <Sparkles className={`animate-spin text-blue-500 ${sizeClass} ${pulse ? 'animate-pulse' : ''}`} />;
      case 'zap':
        return <Zap className={`animate-bounce text-yellow-500 ${sizeClass}`} />;
      case 'heart':
        return <Heart className={`animate-pulse text-red-500 ${sizeClass}`} />;
      default:
        return <Loader2 className={`animate-spin text-blue-600 ${sizeClass} ${pulse ? 'animate-pulse' : ''}`} />;
    }
  }, [variant, sizeClass, pulse]);

  const getFriendlyText = useMemo(() => {
    const friendlyTexts = [
      'Getting things ready...',
      'Almost there...',
      'Working our magic...',
      'Just a moment...',
      'Preparing something amazing...',
      'Hang tight, we\'re on it!',
      'Loading the good stuff...'
    ];
    
    if (text === 'Loading...') {
      return friendlyTexts[Math.floor(Math.random() * friendlyTexts.length)];
    }
    return text;
  }, [text]);

  const spinner = useMemo(() => (
    <div className={`flex flex-col items-center justify-center ${interactive ? 'cursor-pointer transform transition-transform hover:scale-105' : ''} ${className}`}>
      {/* Loading Icon */}
      <div className="relative">
        {getLoadingIcon}
        {interactive && (
          <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping" />
        )}
      </div>

      {/* Loading Text */}
      {text && (
        <div className="text-center mt-4">
          <p className={`text-sm text-gray-600 font-medium animate-fade-in`}>
            {getFriendlyText}{dots}
          </p>
          
          {/* Progress Bar */}
          {showProgress && (
            <div className="mt-3 w-48 bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(progress, 100)}%` }}
              >
                <div className="h-full bg-white bg-opacity-30 animate-pulse" />
              </div>
            </div>
          )}
          
          {/* Progress Percentage */}
          {showProgress && (
            <p className="text-xs text-gray-500 mt-1">
              {Math.round(progress)}% complete
            </p>
          )}
        </div>
      )}

      {/* Interactive Elements */}
      {interactive && (
        <div className="flex space-x-2 mt-2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
      )}
    </div>
  ), [sizeClass, text, className, interactive, getLoadingIcon, getFriendlyText, dots, showProgress, progress]);

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-90 backdrop-blur-sm z-50" role="status" aria-label="Loading">
        {spinner}
      </div>
    );
  }

  return spinner;
};

export default React.memo(LoadingSpinner);

