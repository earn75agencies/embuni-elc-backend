import React from 'react';
import { Briefcase, Users, TrendingUp, Clock, MapPin, DollarSign, Calendar, Award } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InternshipStats = ({ stats, loading }) => {
  const { t } = useTranslation();

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 animate-pulse">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
              <div className="w-16 h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="w-24 h-8 bg-gray-200 rounded mb-2"></div>
            <div className="w-32 h-4 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  const statCards = [
    {
      title: t('internshipStats.totalInternships'),
      value: stats?.totalInternships || 0,
      change: stats?.internshipsChange || 0,
      changeType: stats?.internshipsChangeType || 'positive',
      icon: Briefcase,
      color: 'blue',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: t('internshipStats.activeApplications'),
      value: stats?.activeApplications || 0,
      change: stats?.applicationsChange || 0,
      changeType: stats?.applicationsChangeType || 'positive',
      icon: Users,
      color: 'green',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: t('internshipStats.placementRate'),
      value: `${stats?.placementRate || 0}%`,
      change: stats?.placementChange || 0,
      changeType: stats?.placementChangeType || 'positive',
      icon: TrendingUp,
      color: 'purple',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: t('internshipStats.avgStipend'),
      value: t('internshipStats.stipendAmount', { amount: stats?.avgStipend || 0 }),
      change: stats?.stipendChange || 0,
      changeType: stats?.stipendChangeType || 'positive',
      icon: DollarSign,
      color: 'yellow',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  const topCompanies = stats?.topCompanies || [];
  const popularLocations = stats?.popularLocations || [];
  const trendingCategories = stats?.trendingCategories || [];

  return (
    <div className="space-y-6">
      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <div className={`${card.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${card.textColor}`} />
                </div>
                {card.change !== 0 && (
                  <div className={`flex items-center text-sm ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      card.changeType === 'negative' ? 'rotate-180' : ''
                    }`} />
                    {Math.abs(card.change)}%
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-1">
                {card.value}
              </div>
              <div className="text-sm text-gray-600">
                {card.title}
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Companies */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('internshipStats.topCompanies')}
            </h3>
            <Award className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {topCompanies.length > 0 ? (
              topCompanies.map((company, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-semibold text-blue-600">{index + 1}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{company.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{company.internships} {t('internshipStats.internships')}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('internshipStats.noData')}
              </p>
            )}
          </div>
        </div>

        {/* Popular Locations */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('internshipStats.popularLocations')}
            </h3>
            <MapPin className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {popularLocations.length > 0 ? (
              popularLocations.map((location, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MapPin className="w-4 h-4 text-green-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{location.name}</span>
                  </div>
                  <span className="text-sm text-gray-600">{location.count} {t('internshipStats.internships')}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('internshipStats.noData')}
              </p>
            )}
          </div>
        </div>

        {/* Trending Categories */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {t('internshipStats.trendingCategories')}
            </h3>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-3">
            {trendingCategories.length > 0 ? (
              trendingCategories.map((category, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Briefcase className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-900">{category.name}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <span className="text-sm text-gray-600">{category.count}</span>
                    {category.growth > 0 && (
                      <span className="text-xs text-green-600">+{category.growth}%</span>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                {t('internshipStats.noData')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Calendar className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats?.newThisMonth || 0}</span>
          </div>
          <h4 className="text-lg font-semibold mb-1">{t('internshipStats.newThisMonth')}</h4>
          <p className="text-sm opacity-90">{t('internshipStats.newThisMonthDesc')}</p>
        </div>

        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats?.avgResponseTime || '0d'}</span>
          </div>
          <h4 className="text-lg font-semibold mb-1">{t('internshipStats.avgResponseTime')}</h4>
          <p className="text-sm opacity-90">{t('internshipStats.avgResponseTimeDesc')}</p>
        </div>

        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Users className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats?.satisfactionRate || '0%'}</span>
          </div>
          <h4 className="text-lg font-semibold mb-1">{t('internshipStats.satisfactionRate')}</h4>
          <p className="text-sm opacity-90">{t('internshipStats.satisfactionRateDesc')}</p>
        </div>
      </div>
    </div>
  );
};

export default InternshipStats;
