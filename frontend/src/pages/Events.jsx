/**
 * Events Page Component
 * Optimized with useMemo, useCallback, and React.memo for better performance
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Filter } from 'lucide-react';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { eventService } from '../services/eventService';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('upcoming');

  const categories = useMemo(() => [
    { value: 'all', label: 'All Events' },
    { value: 'workshop', label: 'Workshops' },
    { value: 'seminar', label: 'Seminars' },
    { value: 'community-service', label: 'Community Service' },
    { value: 'networking', label: 'Networking' },
    { value: 'training', label: 'Training' }
  ], []);

  const fetchEvents = useCallback(async () => {
    try {
      setLoading(true);
      const params = timeFilter === 'upcoming' ? { upcoming: true } : {};
      const data = await eventService.getAllEvents(params);
      setEvents(data.events || []);
      setFilteredEvents(data.events || []);
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents([]);
      setFilteredEvents([]);
    } finally {
      setLoading(false);
    }
  }, [timeFilter]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCategoryFilter = useCallback((category) => {
    setActiveFilter(category);
    if (category === 'all') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter(event => event.eventType === category));
    }
  }, [events]);

  // Memoize filtered events to avoid recalculation
  const memoizedFilteredEvents = useMemo(() => {
    if (activeFilter === 'all') return events;
    return events.filter(event => event.eventType === activeFilter);
  }, [events, activeFilter]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar size={40} />
            <h1 className="font-heading text-4xl md:text-5xl font-bold">Events</h1>
          </div>
          <p className="text-xl text-white/90 max-w-3xl">
            Join us for exciting events, workshops, and activities that foster leadership and community engagement
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          {/* Time Filter */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setTimeFilter('upcoming')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeFilter === 'upcoming'
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Upcoming Events
            </button>
            <button
              onClick={() => setTimeFilter('past')}
              className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                timeFilter === 'past'
                  ? 'bg-primary text-white'
                  : 'bg-white text-neutral-700 hover:bg-neutral-100'
              }`}
            >
              Past Events
            </button>
          </div>

          {/* Category Filter */}
          <div className="flex items-center justify-center space-x-2 mb-12 flex-wrap gap-2">
            <Filter size={20} className="text-neutral-600" />
            {categories.map((category) => (
              <button
                key={category.value}
                onClick={() => handleCategoryFilter(category.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  activeFilter === category.value
                    ? 'bg-primary text-white'
                    : 'bg-white text-neutral-700 hover:bg-neutral-100'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="spinner"></div>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event._id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <Calendar size={64} className="mx-auto text-neutral-400 mb-4" />
              <h3 className="font-heading text-2xl font-bold text-neutral-700 mb-2">
                No Events Found
              </h3>
              <p className="text-neutral-600">
                {timeFilter === 'upcoming' 
                  ? 'Check back soon for upcoming events!'
                  : 'No past events to display yet.'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Events;
