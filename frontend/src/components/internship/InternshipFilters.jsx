import React, { useState, useEffect } from 'react';
import { Search, Filter, X, Briefcase, MapPin, Calendar, DollarSign, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const InternshipFilters = ({ filters, onFiltersChange, onReset }) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState(filters.search || '');
  const [localFilters, setLocalFilters] = useState(filters);

  // Available options (in a real app, these would come from API)
  const companies = [
    'Google', 'Microsoft', 'Apple', 'Amazon', 'Meta', 'Tesla',
    'Netflix', 'Adobe', 'Salesforce', 'Oracle', 'IBM', 'Intel'
  ];

  const locations = [
    'Nairobi', 'Mombasa', 'Kisumu', 'Nakuru', 'Eldoret',
    'Thika', 'Kitale', 'Garissa', 'Malindi', 'Remote'
  ];

  const types = [
    'Full-time', 'Part-time', 'Remote', 'Hybrid', 'On-site'
  ];

  const durations = [
    '1-3 months', '3-6 months', '6-12 months', '1 year+', 'Flexible'
  ];

  const categories = [
    'Software Development', 'Data Science', 'Product Management',
    'Marketing', 'Finance', 'Human Resources', 'Design',
    'Engineering', 'Research', 'Consulting'
  ];

  useEffect(() => {
    setLocalFilters(filters);
    setSearchTerm(filters.search || '');
  }, [filters]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
    // Debounced search would be implemented here
    const timeoutId = setTimeout(() => {
      onFiltersChange({ ...localFilters, search: value });
    }, 300);
    return () => clearTimeout(timeoutId);
  };

  const handleFilterChange = (filterName, value) => {
    const newFilters = { ...localFilters, [filterName]: value };
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleMultiSelectChange = (filterName, value) => {
    const currentValues = localFilters[filterName] || [];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    handleFilterChange(filterName, newValues);
  };

  const handleReset = () => {
    setSearchTerm('');
    setLocalFilters({});
    onReset();
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (localFilters.search) count++;
    if (localFilters.companies?.length) count++;
    if (localFilters.locations?.length) count++;
    if (localFilters.types?.length) count++;
    if (localFilters.durations?.length) count++;
    if (localFilters.categories?.length) count++;
    if (localFilters.stipendMin) count++;
    if (localFilters.stipendMax) count++;
    if (localFilters.applicationDeadline) count++;
    return count;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder={t('internship.searchPlaceholder')}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      {/* Filter Toggle */}
      <div className="p-4 flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span className="font-medium">{t('common.filters')}</span>
          {getActiveFiltersCount() > 0 && (
            <span className="bg-blue-100 text-blue-600 text-xs px-2 py-1 rounded-full">
              {getActiveFiltersCount()}
            </span>
          )}
        </button>

        {getActiveFiltersCount() > 0 && (
          <button
            onClick={handleReset}
            className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            {t('common.clearFilters')}
          </button>
        )}
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="border-t border-gray-200">
          <div className="p-4 space-y-6">
            {/* Company Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.company')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {companies.map(company => (
                  <label key={company} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.companies?.includes(company) || false}
                      onChange={() => handleMultiSelectChange('companies', company)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{company}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.location')}
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                {locations.map(location => (
                  <label key={location} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.locations?.includes(location) || false}
                      onChange={() => handleMultiSelectChange('locations', location)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{location}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.type')}
              </label>
              <div className="flex flex-wrap gap-2">
                {types.map(type => (
                  <button
                    key={type}
                    onClick={() => handleMultiSelectChange('types', type)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      localFilters.types?.includes(type)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Duration Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.duration')}
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map(duration => (
                  <button
                    key={duration}
                    onClick={() => handleMultiSelectChange('durations', duration)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      localFilters.durations?.includes(duration)
                        ? 'bg-blue-100 text-blue-700 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 border-2 border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Category Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.category')}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {categories.map(category => (
                  <label key={category} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={localFilters.categories?.includes(category) || false}
                      onChange={() => handleMultiSelectChange('categories', category)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Stipend Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.stipendRange')} ({t('common.ksh')})
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <input
                    type="number"
                    placeholder={t('internship.minStipend')}
                    value={localFilters.stipendMin || ''}
                    onChange={(e) => handleFilterChange('stipendMin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <input
                    type="number"
                    placeholder={t('internship.maxStipend')}
                    value={localFilters.stipendMax || ''}
                    onChange={(e) => handleFilterChange('stipendMax', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Application Deadline */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('internship.applicationDeadline')}
              </label>
              <select
                value={localFilters.applicationDeadline || ''}
                onChange={(e) => handleFilterChange('applicationDeadline', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">{t('internship.anyDeadline')}</option>
                <option value="week">{t('internship.nextWeek')}</option>
                <option value="month">{t('internship.nextMonth')}</option>
                <option value="3months">{t('internship.next3Months')}</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
            <button
              onClick={handleReset}
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              {t('common.reset')}
            </button>
            <button
              onClick={() => setIsExpanded(false)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {t('common.applyFilters')}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InternshipFilters;
