/**
 * Empty State Component
 * Modern empty state display for lists, search results, etc.
 */

import React from 'react';
import { Inbox, Search, FolderOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No items found',
  message = 'There are no items to display at this time.',
  action,
  actionLabel,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center ${className}`}>
      <Icon className="w-16 h-16 text-neutral-400 mb-4" />
      <h3 className="font-heading text-xl font-semibold text-charcoal mb-2">
        {title}
      </h3>
      <p className="text-neutral-600 mb-6 max-w-md">
        {message}
      </p>
      {action && actionLabel && (
        <button
          onClick={action}
          className="btn-primary"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

// Pre-configured empty states
export const EmptySearchState = (props) => (
  <EmptyState
    icon={Search}
    title="No results found"
    message="Try adjusting your search terms or filters."
    {...props}
  />
);

export const EmptyListState = (props) => (
  <EmptyState
    icon={FolderOpen}
    title="No items yet"
    message="Items will appear here once they are added."
    {...props}
  />
);

export default EmptyState;

