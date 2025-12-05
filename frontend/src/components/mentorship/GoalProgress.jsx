import React, { useState } from 'react';
import { Target, Calendar, Edit2, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const GoalProgress = ({ goal, onUpdate, isMentor }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [progress, setProgress] = useState(goal.progress || 0);
  const [status, setStatus] = useState(goal.status || 'not_started');
  const [notes, setNotes] = useState('');

  const getStatusIcon = (status) => {
    const icons = {
      not_started: <Clock className="w-4 h-4" />,
      in_progress: <Target className="w-4 h-4" />,
      completed: <CheckCircle className="w-4 h-4" />,
      cancelled: <AlertCircle className="w-4 h-4" />
    };
    return icons[status] || <Clock className="w-4 h-4" />;
  };

  const getStatusColor = (status) => {
    const colors = {
      not_started: 'text-gray-600 bg-gray-50 border-gray-200',
      in_progress: 'text-blue-600 bg-blue-50 border-blue-200',
      completed: 'text-green-600 bg-green-50 border-green-200',
      cancelled: 'text-red-600 bg-red-50 border-red-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 20) return 'bg-yellow-500';
    return 'bg-gray-300';
  };

  const handleSave = async () => {
    try {
      await onUpdate({ progress, status, notes });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating goal:', error);
    }
  };

  const handleCancel = () => {
    setProgress(goal.progress || 0);
    setStatus(goal.status || 'not_started');
    setNotes('');
    setIsEditing(false);
  };

  const isOverdue = goal.targetDate && new Date(goal.targetDate) < new Date() && status !== 'completed';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900">{goal.title}</h4>
            <div className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
              {getStatusIcon(status)}
              <span className="ml-1 capitalize">{status.replace('_', ' ')}</span>
            </div>
            {isOverdue && (
              <div className="flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-200">
                <AlertCircle className="w-3 h-3 mr-1" />
                Overdue
              </div>
            )}
          </div>
          
          {goal.description && (
            <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
          )}

          {goal.targetDate && (
            <div className="flex items-center text-xs text-gray-500">
              <Calendar className="w-3 h-3 mr-1" />
              Target: {format(new Date(goal.targetDate), 'MMM dd, yyyy')}
            </div>
          )}
        </div>

        {/* Edit Button */}
        {(isMentor || status !== 'completed') && (
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`${getProgressColor(progress)} h-2 rounded-full transition-all duration-300`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Edit Form */}
      {isEditing && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <div className="space-y-3">
            {/* Progress Slider */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Progress ({progress}%)
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={progress}
                onChange={(e) => setProgress(parseInt(e.target.value))}
                className="w-full"
              />
            </div>

            {/* Status Select */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this goal..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={handleCancel}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completed Date */}
      {status === 'completed' && goal.completedAt && (
        <div className="mt-2 text-xs text-green-600">
          <CheckCircle className="w-3 h-3 inline mr-1" />
          Completed on {format(new Date(goal.completedAt), 'MMM dd, yyyy')}
        </div>
      )}
    </div>
  );
};

export default GoalProgress;
