import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import { toast } from 'react-toastify';
import { useContact } from '../context/ContactContext';

const Contact = () => {
  const { contactInfo, loading } = useContact();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  
  // Fallback values if contact info is not loaded
  const email = contactInfo?.email || 'elp@uoem.ac.ke';
  const phone = contactInfo?.phone || '+254 712 345 678';
  const address = contactInfo?.address || 'University of Embu\nP.O. Box 6-60100\nEmbu, Kenya';
  const googleMapEmbed = contactInfo?.googleMapEmbed || '';
  const socialLinks = contactInfo?.socialLinks || {
    facebook: '',
    twitter: '',
    instagram: 'https://www.instagram.com/uoem_elc?igsh=MXAzbW42dXQ4MDJ1YQ==',
    linkedin: '',
    youtube: ''
  };
  const officeHours = contactInfo?.officeHours || {
    weekdays: '9:00 AM - 5:00 PM',
    saturday: '10:00 AM - 2:00 PM',
    sunday: 'Closed'
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary-dark text-white py-20">
        <div className="container-custom">
          <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4">
            Get in Touch
          </h1>
          <p className="text-xl text-white/90 max-w-3xl">
            Have questions or want to learn more about ELP? We'd love to hear from you!
          </p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="card p-8">
                <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">
                  Send Us a Message
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                      className="input-field"
                      placeholder="How can we help?"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Message *
                    </label>
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      required
                      rows="6"
                      className="input-field resize-none"
                      placeholder="Tell us more about your inquiry..."
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full btn-primary flex items-center justify-center"
                  >
                    {submitting ? (
                      <div className="spinner w-5 h-5"></div>
                    ) : (
                      <>
                        <Send size={20} className="mr-2" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Details */}
              <div className="card p-6">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  Contact Information
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <MapPin size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal">Address</p>
                      <p className="text-neutral-600 text-sm whitespace-pre-line">
                        {address}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal">Email</p>
                      <a href={`mailto:${email}`} className="text-primary hover:underline text-sm">
                        {email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Phone size={20} className="text-primary flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-charcoal">Phone</p>
                      <a href={`tel:${phone.replace(/\s/g, '')}`} className="text-primary hover:underline text-sm">
                        {phone}
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Media */}
              <div className="card p-6">
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  Follow Us
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {socialLinks.facebook && (
                    <a
                      href={socialLinks.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg hover:bg-accent-blue hover:text-white transition-all"
                    >
                      <Facebook size={20} />
                      <span className="font-medium text-sm">Facebook</span>
                    </a>
                  )}
                  {socialLinks.twitter && (
                    <a
                      href={socialLinks.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg hover:bg-accent-blue hover:text-white transition-all"
                    >
                      <Twitter size={20} />
                      <span className="font-medium text-sm">Twitter</span>
                    </a>
                  )}
                  {socialLinks.instagram && (
                    <a
                      href={socialLinks.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg hover:bg-accent-blue hover:text-white transition-all"
                    >
                      <Instagram size={20} />
                      <span className="font-medium text-sm">Instagram</span>
                    </a>
                  )}
                  {socialLinks.linkedin && (
                    <a
                      href={socialLinks.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center space-x-2 p-3 bg-neutral-50 rounded-lg hover:bg-accent-blue hover:text-white transition-all"
                    >
                      <Linkedin size={20} />
                      <span className="font-medium text-sm">LinkedIn</span>
                    </a>
                  )}
                </div>
              </div>

              {/* Office Hours */}
              <div className="card p-6 bg-gradient-primary text-white">
                <h3 className="font-heading text-xl font-bold mb-4">
                  Office Hours
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Monday - Friday</span>
                    <span className="font-semibold">{officeHours.weekdays}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saturday</span>
                    <span className="font-semibold">{officeHours.saturday}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sunday</span>
                    <span className="font-semibold">{officeHours.sunday}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          {googleMapEmbed && (
            <div className="mt-12">
              <div className="card overflow-hidden">
                <div dangerouslySetInnerHTML={{ __html: googleMapEmbed }} />
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Contact;
