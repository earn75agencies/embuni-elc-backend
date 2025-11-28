import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Activity } from 'lucide-react';

/**
 * ActivityLog - Display admin activity timeline
 */
const ActivityLog = ({ activities = [], isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="card p-6">
        <div className="flex items-center justify-center py-12">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="card p-6 text-center">
        <Activity size={48} className="mx-auto text-neutral-300 mb-4" />
        <p className="text-neutral-600">No activities yet</p>
      </div>
    );
  }

  const getActionColor = (action) => {
    if (action.includes('create')) return 'bg-green-100 text-green-800';
    if (action.includes('update')) return 'bg-blue-100 text-blue-800';
    if (action.includes('delete')) return 'bg-red-100 text-red-800';
    if (action.includes('approve')) return 'bg-green-100 text-green-800';
    if (action.includes('reject')) return 'bg-red-100 text-red-800';
    return 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="card">
      <div className="p-6 border-b border-neutral-200">
        <h3 className="font-heading text-lg font-bold">Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-neutral-200">
        {activities.map((activity, index) => (
          <div key={index} className="p-6 hover:bg-neutral-50 transition-colors">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getActionColor(activity.action)}`}>
                  {activity.action.replace(/_/g, ' ')}
                </span>
              </div>
              
              <div className="flex-grow">
                <p className="font-medium text-charcoal">
                  {activity.module.charAt(0).toUpperCase() + activity.module.slice(1)}
                </p>
                
                {activity.details && (
                  <p className="text-sm text-neutral-600 mt-1">
                    {JSON.stringify(activity.details)}
                  </p>
                )}
                
                <p className="text-xs text-neutral-500 mt-2">
                  {formatDistanceToNow(new Date(activity.timestamp), { addSuffix: true })}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityLog;
