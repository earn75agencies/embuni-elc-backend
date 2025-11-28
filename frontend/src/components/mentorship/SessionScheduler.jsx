import React, { useState } from 'react';
import { X, Calendar, Clock, Video, Phone, MapPin, Mail, Users } from 'lucide-react';
import { format, addDays, setHours, setMinutes } from 'date-fns';

const SessionScheduler = ({ onClose, onSchedule, mentorName }) => {
  const [sessionData, setSessionData] = useState({
    title: '',
    description: '',
    scheduledDate: '',
    duration: 60,
    meetingType: 'video',
    meetingLink: ''
  });

  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');

  const meetingTypes = [
    { value: 'video', label: 'Video Call', icon: Video },
    { value: 'phone', label: 'Phone Call', icon: Phone },
    { value: 'in_person', label: 'In Person', icon: MapPin },
    { value: 'email', label: 'Email Exchange', icon: Mail }
  ];

  const durations = [30, 45, 60, 90, 120];

  // Generate time slots for the next 14 days
  const generateTimeSlots = () => {
    const slots = [];
    const today = new Date();
    
    for (let day = 0; day < 14; day++) {
      const currentDate = addDays(today, day);
      const dateStr = format(currentDate, 'yyyy-MM-dd');
      
      for (let hour = 9; hour <= 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const time = setMinutes(setHours(currentDate, hour), minute);
          if (time > today) {
            slots.push({
              date: dateStr,
              time: format(time, 'HH:mm'),
              display: format(time, 'h:mm a'),
              datetime: format(time, "yyyy-MM-dd'T'HH:mm")
            });
          }
        }
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!sessionData.title.trim()) {
      return;
    }

    const scheduledDateTime = selectedDate && selectedTime 
      ? `${selectedDate}T${selectedTime}`
      : sessionData.scheduledDate;

    onSchedule({
      ...sessionData,
      scheduledDate: scheduledDateTime
    });
  };

  const handleDateSelect = (date) => {
    setSelectedDate(date);
    setSelectedTime('');
  };

  const handleTimeSelect = (time) => {
    setSelectedTime(time);
    setSessionData(prev => ({
      ...prev,
      scheduledDate: `${selectedDate}T${time}`
    }));
  };

  const getAvailableTimes = (date) => {
    return timeSlots.filter(slot => slot.date === date);
  };

  const groupedSlots = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Schedule Session</h2>
            <p className="text-sm text-gray-600 mt-1">
              with {mentorName}
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
            {/* Session Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Session Title *
              </label>
              <input
                type="text"
                value={sessionData.title}
                onChange={(e) => setSessionData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="e.g., Career Planning Discussion"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={sessionData.description}
                onChange={(e) => setSessionData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What would you like to discuss in this session?"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date and Time Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Select Date & Time
              </label>
              
              {/* Date Selection */}
              <div className="mb-4">
                <select
                  value={selectedDate}
                  onChange={(e) => handleDateSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-2"
                >
                  <option value="">Select a date</option>
                  {Object.keys(groupedSlots).map(date => (
                    <option key={date} value={date}>
                      {format(new Date(date), 'EEEE, MMMM dd, yyyy')}
                    </option>
                  ))}
                </select>
              </div>

              {/* Time Selection */}
              {selectedDate && (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {getAvailableTimes(selectedDate).map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleTimeSelect(slot.time)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${
                        selectedTime === slot.time
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {slot.display}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Duration
              </label>
              <div className="flex flex-wrap gap-2">
                {durations.map(duration => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() => setSessionData(prev => ({ ...prev, duration }))}
                    className={`px-4 py-2 rounded-lg border transition-colors ${
                      sessionData.duration === duration
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>

            {/* Meeting Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meeting Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {meetingTypes.map(type => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setSessionData(prev => ({ ...prev, meetingType: type.value }))}
                      className={`flex items-center px-4 py-3 rounded-lg border transition-colors ${
                        sessionData.meetingType === type.value
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {type.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Meeting Link (for video calls) */}
            {(sessionData.meetingType === 'video' || sessionData.meetingType === 'phone') && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meeting Link
                </label>
                <input
                  type="url"
                  value={sessionData.meetingLink}
                  onChange={(e) => setSessionData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  placeholder="https://zoom.us/j/..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Optional: You can add this later if needed
                </p>
              </div>
            )}
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
              disabled={!sessionData.title.trim() || !sessionData.scheduledDate}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Schedule Session
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SessionScheduler;
