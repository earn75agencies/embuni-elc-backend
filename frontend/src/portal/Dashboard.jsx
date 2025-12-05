import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, User, Heart, Award, TrendingUp, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    { icon: <Calendar />, label: 'Events Attended', value: '12', color: 'bg-accent-blue' },
    { icon: <Heart />, label: 'Volunteer Hours', value: '45', color: 'bg-primary' },
    { icon: <Award />, label: 'Achievements', value: '5', color: 'bg-accent-yellow' },
    { icon: <TrendingUp />, label: 'Points', value: '850', color: 'bg-green-500' }
  ];

  const upcomingEvents = [
    {
      title: 'Leadership Workshop',
      date: '2024-12-15',
      time: '2:00 PM',
      location: 'Main Hall'
    },
    {
      title: 'Community Service',
      date: '2024-12-20',
      time: '9:00 AM',
      location: 'City Center'
    }
  ];

  const recentActivities = [
    { action: 'Attended', item: 'Public Speaking Workshop', date: '2 days ago' },
    { action: 'Volunteered', item: 'Tree Planting Initiative', date: '1 week ago' },
    { action: 'Completed', item: 'Leadership Training Module 2', date: '2 weeks ago' }
  ];

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom">
        {/* Welcome Section */}
        <div className="card p-8 mb-8 bg-gradient-primary text-white">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-3xl font-bold mb-2">
                Welcome back, {user?.firstName}! 👋
              </h1>
              <p className="text-white/90">
                Ready to make an impact today? Here's your dashboard overview.
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
                <User size={48} />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${stat.color} rounded-lg flex items-center justify-center text-white`}>
                  {stat.icon}
                </div>
              </div>
              <div className="text-3xl font-bold text-charcoal mb-1">{stat.value}</div>
              <div className="text-neutral-600 text-sm">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Upcoming Events */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-heading text-2xl font-bold text-charcoal">
                  Upcoming Events
                </h2>
                <Link to="/events" className="text-primary hover:text-primary-dark font-semibold text-sm">
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingEvents.map((event, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors">
                    <div className="w-16 h-16 bg-primary rounded-lg flex flex-col items-center justify-center text-white flex-shrink-0">
                      <div className="text-xs">{new Date(event.date).toLocaleDateString('en-US', { month: 'short' })}</div>
                      <div className="text-2xl font-bold">{new Date(event.date).getDate()}</div>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-charcoal mb-1">{event.title}</h3>
                      <div className="flex items-center space-x-4 text-sm text-neutral-600">
                        <span className="flex items-center">
                          <Clock size={14} className="mr-1" />
                          {event.time}
                        </span>
                        <span>{event.location}</span>
                      </div>
                    </div>
                    <button className="btn-primary px-4 py-2 text-sm">
                      Register
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="card p-6">
              <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                Recent Activity
              </h2>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-start space-x-4 pb-4 border-b border-neutral-200 last:border-0">
                    <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="text-charcoal">
                        <span className="font-semibold">{activity.action}</span> {activity.item}
                      </p>
                      <p className="text-sm text-neutral-500">{activity.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="card p-6">
              <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Link to="/portal/profile" className="block w-full btn-outline text-center">
                  <User size={18} className="inline mr-2" />
                  Edit Profile
                </Link>
                <Link to="/portal/volunteer" className="block w-full btn-primary text-center">
                  <Heart size={18} className="inline mr-2" />
                  Volunteer Form
                </Link>
                <Link to="/events" className="block w-full btn-secondary text-center">
                  <Calendar size={18} className="inline mr-2" />
                  Browse Events
                </Link>
              </div>
            </div>

            {/* Membership Status */}
            <div className="card p-6 bg-gradient-to-br from-accent-blue to-blue-700 text-white">
              <h3 className="font-heading text-xl font-bold mb-4">
                Membership Status
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="font-bold">{user?.membershipStatus || 'Active'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Member Since:</span>
                  <span className="font-bold">
                    {user?.joinedDate ? new Date(user.joinedDate).getFullYear() : '2024'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Role:</span>
                  <span className="font-bold capitalize">{user?.role || 'Member'}</span>
                </div>
              </div>
            </div>

            {/* Announcements */}
            <div className="card p-6">
              <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                Announcements
              </h3>
              <div className="space-y-4 text-sm">
                <div className="p-3 bg-accent-yellow/10 rounded-lg">
                  <p className="font-semibold text-charcoal mb-1">Annual General Meeting</p>
                  <p className="text-neutral-600">Save the date: December 20th</p>
                </div>
                <div className="p-3 bg-accent-blue/10 rounded-lg">
                  <p className="font-semibold text-charcoal mb-1">New Resources Available</p>
                  <p className="text-neutral-600">Check out the updated member handbook</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
