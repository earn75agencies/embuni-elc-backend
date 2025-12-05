/**
 * ProgressIndicator Component
 * Interactive progress indicators with animations and validation feedback
 */

import React, { useState, useEffect } from 'react';
import { cn } from '../../utils/helpers';

const ProgressIndicator = ({
  value = 0,
  max = 100,
  size = 'medium', // 'small', 'medium', 'large'
  variant = 'default', // 'default', 'success', 'warning', 'error', 'info'
  showLabel = true,
  label,
  animated = true,
  striped = false,
  indeterminate = false,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (indeterminate) return;
    
    const timer = setTimeout(() => {
      setDisplayValue(value);
      if (value >= max) {
        setIsComplete(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value, max, indeterminate]);

  const percentage = Math.min((displayValue / max) * 100, 100);
  
  const sizeClasses = {
    small: 'h-1',
    medium: 'h-2',
    large: 'h-3'
  };

  const labelSizeClasses = {
    small: 'text-xs',
    medium: 'text-sm',
    large: 'text-base'
  };

  const variantClasses = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    error: 'bg-red-500',
    info: 'bg-purple-500'
  };

  const bgVariantClasses = {
    default: 'bg-blue-100',
    success: 'bg-green-100',
    warning: 'bg-yellow-100',
    error: 'bg-red-100',
    info: 'bg-purple-100'
  };

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {showLabel && (label || value !== undefined) && (
        <div className="flex justify-between items-center mb-2">
          <span className={cn(
            'font-medium text-gray-700',
            labelSizeClasses[size]
          )}>
            {label || 'Progress'}
          </span>
          <span className={cn(
            'text-gray-500 font-mono',
            labelSizeClasses[size]
          )}>
            {indeterminate ? '...' : `${Math.round(percentage)}%`}
          </span>
        </div>
      )}

      {/* Progress Bar Container */}
      <div className={cn(
        'relative overflow-hidden rounded-full',
        sizeClasses[size],
        bgVariantClasses[variant]
      )}>
        {/* Progress Bar */}
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out relative overflow-hidden',
            variantClasses[variant],
            animated && 'progress-animate',
            striped && 'bg-gradient-to-r from-transparent via-white/20 to-transparent bg-[length:20px_20px]',
            indeterminate && 'animate-pulse',
            isComplete && 'animate-pulse'
          )}
          style={{
            width: indeterminate ? '100%' : `${percentage}%`,
            ...(striped && animated && {
              backgroundPosition: '0 0',
              animation: 'shimmer 1s linear infinite'
            }),
            ...(indeterminate && {
              backgroundImage: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)',
              animation: 'loadingDots 1.5s ease-in-out infinite'
            })
          }}
        >
          {/* Shimmer effect */}
          {animated && !indeterminate && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent shimmer"></div>
          )}
        </div>

        {/* Completion indicator */}
        {isComplete && !indeterminate && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-scale-in">
              <svg className={cn(
                'text-white',
                size === 'small' ? 'w-3 h-3' : size === 'large' ? 'w-5 h-5' : 'w-4 h-4'
              )} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Status messages */}
      {isComplete && (
        <div className="mt-2 text-sm text-green-600 animate-fade-in">
          ✓ Complete!
        </div>
      )}
    </div>
  );
};

// CircularProgress component for circular progress indicators
export const CircularProgress = ({
  value = 0,
  max = 100,
  size = 48,
  strokeWidth = 4,
  variant = 'default',
  showLabel = true,
  label,
  animated = true,
  className = ''
}) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
      if (value >= max) {
        setIsComplete(true);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [value, max]);

  const percentage = Math.min((displayValue / max) * 100, 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const variantColors = {
    default: '#3B82F6',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444',
    info: '#8B5CF6'
  };

  return (
    <div className={cn('inline-flex flex-col items-center', className)}>
      <div className="relative">
        {/* Background circle */}
        <svg
          width={size}
          height={size}
          className="transform -rotate-90"
        >
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={variantColors[variant]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500 ease-out',
              animated && 'progress-animate'
            )}
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {isComplete ? (
            <div className="animate-scale-in">
              <svg 
                className={cn('text-green-500', size === 32 ? 'w-4 h-4' : size === 64 ? 'w-6 h-6' : 'w-5 h-5')} 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          ) : (
            <span className={cn(
              'font-semibold text-gray-700',
              size === 32 ? 'text-xs' : size === 64 ? 'text-base' : 'text-sm'
            )}>
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      </div>

      {/* Label */}
      {showLabel && label && (
        <span className="mt-2 text-sm text-gray-600 text-center">
          {label}
        </span>
      )}
    </div>
  );
};

// StepProgress component for multi-step processes
export const StepProgress = ({
  steps = [],
  currentStep = 0,
  variant = 'default',
  animated = true,
  className = ''
}) => {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const isActive = index === currentStep;
          const isCompleted = index < currentStep;
          const isLast = index === steps.length - 1;

          return (
            <React.Fragment key={index}>
              {/* Step circle */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300',
                    isCompleted 
                      ? 'bg-green-500 text-white animate-scale-in' 
                      : isActive 
                        ? 'bg-blue-500 text-white animate-pulse' 
                        : 'bg-gray-200 text-gray-500',
                    animated && 'hover-scale'
                  )}
                >
                  {isCompleted ? (
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    index + 1
                  )}
                </div>
                
                {/* Step label */}
                <span className={cn(
                  'mt-2 text-xs text-center max-w-20',
                  isActive ? 'text-gray-900 font-medium' : 'text-gray-500'
                )}>
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {!isLast && (
                <div className="flex-1 mx-2 h-0.5 bg-gray-200 relative">
                  <div
                    className={cn(
                      'absolute top-0 left-0 h-full bg-green-500 transition-all duration-500',
                      isCompleted ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default ProgressIndicator;