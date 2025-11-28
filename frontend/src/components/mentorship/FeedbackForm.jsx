import React, { useState } from 'react';
import { X, Star, MessageSquare, Send } from 'lucide-react';

const FeedbackForm = ({ onClose, onSubmit, recipientName }) => {
  const [feedback, setFeedback] = useState({
    rating: 5,
    category: 'overall',
    comments: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = [
    { value: 'overall', label: 'Overall Experience' },
    { value: 'communication', label: 'Communication' },
    { value: 'expertise', label: 'Expertise & Knowledge' },
    { value: 'supportiveness', label: 'Supportiveness' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(feedback);
      onClose();
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingChange = (rating) => {
    setFeedback(prev => ({ ...prev, rating }));
  };

  const handleCategoryChange = (category) => {
    setFeedback(prev => ({ ...prev, category }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Give Feedback</h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your experience with {recipientName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you rate your experience?
              </label>
              <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => handleRatingChange(rating)}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating <= feedback.rating
                          ? 'text-yellow-400 fill-current'
                          : 'text-gray-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <div className="text-center mt-2">
                <span className="text-sm text-gray-600">
                  {feedback.rating === 1 && 'Poor'}
                  {feedback.rating === 2 && 'Fair'}
                  {feedback.rating === 3 && 'Good'}
                  {feedback.rating === 4 && 'Very Good'}
                  {feedback.rating === 5 && 'Excellent'}
                </span>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Feedback Category
              </label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map((category) => (
                  <button
                    key={category.value}
                    type="button"
                    onClick={() => handleCategoryChange(category.value)}
                    className={`px-4 py-2 text-sm rounded-lg border transition-colors text-left ${
                      feedback.category === category.value
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Comments
              </label>
              <textarea
                value={feedback.comments}
                onChange={(e) => setFeedback(prev => ({ ...prev, comments: e.target.value }))}
                placeholder="Share specific details about your experience..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your feedback helps improve the mentorship experience
              </p>
            </div>

            {/* Feedback Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Feedback Guidelines</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• Be specific and constructive in your feedback</li>
                <li>• Focus on behaviors and actions, not personality</li>
                <li>• Provide examples to support your rating</li>
                <li>• Keep feedback professional and respectful</li>
              </ul>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackForm;
