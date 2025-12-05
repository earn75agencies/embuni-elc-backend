/**
 * Footer Component
 * Optimized with React.memo and useMemo for better performance
 */

import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { useContact } from '../context/ContactContext';

const Footer = () => {
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  const { contactInfo, loading } = useContact();
  
  // Fallback values if contact info is not loaded
  const email = contactInfo?.email || 'elp@uoem.ac.ke';
  const phone = contactInfo?.phone || '+254 712 345 678';
  const address = contactInfo?.address || 'University of Embu\nP.O. Box 6-60100\nEmbu, Kenya';
  const socialLinks = contactInfo?.socialLinks || {
    facebook: '',
    twitter: '',
    instagram: 'https://www.instagram.com/uoem_elc?igsh=MXAzbW42dXQ4MDJ1YQ==',
    linkedin: '',
    youtube: ''
  };

  return (
    <footer className="bg-charcoal text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About Section */}
          <div>
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">ELP</span>
              </div>
              <div>
                <div className="font-heading font-bold text-lg">Equity Leaders</div>
                <div className="text-xs text-neutral-400">University of Embu</div>
              </div>
            </div>
            <p className="text-neutral-300 text-sm leading-relaxed">
              Empowering transformational leaders through service, growth, and impact in our community.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/about" className="text-neutral-300 hover:text-accent-yellow transition-colors text-sm">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/programs" className="text-neutral-300 hover:text-accent-yellow transition-colors text-sm">
                  Programs
                </Link>
              </li>
              <li>
                <Link to="/events" className="text-neutral-300 hover:text-accent-yellow transition-colors text-sm">
                  Events
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-neutral-300 hover:text-accent-yellow transition-colors text-sm">
                  News & Updates
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-neutral-300 hover:text-accent-yellow transition-colors text-sm">
                  Resources
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-sm">
                <MapPin size={18} className="text-accent-yellow flex-shrink-0 mt-1" />
                <span className="text-neutral-300 whitespace-pre-line">
                  {address}
                </span>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Mail size={18} className="text-accent-yellow flex-shrink-0" />
                <a href={`mailto:${email}`} className="text-neutral-300 hover:text-accent-yellow transition-colors">
                  {email}
                </a>
              </li>
              <li className="flex items-center space-x-3 text-sm">
                <Phone size={18} className="text-accent-yellow flex-shrink-0" />
                <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-neutral-300 hover:text-accent-yellow transition-colors">
                  {phone}
                </a>
              </li>
            </ul>
          </div>

          {/* Social Media & Newsletter */}
          <div>
            <h3 className="font-heading font-bold text-lg mb-4">Follow Us</h3>
            <div className="flex space-x-3 mb-6">
              {socialLinks.facebook && (
                <a
                  href={socialLinks.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-blue transition-all duration-300"
                >
                  <Facebook size={20} />
                </a>
              )}
              {socialLinks.twitter && (
                <a
                  href={socialLinks.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-blue transition-all duration-300"
                >
                  <Twitter size={20} />
                </a>
              )}
              {socialLinks.instagram && (
                <a
                  href={socialLinks.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-blue transition-all duration-300"
                >
                  <Instagram size={20} />
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-white/10 rounded-lg flex items-center justify-center hover:bg-accent-blue transition-all duration-300"
                >
                  <Linkedin size={20} />
                </a>
              )}
            </div>
            <div>
              <p className="text-neutral-300 text-sm mb-2">Subscribe to our newsletter</p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Your email"
                  className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-l-lg text-sm focus:outline-none focus:border-accent-yellow"
                />
                <button className="px-4 py-2 bg-primary hover:bg-primary-dark rounded-r-lg transition-colors text-sm font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-neutral-400">
          <p>© {currentYear} Equity Leaders Program, University of Embu. All rights reserved.</p>
          <div className="flex space-x-4 mt-4 md:mt-0">
            <Link to="/privacy" className="hover:text-accent-yellow transition-colors">
              Privacy Policy
            </Link>
            <Link to="/terms" className="hover:text-accent-yellow transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default React.memo(Footer);
