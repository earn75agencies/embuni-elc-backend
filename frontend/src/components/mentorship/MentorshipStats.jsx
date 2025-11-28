import React from 'react';
import { Users, Calendar, CheckCircle, TrendingUp, Clock, Star } from 'lucide-react';

const MentorshipStats = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Mentorships',
      value: stats.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Active',
      value: stats.active || 0,
      icon: Calendar,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Completed',
      value: stats.completed || 0,
      icon: CheckCircle,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Pending',
      value: stats.pending || 0,
      icon: Clock,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  const completionRate = stats.total > 0 
    ? Math.round((stats.completed / stats.total) * 100) 
    : 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className={`${stat.bgColor} rounded-lg p-6 border border-gray-200`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.textColor} mt-1`}>{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      ))}
      
      {/* Completion Rate Card */}
      {stats.total > 0 && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completion Rate</p>
              <p className="text-2xl font-bold text-purple-600 mt-1">{completionRate}%</p>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="mt-3">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorshipStats;
