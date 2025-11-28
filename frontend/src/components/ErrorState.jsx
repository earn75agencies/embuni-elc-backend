/**
 * Error State Component
 * Modern error display with retry functionality
 */

import React from 'react';
import { AlertCircle, RefreshCw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content.',
  onRetry,
  showHomeButton = true,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
      <h2 className="font-heading text-2xl font-bold text-charcoal mb-2">
        {title}
      </h2>
      <p className="text-neutral-600 mb-6 max-w-md">
        {message}
      </p>
      <div className="flex gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="btn-primary flex items-center gap-2"
            aria-label="Retry"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        )}
        {showHomeButton && (
          <Link
            to="/"
            className="btn-outline flex items-center gap-2"
            aria-label="Go to home page"
          >
            <Home size={18} />
            Go Home
          </Link>
        )}
      </div>
    </div>
  );
};

export default ErrorState;

