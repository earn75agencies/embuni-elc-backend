import React from 'react';
import { Target, Eye, Award, Users } from 'lucide-react';
import MemberCard from '../components/MemberCard';

const About = () => {
  const coreValues = [
    { title: 'Leadership', description: 'Developing ethical and transformational leaders' },
    { title: 'Service', description: 'Commitment to community and societal impact' },
    { title: 'Excellence', description: 'Striving for the highest standards in all we do' },
    { title: 'Integrity', description: 'Honesty, transparency, and accountability' },
    { title: 'Innovation', description: 'Creative solutions to contemporary challenges' },
    { title: 'Collaboration', description: 'Working together for collective success' }
  ];

  // Leadership team data - can be fetched from API or managed via AboutAdminPortal
  // Supports both structures: {user: {firstName, lastName, avatar}} or {name, role, photo}
  const leadershipTeam = [
    {
      _id: '1',
      user: {
        firstName: 'Sarah',
        lastName: 'Wanjiku',
        email: 'sarah.w@example.com',
        avatar: null, // Profile photo URL - can be set via AboutAdminPortal
        socialLinks: { linkedin: '#' }
      },
      position: 'chairperson',
      bio: 'Passionate about empowering youth and driving positive change in our community.'
    },
    {
      _id: '2',
      user: {
        firstName: 'John',
        lastName: 'Kamau',
        email: 'john.k@example.com',
        avatar: null, // Profile photo URL - can be set via AboutAdminPortal
        socialLinks: { linkedin: '#' }
      },
      position: 'vice-chairperson',
      bio: 'Dedicated to fostering leadership skills and organizing impactful community service projects.'
    },
    {
      _id: '3',
      user: {
        firstName: 'Grace',
        lastName: 'Muthoni',
        email: 'grace.m@example.com',
        avatar: null, // Profile photo URL - can be set via AboutAdminPortal
        socialLinks: { linkedin: '#' }
      },
      position: 'secretary',
      bio: 'Ensuring smooth operations and effective communication within our organization.'
    },
    {
      _id: '4',
      user: {
        firstName: 'David',
        lastName: 'Ochieng',
        email: 'david.o@example.com',
        avatar: null // Profile photo URL - can be set via AboutAdminPortal
      },
      position: 'treasurer',
      bio: 'Managing our resources wisely to maximize impact and sustainability.'
    }
  ];

  return (
    <div>
      {/* Hero Banner */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
            About Equity Leaders Program
          </h1>
          <p className="text-xl text-white/90 max-w-3xl animate-fadeIn">
            Building a generation of ethical, visionary, and transformational leaders committed to excellence and service
          </p>
        </div>
      </section>

      {/* Background */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center mb-8">Our Story</h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-neutral-700 leading-relaxed mb-6">
                The Equity Leaders Program at University of Embu was established with a clear vision: 
                to nurture and develop the next generation of leaders who will drive positive change 
                in our communities and beyond. Since our inception, we have been committed to providing 
                students with opportunities for personal growth, leadership development, and community service.
              </p>
              <p className="text-neutral-700 leading-relaxed mb-6">
                Our program is built on the belief that leadership is not just about position or title, 
                but about character, service, and the ability to inspire others. We create an environment 
                where students can discover their potential, develop their skills, and make meaningful 
                contributions to society.
              </p>
              <p className="text-neutral-700 leading-relaxed">
                Through workshops, mentorship programs, community service initiatives, and networking events, 
                we equip our members with the tools they need to become effective leaders in their chosen fields 
                and communities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission, Vision & Values */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Mission */}
            <div className="card p-8">
              <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-charcoal mb-4">Our Mission</h3>
              <p className="text-neutral-700 leading-relaxed">
                To empower University of Embu students with leadership skills, values, and opportunities 
                to become ethical and transformational leaders who create positive impact in their communities 
                and contribute to national development.
              </p>
            </div>

            {/* Vision */}
            <div className="card p-8">
              <div className="w-16 h-16 bg-gradient-blue rounded-full flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="font-heading text-2xl font-bold text-charcoal mb-4">Our Vision</h3>
              <p className="text-neutral-700 leading-relaxed">
                To be the premier student leadership program in Kenya, recognized for developing 
                transformational leaders who champion innovation, service excellence, and sustainable 
                development in diverse fields.
              </p>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h3 className="section-title text-center mb-12">Core Values</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreValues.map((value, index) => (
                <div
                  key={index}
                  className="card p-6 text-center hover:shadow-large transition-all"
                >
                  <div className="w-12 h-12 bg-accent-yellow rounded-full flex items-center justify-center mx-auto mb-4">
                    <Award className="w-6 h-6 text-charcoal" />
                  </div>
                  <h4 className="font-heading font-bold text-lg text-charcoal mb-2">
                    {value.title}
                  </h4>
                  <p className="text-neutral-600 text-sm">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Meet Our Leadership Team</h2>
            <p className="section-subtitle">
              Dedicated leaders driving our mission forward
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {leadershipTeam.map((member) => {
              // Support both data structures: user object or direct properties
              const memberData = member.user 
                ? member 
                : {
                    ...member,
                    user: {
                      firstName: member.name?.split(' ')[0] || '',
                      lastName: member.name?.split(' ').slice(1).join(' ') || '',
                      avatar: member.photo || null,
                      email: member.email || null,
                      socialLinks: {}
                    },
                    position: member.role || member.position,
                    bio: member.bio
                  };
              return <MemberCard key={member._id || member.id} member={memberData} />;
            })}
          </div>
        </div>
      </section>

      {/* Impact Stats */}
      <section className="bg-gradient-primary text-white section-padding">
        <div className="container-custom">
          <h2 className="section-title text-white text-center mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-5xl font-bold font-heading mb-2">500+</div>
              <div className="text-white/80">Active Members</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold font-heading mb-2">50+</div>
              <div className="text-white/80">Annual Events</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold font-heading mb-2">25+</div>
              <div className="text-white/80">Community Projects</div>
            </div>
            <div className="text-center">
              <div className="text-5xl font-bold font-heading mb-2">1000+</div>
              <div className="text-white/80">Volunteer Hours</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
