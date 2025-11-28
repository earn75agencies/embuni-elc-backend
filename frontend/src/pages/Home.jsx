/**
 * Home Page Component
 * Main landing page with hero section, upcoming events, and featured posts
 * Optimized with useMemo and useCallback for better performance
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Slider from 'react-slick';
import { Target, Users, Sparkles, ArrowRight, Calendar } from 'lucide-react';
import HeroSection from '../components/HeroSection';
import EventCard from '../components/EventCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { eventService } from '../services/eventService';
import { postService } from '../services/postService';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const Home = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [eventsData, postsData] = await Promise.all([
        eventService.getAllEvents({ upcoming: true, limit: 3 }),
        postService.getAllPosts({ featured: true, limit: 3 })
      ]);
      setUpcomingEvents(eventsData.events || []);
      setFeaturedPosts(postsData.posts || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error to prevent UI breaking
      setUpcomingEvents([]);
      setFeaturedPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const pillars = useMemo(() => [
    {
      icon: <Target className="w-12 h-12" />,
      title: 'Leadership Growth',
      description: 'Develop essential leadership skills through workshops, seminars, and practical experiences that shape future leaders.'
    },
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Community Service',
      description: 'Make a real impact in our community through volunteer projects, outreach programs, and social initiatives.'
    },
    {
      icon: <Sparkles className="w-12 h-12" />,
      title: 'Mentorship & Networking',
      description: 'Connect with experienced leaders, build lasting relationships, and grow your professional network.'
    }
  ], []);

  const gallerySettings = useMemo(() => ({
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: 2 }
      },
      {
        breakpoint: 640,
        settings: { slidesToShow: 1 }
      }
    ]
  }), []);

  const galleryImages = useMemo(() => [
    'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=500',
    'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500',
    'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500',
    'https://images.unsplash.com/photo-1552664730-d307ca884978?w=500',
    'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=500'
  ], []);

  if (loading) {
    return <LoadingSpinner fullScreen text="Loading homepage..." />;
  }

  return (
    <div>
      {/* Hero Section */}
      <HeroSection />

      {/* Three Pillars Section */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="section-title">Our Three Pillars</h2>
            <p className="section-subtitle">
              The foundation of everything we do at Equity Leaders Program
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pillars.map((pillar, index) => (
              <div
                key={index}
                className="card p-8 text-center group hover:scale-105 animate-fadeIn"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 text-white group-hover:scale-110 transition-transform">
                  {pillar.icon}
                </div>
                <h3 className="font-heading text-2xl font-bold text-charcoal mb-4">
                  {pillar.title}
                </h3>
                <p className="text-neutral-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Member of the Month */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="card overflow-hidden">
            <div className="grid md:grid-cols-2 gap-0">
              <div className="h-64 md:h-auto">
                <img
                  src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600"
                  alt="Member of the Month"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="inline-block mb-4">
                  <span className="px-4 py-2 bg-accent-yellow text-charcoal font-bold rounded-full text-sm">
                    Member of the Month
                  </span>
                </div>
                <h2 className="font-heading text-3xl font-bold text-charcoal mb-4">
                  John Kamau
                </h2>
                <p className="text-primary font-semibold mb-4">
                  Vice Chairperson - Community Service Lead
                </p>
                <p className="text-neutral-600 mb-6 leading-relaxed">
                  John has been instrumental in organizing our community service initiatives, 
                  leading over 15 successful projects this year. His dedication to service 
                  and leadership has inspired many members to get more involved in our community programs.
                </p>
                <Link to="/about" className="inline-flex items-center text-primary font-semibold hover:text-primary-dark group">
                  Read Full Story
                  <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Upcoming Events */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="section-title mb-2">Upcoming Events</h2>
              <p className="text-neutral-600">Don't miss out on these exciting opportunities</p>
            </div>
            <Link to="/events" className="btn-outline hidden md:inline-flex items-center">
              View All Events
              <ArrowRight size={20} className="ml-2" />
            </Link>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {upcomingEvents.length > 0 ? (
                upcomingEvents.map((event) => (
                  <EventCard key={event._id} event={event} />
                ))
              ) : (
                <div className="col-span-3 text-center py-12">
                  <Calendar size={48} className="mx-auto text-neutral-400 mb-4" />
                  <p className="text-neutral-600">No upcoming events at the moment</p>
                </div>
              )}
            </div>
          )}

          <div className="text-center mt-8 md:hidden">
            <Link to="/events" className="btn-primary">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* Photo Gallery Slider */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Moments We've Shared</h2>
            <p className="section-subtitle">
              Capturing the spirit of leadership and community
            </p>
          </div>

          <Slider {...gallerySettings}>
            {galleryImages.map((image, index) => (
              <div key={index} className="px-2">
                <div className="aspect-square rounded-xl overflow-hidden shadow-medium">
                  <img
                    src={image}
                    alt={`Gallery ${index + 1}`}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            ))}
          </Slider>

          <div className="text-center mt-12">
            <Link to="/gallery" className="btn-secondary">
              View Full Gallery
            </Link>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="bg-gradient-primary text-white section-padding">
        <div className="container-custom text-center">
          <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
            Ready to Make a Difference?
          </h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
            Join our community of leaders and be part of something bigger. 
            Together, we can create lasting impact in our university and beyond.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login" className="btn-primary bg-accent-yellow text-charcoal hover:bg-yellow-400">
              Become a Member
            </Link>
            <Link to="/contact" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
              Get in Touch
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
