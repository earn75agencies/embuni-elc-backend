/**
 * SuccessAnimation Component
 * Animated success confirmations and feedback components
 */

import React, { useEffect, useState } from 'react';
import { cn } from '../../utils/helpers';

// Success checkmark animation
export const SuccessCheckmark = ({ 
  size = 'medium', 
  animated = true, 
  delay = 0,
  className = '' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delay);

    return () => clearTimeout(timer);
  }, [delay]);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-16 h-16',
    xlarge: 'w-20 h-20'
  };

  return (
    <div className={cn(
      'relative inline-flex items-center justify-center',
      sizeClasses[size],
      className
    )}>
      <div className={cn(
        'absolute inset-0 rounded-full bg-green-100',
        isVisible && animated && 'animate-scale-in'
      )} />
      
      <svg
        className={cn(
          'relative z-10 text-green-500',
          sizeClasses[size],
          isVisible && animated && 'animate-scale-in'
        )}
        fill="currentColor"
        viewBox="0 0 20 20"
        style={{
          animationDelay: animated ? delay + 100 + 'ms' : '0ms'
        }}
      >
        <path
          fillRule="evenodd"
          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
          clipRule="evenodd"
          style={{
            strokeDasharray: 50,
            strokeDashoffset: isVisible ? 0 : 50,
            transition: 'stroke-dashoffset 0.3s ease-out',
            transitionDelay: animated ? delay + 200 + 'ms' : '0ms'
          }}
        />
      </svg>

      {/* Ripple effect */}
      {animated && isVisible && (
        <div className="absolute inset-0 rounded-full border-2 border-green-300 animate-ping" />
      )}
    </div>
  );
};

// Confetti animation
export const Confetti = ({ 
  trigger = false, 
  duration = 3000, 
  pieceCount = 50,
  className = '' 
}) => {
  const [pieces, setPieces] = useState([]);

  useEffect(() => {
    if (trigger) {
      const newPieces = Array.from({ length: pieceCount }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 2 + Math.random() * 2,
        animationDelay: Math.random() * 0.5,
        color: ['bg-red-400', 'bg-blue-400', 'bg-green-400', 'bg-yellow-400', 'bg-purple-400', 'bg-pink-400'][Math.floor(Math.random() * 6)]
      }));
      
      setPieces(newPieces);
      
      const timer = setTimeout(() => {
        setPieces([]);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [trigger, duration, pieceCount]);

  if (!trigger) return null;

  return (
    <div className={cn('fixed inset-0 pointer-events-none overflow-hidden z-50', className)}>
      {pieces.map((piece) => (
        <div
          key={piece.id}
          className={cn(
            'absolute w-2 h-3 opacity-80',
            piece.color
          )}
          style={{
            left: `${piece.left}%`,
            top: '-10px',
            animation: `confettiFall ${piece.animationDuration}s linear ${piece.animationDelay}s forwards`,
            transform: `rotate(${Math.random() * 360}deg)`
          }}
        />
      ))}
      
      <style jsx>{`
        @keyframes confettiFall {
          to {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

// Success modal/popup
export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = 'Success!', 
  message, 
  actionButton,
  autoCloseDelay = 3000,
  showConfetti = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showConfettiTrigger, setShowConfettiTrigger] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setShowConfettiTrigger(true);
      
      if (autoCloseDelay > 0) {
        const timer = setTimeout(() => {
          handleClose();
        }, autoCloseDelay);

        return () => clearTimeout(timer);
      }
    } else {
      setIsVisible(false);
      setShowConfettiTrigger(false);
    }
  }, [isOpen, autoCloseDelay]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 300);
  };

  if (!isOpen) return null;

  return (
    <>
      {showConfetti && (
        <Confetti trigger={showConfettiTrigger} duration={2000} />
      )}
      
      <div className={cn(
        'fixed inset-0 z-50 flex items-center justify-center p-4',
        isVisible ? 'animate-fade-in' : 'animate-fade-out'
      )}>
        {/* Backdrop */}
        <div 
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <div className={cn(
          'relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center',
          'animate-scale-in'
        )}>
          {/* Success Icon */}
          <div className="flex justify-center mb-6">
            <SuccessCheckmark size="xlarge" />
          </div>
          
          {/* Content */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3">
            {title}
          </h2>
          
          {message && (
            <p className="text-gray-600 mb-6 leading-relaxed">
              {message}
            </p>
          )}
          
          {/* Action Button */}
          {actionButton ? (
            <div className="flex justify-center">
              {actionButton}
            </div>
          ) : (
            <button
              onClick={handleClose}
              className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 hover-lift"
            >
              Got it!
            </button>
          )}
        </div>
      </div>
    </>
  );
};

// Inline success notification
export const SuccessNotification = ({ 
  message, 
  isVisible, 
  onHide,
  position = 'top-right' 
}) => {
  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 transform -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 transform -translate-x-1/2'
  };

  if (!isVisible) return null;

  return (
    <div className={cn(
      'fixed z-50 flex items-center gap-3 bg-white rounded-lg shadow-lg p-4 min-w-[300px]',
      positionClasses[position],
      'animate-slide-in-right'
    )}>
      <SuccessCheckmark size="small" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">
          {message}
        </p>
      </div>
      <button
        onClick={onHide}
        className="text-gray-400 hover:text-gray-600 transition-colors"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
};

// Progress celebration animation
export const ProgressCelebration = ({ 
  isComplete, 
  message, 
  size = 'medium' 
}) => {
  const [showCelebration, setShowCelebration] = useState(false);

  useEffect(() => {
    if (isComplete) {
      setShowCelebration(true);
      const timer = setTimeout(() => {
        setShowCelebration(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete]);

  if (!showCelebration) return null;

  return (
    <div className="relative inline-block">
      <Confetti trigger={showCelebration} pieceCount={30} duration={2000} />
      
      <div className="flex items-center gap-3 bg-green-50 rounded-lg p-4 animate-scale-in">
        <SuccessCheckmark size={size} />
        <div>
          <p className="font-medium text-green-900">
            🎉 {message || 'Goal Completed!'}
          </p>
          <p className="text-sm text-green-700">
            Great job! You've successfully completed this task.
          </p>
        </div>
      </div>
    </div>
  );
};

// Achievement unlocked animation
export const AchievementUnlocked = ({ 
  achievement, 
  isVisible, 
  onHide,
  delay = 0 
}) => {
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(() => {
        setShowAnimation(true);
      }, delay);
      return () => clearTimeout(timer);
    } else {
      setShowAnimation(false);
    }
  }, [isVisible, delay]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className={cn(
        'bg-gradient-to-r from-yellow-400 to-orange-500 text-white rounded-lg shadow-2xl p-6 min-w-[350px]',
        showAnimation ? 'animate-bounce' : 'opacity-0'
      )}>
        <div className="flex items-center gap-4">
          <div className="text-4xl animate-pulse">
            🏆
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">
              Achievement Unlocked!
            </h3>
            <p className="text-yellow-100">
              {achievement}
            </p>
          </div>
          <button
            onClick={onHide}
            className="text-yellow-200 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default SuccessCheckmark;