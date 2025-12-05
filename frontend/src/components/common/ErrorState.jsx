/**
 * ErrorState Component
 * A component for displaying error states with consistent styling
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../utils/helpers';

const ErrorState = ({
  title = 'Something went wrong',
  description,
  onRetry,
  className = ''
}) => {
  return (
    <div className={cn('text-center py-12', className)}>
      <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 text-red-400 mb-4">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-gray-500 mb-4 max-w-sm mx-auto">
          {description}
        </p>
      )}
      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
