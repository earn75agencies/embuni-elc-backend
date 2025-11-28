import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar, Users } from 'lucide-react';

const HeroSection = () => {
  return (
    <section className="relative bg-gradient-to-br from-primary via-primary-light to-primary-dark text-white overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>

      <div className="container-custom relative z-10 py-20 md:py-32">
        <div className="max-w-4xl animate-fadeIn">
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Users size={18} />
            <span className="text-sm font-medium">Join 500+ Student Leaders</span>
          </div>
          
          <h1 className="font-heading text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Empowering Transformational Leaders at{' '}
            <span className="text-accent-yellow">University of Embu</span>
          </h1>
          
          <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl leading-relaxed">
            A community of young leaders committed to service, growth, and impact. 
            Join us in making a difference through leadership development and community engagement.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              to="/login"
              className="inline-flex items-center justify-center px-8 py-4 bg-accent-yellow text-charcoal font-bold rounded-lg hover:bg-yellow-400 transition-all duration-300 shadow-lg hover:shadow-xl group"
            >
              Join Membership
              <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/events"
              className="inline-flex items-center justify-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold rounded-lg hover:bg-white/20 transition-all duration-300 border-2 border-white/30"
            >
              <Calendar size={20} className="mr-2" />
              View Upcoming Events
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 mt-12 pt-12 border-t border-white/20">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading mb-1">500+</div>
              <div className="text-sm text-white/80">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading mb-1">50+</div>
              <div className="text-sm text-white/80">Annual Events</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold font-heading mb-1">1000+</div>
              <div className="text-sm text-white/80">Service Hours</div>
            </div>
          </div>
        </div>
      </div>

      {/* Decorative Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
        </svg>
      </div>
    </section>
  );
};

export default HeroSection;
