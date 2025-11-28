/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error caught by boundary:', error, errorInfo);
    }

    // Log to error tracking service in production
    // Example: Sentry.captureException(error, { contexts: { react: errorInfo } });

    this.setState({
      error,
      errorInfo
    });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full card p-8 text-center">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-bold text-charcoal mb-2">
              Something went wrong
            </h1>
            <p className="text-neutral-600 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left mb-6 bg-neutral-100 p-4 rounded text-sm">
                <summary className="cursor-pointer font-semibold mb-2">
                  Error Details (Development Only)
                </summary>
                <pre className="whitespace-pre-wrap text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}

            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="btn-primary flex items-center gap-2"
              >
                <RefreshCw size={18} />
                Try Again
              </button>
              <Link to="/" className="btn-outline flex items-center gap-2">
                <Home size={18} />
                Go Home
              </Link>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

