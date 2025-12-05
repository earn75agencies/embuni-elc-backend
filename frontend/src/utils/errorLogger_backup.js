/**
 * Error Logger Utility
 * Centralized error logging and reporting system
 */

import { toast } from 'react-toastify';

// Error levels
export const ERROR_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal'
};

// Error categories
export const ERROR_CATEGORIES = {
  AUTH: 'auth',
  NETWORK: 'network',
  VALIDATION: 'validation',
  COMPONENT: 'component',
  API: 'api',
  USER_ACTION: 'user_action',
  SYSTEM: 'system'
};

class ErrorLogger {
  constructor() {
    this.isProduction = import.meta.env.PROD;
    this.errorQueue = [];
    this.maxQueueSize = 100;
    this.flushInterval = 30000; // 30 seconds
    this.sessionId = this.generateSessionId();
    
    // Start periodic flush
    if (this.isProduction) {
      setInterval(() => this.flushErrors(), this.flushInterval);
    }
  }

  // Generate unique session ID
  generateSessionId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Main error logging method
  log(error, context = {}) {
    const errorContext = this.createErrorContext(error, context);
    
    // Add to queue
    this.errorQueue.push(errorContext);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
    
    // Log to console in development
    if (!this.isProduction) {
      this.logToConsole(errorContext);
    }
    
    // Show user-friendly message for critical errors
    if (errorContext.level === ERROR_LEVELS.ERROR || errorContext.level === ERROR_LEVELS.FATAL) {
      this.showUserNotification(errorContext);
    }
    
    // Immediately flush for fatal errors
    if (errorContext.level === ERROR_LEVELS.FATAL) {
      this.flushErrors();
    }
  }

  // Create standardized error context
  createErrorContext(error, context) {
    return {
      timestamp: new Date().toISOString(),
      level: context.level || ERROR_LEVELS.ERROR,
      category: context.category || ERROR_CATEGORIES.SYSTEM,
      message: error?.message || 'Unknown error occurred',
      stack: error?.stack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: context.userId || localStorage.getItem('userId'),
      sessionId: context.sessionId || sessionStorage.getItem('sessionId'),
      action: context.action,
      component: context.component,
      additionalData: context.additionalData || {},
      fingerprint: this.generateErrorFingerprint(error, context)
    };
  }

  // Generate unique error fingerprint for grouping
  generateErrorFingerprint(error, context) {
    const fingerprintData = {
      message: error?.message || '',
      stack: error?.stack?.split('\n')[1] || '', // Second line of stack trace
      category: context.category,
      action: context.action,
      component: context.component
    };
    
    return btoa(JSON.stringify(fingerprintData)).substr(0, 16);
  }

  // Log to console in development
  logToConsole(errorContext) {
    const { level, message, stack, component, action } = errorContext;
    const logMessage = `[${level.toUpperCase()}] ${component ? `${component}: ` : ''}${message}`;
    
    switch (level) {
      case ERROR_LEVELS.DEBUG:
        console.debug(logMessage, errorContext);
        break;
      case ERROR_LEVELS.INFO:
        console.info(logMessage, errorContext);
        break;
      case ERROR_LEVELS.WARN:
        console.warn(logMessage, errorContext);
        break;
      case ERROR_LEVELS.ERROR:
      case ERROR_LEVELS.FATAL:
        console.error(logMessage, errorContext);
        break;
      default:
        console.log(logMessage, errorContext);
    }
  }

  // Show user-friendly notification
  showUserNotification(errorContext) {
    const userMessages = {
      [ERROR_CATEGORIES.NETWORK]: 'Network error. Please check your connection.',
      [ERROR_CATEGORIES.AUTH]: 'Authentication error. Please login again.',
      [ERROR_CATEGORIES.VALIDATION]: 'Please check your input and try again.',
      [ERROR_CATEGORIES.API]: 'Server error. Please try again later.',
      [ERROR_CATEGORIES.USER_ACTION]: 'Action failed. Please try again.',
      [ERROR_CATEGORIES.SYSTEM]: 'Something went wrong. Please refresh the page.'
    };
    
    const message = userMessages[errorContext.category] || 'An error occurred.';
    
    toast.error(message, {
      position: 'top-right',
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true
    });
  }

  // Flush errors to server
  async flushErrors() {
    if (this.errorQueue.length === 0) return;
    
    const errorsToSend = [...this.errorQueue];
    this.errorQueue = [];
    
    try {
      // In a real implementation, send to your error tracking service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ errors: errorsToSend })
      // });
      
      console.debug('Flushed errors:', errorsToSend.length);
    } catch (err) {
      // Re-queue errors if flush fails
      this.errorQueue.unshift(...errorsToSend);
      console.warn('Failed to flush errors:', err);
    }
  }

  // Convenience methods
  debug(error, context) {
    this.log(error, { ...context, level: ERROR_LEVELS.DEBUG });
  }

  info(error, context) {
    this.log(error, { ...context, level: ERROR_LEVELS.INFO });
  }

  warn(error, context) {
    this.log(error, { ...context, level: ERROR_LEVELS.WARN });
  }

  error(error, context) {
    this.log(error, { ...context, level: ERROR_LEVELS.ERROR });
  }

  fatal(error, context) {
    this.log(error, { ...context, level: ERROR_LEVELS.FATAL });
  }
}

// Create singleton instance
const errorLogger = new ErrorLogger();

// Export convenience functions
export const logError = (error, context) => errorLogger.error(error, context);
export const logWarn = (error, context) => errorLogger.warn(error, context);
export const logInfo = (error, context) => errorLogger.info(error, context);
export const logDebug = (error, context) => errorLogger.debug(error, context);
export const logFatal = (error, context) => errorLogger.fatal(error, context);

export default errorLogger;