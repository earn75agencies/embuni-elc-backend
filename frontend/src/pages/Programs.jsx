import React from 'react';
import { BookOpen, Users, Heart, Lightbulb, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Programs = () => {
  const programs = [
    {
      icon: <Users className="w-12 h-12" />,
      title: 'Mentorship Program',
      description: 'Connect with experienced leaders and professionals who provide guidance, support, and insights for your personal and career development.',
      features: [
        'One-on-one mentoring sessions',
        'Career guidance and advice',
        'Professional networking opportunities',
        'Goal setting and accountability'
      ],
      color: 'from-primary to-primary-dark'
    },
    {
      icon: <BookOpen className="w-12 h-12" />,
      title: 'Leadership Workshops',
      description: 'Develop essential leadership skills through interactive workshops covering communication, decision-making, team building, and more.',
      features: [
        'Monthly skill-building workshops',
        'Guest speakers and experts',
        'Interactive learning sessions',
        'Certification programs'
      ],
      color: 'from-accent-blue to-blue-700'
    },
    {
      icon: <Heart className="w-12 h-12" />,
      title: 'Community Service',
      description: 'Make a tangible impact in our community through organized volunteer projects and social initiatives.',
      features: [
        'Regular community outreach',
        'Environmental initiatives',
        'Educational programs',
        'Health and wellness campaigns'
      ],
      color: 'from-red-500 to-red-700'
    },
    {
      icon: <Lightbulb className="w-12 h-12" />,
      title: 'Innovation Hub',
      description: 'Foster creativity and entrepreneurship through innovation challenges, startup support, and project incubation.',
      features: [
        'Innovation competitions',
        'Startup mentorship',
        'Resource access',
        'Pitch events'
      ],
      color: 'from-accent-yellow to-orange-500'
    }
  ];

  const opportunities = [
    'Leadership positions and committee roles',
    'Scholarship and grant opportunities',
    'Professional development programs',
    'Networking with industry leaders',
    'International exchange programs',
    'Research and innovation projects'
  ];

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 animate-fadeIn">
            Programs & Activities
          </h1>
          <p className="text-xl text-white/90 max-w-3xl animate-fadeIn">
            Explore our diverse range of programs designed to develop leadership skills, foster community engagement, and create lasting impact
          </p>
        </div>
      </section>

      {/* Main Programs */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="card overflow-hidden group hover:shadow-large transition-all"
              >
                <div className={`h-2 bg-gradient-to-r ${program.color}`}></div>
                <div className="p-8">
                  <div className={`w-20 h-20 bg-gradient-to-br ${program.color} rounded-2xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform`}>
                    {program.icon}
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-charcoal mb-4">
                    {program.title}
                  </h3>
                  <p className="text-neutral-600 mb-6 leading-relaxed">
                    {program.description}
                  </p>
                  <h4 className="font-semibold text-charcoal mb-3">Key Features:</h4>
                  <ul className="space-y-2 mb-6">
                    {program.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <span className="inline-block w-2 h-2 bg-primary rounded-full mr-3 mt-2"></span>
                        <span className="text-neutral-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/events"
                    className="inline-flex items-center text-primary font-semibold hover:text-primary-dark group"
                  >
                    View Related Events
                    <ArrowRight size={20} className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Opportunities */}
      <section className="section-padding bg-neutral-50">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto">
            <h2 className="section-title text-center mb-12">Opportunities for Members</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {opportunities.map((opportunity, index) => (
                <div
                  key={index}
                  className="card p-6 flex items-start space-x-4 hover:shadow-medium transition-all"
                >
                  <div className="w-8 h-8 bg-accent-yellow rounded-full flex items-center justify-center flex-shrink-0">
                    <ArrowRight size={18} className="text-charcoal" />
                  </div>
                  <p className="text-neutral-700 font-medium">{opportunity}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="card p-12 text-center bg-gradient-to-br from-primary to-primary-dark text-white">
            <h2 className="font-heading text-3xl md:text-4xl font-bold mb-6">
              Ready to Get Involved?
            </h2>
            <p className="text-lg mb-8 max-w-2xl mx-auto text-white/90">
              Join us and participate in programs that will shape your future and make a difference in our community
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/login" className="btn-primary bg-accent-yellow text-charcoal hover:bg-yellow-400">
                Become a Member
              </Link>
              <Link to="/events" className="btn-outline border-white text-white hover:bg-white hover:text-primary">
                View Upcoming Events
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Programs;
