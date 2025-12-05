/**
 * Enhanced Production Error Boundary
 * Comprehensive error boundary with logging, reporting, and recovery features
 */

import React from 'react';
import { AlertTriangle, RefreshCw, Home, Mail, Bug } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';

class ProductionErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorId: null,
      retryCount: 0,
      maxRetries: 3
    };
  }

  static getDerivedStateFromError(error) {
    return { 
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Log error to monitoring service
    this.logError(error, errorInfo);

    // Show user-friendly notification
    this.showErrorNotification();

    // Track error in performance monitor
    if (window.performanceMonitor) {
      window.performanceMonitor.recordMetric({
        type: 'error',
        component: 'ProductionErrorBoundary',
        error: error.message,
        stack: error.stack,
        errorId: this.state.errorId,
        timestamp: Date.now()
      });
    }
  }

  logError = (error, errorInfo) => {
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      buildVersion: process.env.VITE_APP_VERSION || 'unknown',
      environment: process.env.NODE_ENV,
      retryCount: this.state.retryCount,
      browserInfo: this.getBrowserInfo(),
      connectionInfo: this.getConnectionInfo()
    };

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', errorData);
    }

    // Send to error logging service
    this.sendToErrorService(errorData);

    // Send to external monitoring service (if configured)
    if (process.env.VITE_ERROR_REPORTING_URL) {
      this.sendToExternalService(errorData);
    }

    // Send to Sentry if available
    if (window.Sentry) {
      window.Sentry.captureException(error, {
        extra: {
          errorId: this.state.errorId,
          componentStack: errorInfo.componentStack,
          userId: this.getUserId(),
          sessionId: this.getSessionId(),
          retryCount: this.state.retryCount
        }
      });
    }
  };

  sendToErrorService = async (errorData) => {
    try {
      await fetch(`${process.env.VITE_API_URL}/api/errors/report`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData)
      });
    } catch (serviceError) {
      console.error('Failed to send error to service:', serviceError);
    }
  };

  sendToExternalService = async (errorData) => {
    try {
      await fetch(process.env.VITE_ERROR_REPORTING_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(errorData),
      });
    } catch (reportingError) {
      console.error('Failed to send error report:', reportingError);
    }
  };

  showErrorNotification = () => {
    const { retryCount } = this.state;
    
    if (retryCount < this.state.maxRetries) {
      toast.error(
        'Something went wrong. You can try refreshing the page.',
        {
          toastId: this.state.errorId,
          onClick: () => this.handleRetry(),
          autoClose: 10000,
          closeButton: true,
          closeOnClick: false,
          draggable: false,
        }
      );
    } else {
      toast.error(
        'An error occurred. Please contact support if the problem persists.',
        {
          toastId: this.state.errorId,
          autoClose: false,
          closeButton: true,
          closeOnClick: false,
          draggable: false,
        }
      );
    }
  };

  getUserId = () => {
    try {
      const authData = localStorage.getItem('authData');
      if (authData) {
        const { user } = JSON.parse(authData);
        return user?._id || 'anonymous';
      }
    } catch (e) {
      // Ignore errors in getting user ID
    }
    return 'anonymous';
  };

  getSessionId = () => {
    // Get or create session ID
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  };

  getBrowserInfo = () => {
    return {
      name: navigator.appName,
      version: navigator.appVersion,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine
    };
  };

  getConnectionInfo = () => {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt
      };
    }
    return null;
  };

  handleRetry = () => {
    if (this.state.retryCount < this.state.maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1
      }));
    }
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleReportError = () => {
    const { error, errorInfo, errorId } = this.state;
    const errorReport = {
      errorId,
      message: error?.message,
      stack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString()
    };

    // Create mailto link with error details
    const subject = encodeURIComponent(`Error Report - ${errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n\n` +
      `Error Message: ${errorReport.message}\n\n` +
      `Stack Trace:\n${errorReport.stack}\n\n` +
      `Component Stack:\n${errorReport.componentStack}\n\n` +
      `User Agent: ${errorReport.userAgent}\n` +
      `URL: ${errorReport.url}\n` +
      `Timestamp: ${errorReport.timestamp}\n\n` +
      `Please describe what you were doing when this error occurred:`
    );

    window.location.href = `mailto:support@equityleaders.embuni.ac.ke?subject=${subject}&body=${body}`;
  };

  render() {
    if (this.state.hasError) {
      const { retryCount, maxRetries, errorId } = this.state;

      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
              </div>
            </div>
            
            <h1 className="text-2xl font-bold text-neutral-900 mb-4">
              Something went wrong
            </h1>
            
            <p className="text-neutral-600 mb-4">
              We're sorry, but something unexpected happened. Our team has been notified.
            </p>
            
            <p className="text-sm text-neutral-500 mb-6">
              Error ID: {errorId}
            </p>

            <div className="space-y-3">
              {retryCount < maxRetries && (
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again ({maxRetries - retryCount} attempts left)
                </button>
              )}

              <button
                onClick={this.handleReload}
                className="w-full flex items-center justify-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Reload Page
              </button>

              <Link
                to="/"
                className="w-full flex items-center justify-center gap-2 bg-neutral-200 text-neutral-700 px-4 py-2 rounded-lg hover:bg-neutral-300 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go to Homepage
              </Link>

              <button
                onClick={this.handleReportError}
                className="w-full flex items-center justify-center gap-2 text-blue-600 hover:text-blue-800 text-sm py-2"
              >
                <Mail className="w-4 h-4" />
                Report this issue
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-neutral-500 hover:text-neutral-700 flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Error Details (Development Only)
                </summary>
                <div className="mt-2 p-4 bg-gray-100 rounded text-xs overflow-auto max-h-60">
                  <div className="mb-2">
                    <strong>Error ID:</strong> {errorId}
                  </div>
                  <div className="mb-2">
                    <strong>Retry Count:</strong> {retryCount}/{maxRetries}
                  </div>
                  <div className="mb-2">
                    <strong>Error:</strong> {this.state.error?.message}
                  </div>
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="whitespace-pre-wrap">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = (Component, fallbackProps = {}) => {
  const WrappedComponent = (props) => (
    <ProductionErrorBoundary {...fallbackProps}>
      <Component {...props} />
    </ProductionErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};

export default ProductionErrorBoundary;
