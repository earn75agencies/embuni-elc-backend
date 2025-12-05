import React, { useState } from 'react';
import { 
  Briefcase, 
  MapPin, 
  Clock, 
  DollarSign, 
  Calendar,
  Building,
  Users,
  ExternalLink,
  Heart,
  Share2,
  Eye,
  CheckCircle
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import ApplicationModal from './ApplicationModal';

const InternshipCard = ({ internship, onAction, currentUser }) => {
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [showActions, setShowActions] = useState(false);

  const hasApplied = internship.applications?.some(app => 
    app.student?._id === currentUser?._id
  );

  const isOwner = internship.postedBy?._id === currentUser?._id || currentUser?.role === 'admin';
  const daysUntilDeadline = Math.ceil((new Date(internship.applicationDeadline) - new Date()) / (1000 * 60 * 60 * 24));
  const isUrgent = daysUntilDeadline <= 7;

  const handleAction = (action, data = {}) => {
    if (action === 'apply') {
      setShowApplicationModal(true);
    } else {
      onAction(action, internship._id, data);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: internship.title,
          text: internship.description,
          url: window.location.origin + `/internships/${internship._id}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.origin + `/internships/${internship._id}`);
      // Show toast notification
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Implement save functionality
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'text-green-600 bg-green-50 border-green-200',
      closed: 'text-red-600 bg-red-50 border-red-200',
      filled: 'text-blue-600 bg-blue-50 border-blue-200',
      draft: 'text-gray-600 bg-gray-50 border-gray-200'
    };
    return colors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 relative overflow-hidden">
        {/* Featured Badge */}
        {internship.featured && (
          <div className="absolute top-3 right-3 z-10">
            <span className="px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-semibold rounded-full">
              Featured
            </span>
          </div>
        )}

        {/* Urgent Badge */}
        {isUrgent && (
          <div className="absolute top-3 left-3 z-10">
            <span className="px-2 py-1 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              Urgent
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                {internship.company.logo && (
                  <img
                    src={internship.company.logo}
                    alt={internship.company.name}
                    className="w-8 h-8 rounded object-cover"
                  />
                )}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
                    {internship.title}
                  </h3>
                  <p className="text-sm text-gray-600">{internship.company.name}</p>
                </div>
              </div>
            </div>

            {/* Actions Menu */}
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {showActions && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
                  <button
                    onClick={handleShare}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Heart className={`w-4 h-4 mr-2 ${isSaved ? 'fill-current text-red-500' : ''}`} />
                    {isSaved ? 'Saved' : 'Save'}
                  </button>
                  <button
                    onClick={() => handleAction('view')}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Key Details */}
          <div className="space-y-3 mb-4">
            {/* Location */}
            <div className="flex items-center text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2" />
              {internship.company.location.remote ? 'Remote' : 
               internship.company.location.hybrid ? 'Hybrid' :
               internship.company.location.city}
            </div>

            {/* Duration */}
            <div className="flex items-center text-sm text-gray-600">
              <Clock className="w-4 h-4 mr-2" />
              {internship.duration} weeks • {internship.schedule}
            </div>

            {/* Compensation */}
            <div className="flex items-center text-sm text-gray-600">
              <DollarSign className="w-4 h-4 mr-2" />
              {internship.isPaid ? 
                (internship.stipend?.amount ? 
                  `$${internship.stipend.amount}/${internship.stipend.frequency}` : 
                  'Paid') : 
                'Unpaid'
              }
            </div>

            {/* Skills */}
            {internship.skills && internship.skills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {internship.skills.slice(0, 4).map((skill, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
                  >
                    {skill}
                  </span>
                ))}
                {internship.skills.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                    +{internship.skills.length - 4} more
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Deadline */}
          <div className={`p-3 rounded-lg mb-4 ${
            isUrgent ? 'bg-red-50 border border-red-200' : 'bg-gray-50 border border-gray-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <Calendar className="w-4 h-4 mr-2" />
                <span className={isUrgent ? 'text-red-700 font-medium' : 'text-gray-700'}>
                  Apply by {format(new Date(internship.applicationDeadline), 'MMM dd, yyyy')}
                </span>
              </div>
              <span className={`text-sm font-medium ${
                isUrgent ? 'text-red-700' : 'text-gray-600'
              }`}>
                {daysUntilDeadline > 0 ? `${daysUntilDeadline} days left` : 'Expired'}
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <Eye className="w-3 h-3 mr-1" />
                {internship.views || 0} views
              </span>
              <span className="flex items-center">
                <Users className="w-3 h-3 mr-1" />
                {internship.applicationsCount || 0} applications
              </span>
            </div>
            <span className="flex items-center">
              <Clock className="w-3 h-3 mr-1" />
              {formatDistanceToNow(new Date(internship.createdAt), { addSuffix: true })}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            {hasApplied ? (
              <div className="flex-1 flex items-center justify-center px-4 py-2 bg-green-50 text-green-700 rounded-lg">
                <CheckCircle className="w-4 h-4 mr-2" />
                Applied
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleAction('apply')}
                  disabled={!internship.isAcceptingApplications}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Apply Now
                </button>
                <button
                  onClick={() => handleAction('view')}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </button>
              </>
            )}

            {isOwner && (
              <button
                onClick={() => setShowActions(!showActions)}
                className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Briefcase className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Owner Actions Menu */}
          {isOwner && showActions && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
              <button
                onClick={() => handleAction('edit')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={() => handleAction('view')}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                View Applications
              </button>
              <button
                onClick={() => handleAction('delete')}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <ApplicationModal
          internship={internship}
          onClose={() => setShowApplicationModal(false)}
          onSubmit={async (applicationData) => {
            await handleAction('apply', applicationData);
            setShowApplicationModal(false);
          }}
        />
      )}
    </>
  );
};

export default InternshipCard;
