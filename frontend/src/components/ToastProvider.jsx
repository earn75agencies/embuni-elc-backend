/**
 * Enhanced Toast Notification System
 * Interactive and friendly toast notifications with animations
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

const ToastContext = createContext();

// Toast types with their icons and colors
const TOAST_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-50 border-green-200 text-green-800',
    iconClass: 'text-green-500',
    progressClass: 'bg-green-500'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-50 border-red-200 text-red-800',
    iconClass: 'text-red-500',
    progressClass: 'bg-red-500'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    iconClass: 'text-yellow-500',
    progressClass: 'bg-yellow-500'
  },
  info: {
    icon: Info,
    className: 'bg-blue-50 border-blue-200 text-blue-800',
    iconClass: 'text-blue-500',
    progressClass: 'bg-blue-500'
  }
};

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, options = {}) => {
    const id = Date.now() + Math.random();
    const newToast = {
      id,
      message,
      type: options.type || 'info',
      duration: options.duration || 5000,
      persistent: options.persistent || false,
      action: options.action || null,
      progress: options.progress || null,
      ...options
    };

    setToasts(prev => [...prev, newToast]);

    // Auto-remove if not persistent
    if (!newToast.persistent && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const updateToast = useCallback((id, updates) => {
    setToasts(prev => 
      prev.map(toast => 
        toast.id === id ? { ...toast, ...updates } : toast
      )
    );
  }, []);

  const value = {
    toasts,
    addToast,
    removeToast,
    updateToast,
    success: (message, options) => addToast(message, { ...options, type: 'success' }),
    error: (message, options) => addToast(message, { ...options, type: 'error' }),
    warning: (message, options) => addToast(message, { ...options, type: 'warning' }),
    info: (message, options) => addToast(message, { ...options, type: 'info' })
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} onUpdate={updateToast} />
    </ToastContext.Provider>
  );
};

const ToastContainer = ({ toasts, onRemove, onUpdate }) => {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm w-full">
      {toasts.map((toast, index) => (
        <ToastItem
          key={toast.id}
          toast={toast}
          index={index}
          onRemove={onRemove}
          onUpdate={onUpdate}
        />
      ))}
    </div>
  );
};

const ToastItem = ({ toast, index, onRemove, onUpdate }) => {
  const [progress, setProgress] = useState(toast.progress || 0);
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const typeConfig = TOAST_TYPES[toast.type] || TOAST_TYPES.info;
  const Icon = typeConfig.icon;

  // Animate in
  React.useEffect(() => {
    setTimeout(() => setIsVisible(true), 50);
  }, []);

  // Update progress
  React.useEffect(() => {
    if (toast.progress !== undefined) {
      setProgress(toast.progress);
    }
  }, [toast.progress]);

  const handleRemove = () => {
    setIsVisible(false);
    setTimeout(() => onRemove(toast.id), 300);
  };

  const handleAction = () => {
    if (toast.action) {
      toast.action.onClick();
      if (toast.action.closeOnClick) {
        handleRemove();
      }
    }
  };

  const getFriendlyMessage = (message) => {
    const friendlyMessages = {
      'Login successful': 'Welcome back! 🎉',
      'Registration successful': 'Account created successfully! 🎊',
      'Password updated': 'Password changed successfully! 🔐',
      'Profile updated': 'Profile updated successfully! ✨',
      'Logged out': 'You have been logged out. 👋',
      'Error occurred': 'Oops! Something went wrong. 😅',
      'Network error': 'Connection issue. Please check your internet. 🌐'
    };

    return friendlyMessages[message] || message;
  };

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-full opacity-0 scale-95'}
        ${index > 0 ? 'mt-2' : ''}
      `}
      style={{
        animationDelay: `${index * 50}ms`
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`
        relative flex items-start p-4 rounded-lg border shadow-lg backdrop-blur-sm
        ${typeConfig.className}
        ${isHovered ? 'shadow-xl transform scale-105' : ''}
        transition-all duration-200
      `}>
        {/* Icon */}
        <div className={`flex-shrink-0 mr-3 ${typeConfig.iconClass}`}>
          <Icon className="w-5 h-5" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium break-words">
            {getFriendlyMessage(toast.message)}
          </p>
          
          {/* Action Button */}
          {toast.action && (
            <button
              onClick={handleAction}
              className="mt-2 text-xs font-medium underline hover:no-underline focus:outline-none"
            >
              {toast.action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        {!toast.persistent && (
          <button
            onClick={handleRemove}
            className="flex-shrink-0 ml-2 p-1 rounded-full hover:bg-black hover:bg-opacity-10 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-transparent"
          >
            <X className="w-4 h-4 opacity-60 hover:opacity-100" />
          </button>
        )}

        {/* Progress Bar */}
        {toast.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${typeConfig.progressClass}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {/* Auto-remove Progress */}
        {!toast.persistent && toast.duration > 0 && !isHovered && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black bg-opacity-10 rounded-b-lg overflow-hidden">
            <div
              className={`h-full ${typeConfig.progressClass}`}
              style={{
                animation: `shrink ${toast.duration}ms linear forwards`
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export default ToastProvider;