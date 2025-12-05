/**
 * Event Card Component
 * Optimized with React.memo and useMemo for better performance
 */

import React, { useMemo } from 'react';
import { Calendar, MapPin, Users, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductionImage from './ProductionImage';

const EventCard = ({ event }) => {
  const formattedDate = useMemo(() => {
    return new Date(event.startDate).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, [event.startDate]);

  return (
    <div className="card group hover:scale-105">
      {/* Event Image */}
      <div className="relative h-48 overflow-hidden">
        <ProductionImage
          src={event.coverImage}
          alt={event.title}
          fallbackType="event"
          width={400}
          height={300}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
        />
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-accent-yellow text-charcoal text-xs font-bold rounded-full">
            {event.category}
          </span>
        </div>
        {event.isFeatured && (
          <div className="absolute top-4 right-4">
            <span className="px-3 py-1 bg-primary text-white text-xs font-bold rounded-full">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Event Details */}
      <div className="p-6">
        <h3 className="font-heading text-xl font-bold text-charcoal mb-3 line-clamp-2 group-hover:text-primary transition-colors">
          {event.title}
        </h3>

        <p className="text-neutral-600 text-sm mb-4 line-clamp-2">
          {event.shortDescription || event.description}
        </p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-neutral-600">
            <Calendar size={16} className="mr-2 text-primary" />
            <span>{formattedDate}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <Clock size={16} className="mr-2 text-primary" />
            <span>{event.startTime} - {event.endTime}</span>
          </div>
          <div className="flex items-center text-sm text-neutral-600">
            <MapPin size={16} className="mr-2 text-primary" />
            <span className="line-clamp-1">{event.location?.venue}</span>
          </div>
          {event.maxAttendees && (
            <div className="flex items-center text-sm text-neutral-600">
              <Users size={16} className="mr-2 text-primary" />
              <span>{event.registrationCount || 0}/{event.maxAttendees} registered</span>
            </div>
          )}
        </div>

        <Link
          to={`/events/${event._id}`}
          className="block w-full text-center btn-primary"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default React.memo(EventCard);
