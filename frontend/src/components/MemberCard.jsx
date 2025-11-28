/**
 * Member Card Component
 * Optimized with React.memo for better performance
 */

import React, { useMemo } from 'react';
import { Linkedin, Mail } from 'lucide-react';

const MemberCard = ({ member }) => {
  const { user, position, bio } = member;

  return (
    <div className="card group text-center">
      {/* Member Photo */}
      <div className="p-6 pb-0">
        <div className="w-32 h-32 mx-auto mb-4 relative">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={`${user.firstName} ${user.lastName}`}
              className="w-full h-full rounded-full object-cover ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all"
            />
          ) : (
            <div className="w-full h-full rounded-full bg-gradient-primary flex items-center justify-center ring-4 ring-primary/20 group-hover:ring-primary/40 transition-all">
              <span className="text-white text-3xl font-bold">
                {useMemo(() => {
                  const first = user?.firstName?.[0] || '';
                  const last = user?.lastName?.[0] || '';
                  return first + last;
                }, [user?.firstName, user?.lastName])}
              </span>
            </div>
          )}
          {position && position !== 'member' && (
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-accent-yellow px-3 py-1 rounded-full">
              <span className="text-xs font-bold text-charcoal capitalize">
                {position.replace(/-/g, ' ')}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Member Details */}
      <div className="p-6 pt-4">
        <h3 className="font-heading text-xl font-bold text-charcoal mb-1">
          {user?.firstName} {user?.lastName}
        </h3>
        
        {user?.leadershipPosition && (
          <p className="text-primary font-medium text-sm mb-2">
            {user.leadershipPosition}
          </p>
        )}

        {bio && (
          <p className="text-neutral-600 text-sm mb-4 line-clamp-3">
            {bio}
          </p>
        )}

        {/* Social Links */}
        <div className="flex justify-center space-x-2">
          {user?.socialLinks?.linkedin && (
            <a
              href={user.socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-accent-blue hover:text-white transition-all"
            >
              <Linkedin size={16} />
            </a>
          )}
          {user?.email && (
            <a
              href={`mailto:${user.email}`}
              className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center hover:bg-primary hover:text-white transition-all"
            >
              <Mail size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(MemberCard);
