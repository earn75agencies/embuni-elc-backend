import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Star, 
  MessageSquare, 
  Target,
  CheckCircle,
  AlertCircle,
  User,
  Video,
  Phone,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2,
  Pause,
  Play
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import GoalProgress from './GoalProgress';
import SessionScheduler from './SessionScheduler';
import FeedbackForm from './FeedbackForm';

const MentorshipCard = ({ 
  mentorship, 
  currentUserId, 
  onAction, 
  getStatusColor, 
  getStatusIcon 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const isMentor = mentorship.mentor._id === currentUserId;
  const otherPerson = isMentor ? mentorship.mentee : mentorship.mentor;
  const canRespond = mentorship.status === 'pending' && !isMentor;
  const isActive = mentorship.status === 'active';

  const getMeetingTypeIcon = (type) => {
    const icons = {
      video: <Video className="w-4 h-4" />,
      phone: <Phone className="w-4 h-4" />,
      email: <Mail className="w-4 h-4" />,
      in_person: <MapPin className="w-4 h-4" />
    };
    return icons[type] || <Video className="w-4 h-4" />;
  };

  const handleResponse = async (action) => {
    const message = action === 'accept' 
      ? 'I\'d be happy to mentor you! Let\'s schedule our first session.'
      : 'Thank you for your interest, but I\'m not available at the moment.';
    
    await onAction(mentorship._id, action, { message });
  };

  const handleScheduleSession = async (sessionData) => {
    await onAction(mentorship._id, 'schedule', sessionData);
    setShowScheduler(false);
  };

  const handleSubmitFeedback = async (feedbackData) => {
    await onAction(mentorship._id, 'feedback', feedbackData);
    setShowFeedback(false);
  };

  const completionPercentage = mentorship.goals.length > 0 
    ? Math.round((mentorship.goals.filter(g => g.status === 'completed').length / mentorship.goals.length) * 100)
    : 0;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <img
                src={otherPerson.avatar || `https://ui-avatars.com/api/?name=${otherPerson.name}&background=6366f1&color=fff`}
                alt={otherPerson.name}
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {otherPerson.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {isMentor ? 'Mentee' : 'Mentor'}
                </p>
                {otherPerson.profile?.title && (
                  <p className="text-sm text-gray-500">{otherPerson.profile.title}</p>
                )}
                {otherPerson.profile?.company && (
                  <p className="text-sm text-gray-500">{otherPerson.profile.company}</p>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className={`flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(mentorship.status)}`}>
                {getStatusIcon(mentorship.status)}
                <span className="ml-1 capitalize">{mentorship.status.replace('_', ' ')}</span>
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </button>

                {showActions && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    {canRespond && (
                      <>
                        <button
                          onClick={() => handleResponse('accept')}
                          className="flex items-center w-full px-4 py-2 text-sm text-green-600 hover:bg-green-50"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Accept
                        </button>
                        <button
                          onClick={() => handleResponse('decline')}
                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                        >
                          <AlertCircle className="w-4 h-4 mr-2" />
                          Decline
                        </button>
                      </>
                    )}
                    
                    {isActive && (
                      <>
                        <button
                          onClick={() => setShowScheduler(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Calendar className="w-4 h-4 mr-2" />
                          Schedule Session
                        </button>
                        <button
                          onClick={() => setShowFeedback(true)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Give Feedback
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setExpanded(!expanded)}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      {expanded ? 'Hide' : 'Show'} Details
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Match Score */}
          {mentorship.matchScore && (
            <div className="mt-4 flex items-center space-x-2">
              <span className="text-sm text-gray-600">Match Score:</span>
              <div className="flex items-center">
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full"
                    style={{ width: `${mentorship.matchScore}%` }}
                  />
                </div>
                <span className="ml-2 text-sm font-medium text-gray-900">
                  {mentorship.matchScore}%
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mentorship.goals.length}</div>
              <div className="text-xs text-gray-600">Goals</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{mentorship.sessions?.length || 0}</div>
              <div className="text-xs text-gray-600">Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{completionPercentage}%</div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {formatDistanceToNow(new Date(mentorship.createdAt), { addSuffix: true })}
              </div>
              <div className="text-xs text-gray-600">Started</div>
            </div>
          </div>
        </div>

        {/* Expanded Content */}
        {expanded && (
          <div className="px-6 py-4 border-b border-gray-200">
            {/* Goals */}
            {mentorship.goals.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Goals</h4>
                <div className="space-y-2">
                  {mentorship.goals.map((goal) => (
                    <GoalProgress
                      key={goal._id}
                      goal={goal}
                      onUpdate={(data) => onAction(mentorship._id, 'updateGoal', { goalId: goal._id, ...data })}
                      isMentor={isMentor}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recent Sessions */}
            {mentorship.sessions && mentorship.sessions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Sessions</h4>
                <div className="space-y-2">
                  {mentorship.sessions.slice(-3).reverse().map((session, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        {getMeetingTypeIcon(session.type)}
                        <div>
                          <p className="text-sm font-medium text-gray-900">{session.title}</p>
                          <p className="text-xs text-gray-600">
                            {new Date(session.date).toLocaleDateString()} • {session.duration} minutes
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 text-xs rounded-full ${
                        session.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {session.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Feedback */}
            {mentorship.feedback && mentorship.feedback.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Recent Feedback</h4>
                <div className="space-y-2">
                  {mentorship.feedback.slice(-2).reverse().map((feedback, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-900">
                          {feedback.category}
                        </span>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < feedback.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      {feedback.comments && (
                        <p className="text-xs text-gray-600">{feedback.comments}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        {isActive && (
          <div className="px-6 py-4 bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <MessageSquare className="w-4 h-4" />
                <span>Ready for your next session</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowScheduler(true)}
                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Schedule Session
                </button>
                <button
                  onClick={() => setShowFeedback(true)}
                  className="px-4 py-2 border border-gray-300 text-sm rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Give Feedback
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Session Scheduler Modal */}
      {showScheduler && (
        <SessionScheduler
          onClose={() => setShowScheduler(false)}
          onSchedule={handleScheduleSession}
          mentorName={otherPerson.name}
        />
      )}

      {/* Feedback Modal */}
      {showFeedback && (
        <FeedbackForm
          onClose={() => setShowFeedback(false)}
          onSubmit={handleSubmitFeedback}
          recipientName={otherPerson.name}
        />
      )}
    </>
  );
};

export default MentorshipCard;
