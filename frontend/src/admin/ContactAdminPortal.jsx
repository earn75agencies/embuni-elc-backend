/**
 * ContactAdminPortal - Dedicated portal for Contact & Communication Admin
 * 
 * Monitors contact form messages, updates contact info, and manages social media links
 */

import React, { useState, useEffect } from 'react';
import { 
  Mail, MessageSquare, MapPin, Phone, Globe, Save, 
  CheckCircle2, XCircle, Search, Filter
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useContact } from '../context/ContactContext';
import { toast } from 'react-toastify';
import { contactMessageService } from '../services/contactMessageService';

const ContactAdminPortal = () => {
  const { token } = useAuth();
  const { contactInfo: contextContactInfo, loading: contactLoading, updateContactInfo, loadContactInfo } = useContact();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('messages'); // messages, info
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [saving, setSaving] = useState(false);

  const [contactInfo, setContactInfo] = useState({
    email: '',
    phone: '',
    address: '',
    googleMapEmbed: '',
    socialLinks: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    officeHours: {
      weekdays: '9:00 AM - 5:00 PM',
      saturday: '10:00 AM - 2:00 PM',
      sunday: 'Closed'
    }
  });

  useEffect(() => {
    fetchMessages();
  }, [token]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await contactMessageService.getMessages(token, {
        status: filterStatus !== 'all' ? filterStatus : undefined,
        search: searchTerm || undefined
      });
      setMessages(response.data);
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load messages');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Load contact info from context
    if (contextContactInfo) {
      setContactInfo({
        email: contextContactInfo.email || '',
        phone: contextContactInfo.phone || '',
        address: contextContactInfo.address || '',
        googleMapEmbed: contextContactInfo.googleMapEmbed || '',
        socialLinks: {
          facebook: contextContactInfo.socialLinks?.facebook || '',
          twitter: contextContactInfo.socialLinks?.twitter || '',
          instagram: contextContactInfo.socialLinks?.instagram || '',
          linkedin: contextContactInfo.socialLinks?.linkedin || '',
          youtube: contextContactInfo.socialLinks?.youtube || ''
        },
        officeHours: {
          weekdays: contextContactInfo.officeHours?.weekdays || '9:00 AM - 5:00 PM',
          saturday: contextContactInfo.officeHours?.saturday || '10:00 AM - 2:00 PM',
          sunday: contextContactInfo.officeHours?.sunday || 'Closed'
        }
      });
    }
  }, [contextContactInfo]);

  const handleSaveContactInfo = async () => {
    if (!token) {
      toast.error('Authentication required');
      return;
    }

    try {
      setSaving(true);
      await updateContactInfo(token, contactInfo);
      toast.success('Contact information updated successfully');
      // Reload contact info to ensure consistency
      await loadContactInfo();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update contact information');
    } finally {
      setSaving(false);
    }
  };

  const handleMarkRead = async (messageId) => {
    // TODO: API call
    toast.success('Message marked as read');
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm('Delete this message?')) return;
    // TODO: API call
    toast.success('Message deleted');
  };

  const filteredMessages = messages.filter(msg => {
    const matchesSearch = 
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || 
      (filterStatus === 'read' && msg.read) ||
      (filterStatus === 'unread' && !msg.read);
    return matchesSearch && matchesStatus;
  });

  if (loading || contactLoading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8 flex items-center justify-center">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="bg-white shadow-soft sticky top-0 z-40">
        <div className="container-custom py-6">
          <h1 className="font-heading text-3xl font-bold text-charcoal flex items-center gap-2">
            <Mail size={32} className="text-cyan-600" />
            Contact & Communication Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Monitor messages and manage contact information
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="card p-4 mb-6">
          <div className="flex gap-2">
            {['messages', 'info'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium ${
                  activeTab === tab
                    ? 'bg-cyan-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {tab === 'messages' ? 'Messages' : 'Contact Info'}
              </button>
            ))}
          </div>
        </div>

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <>
            <div className="card p-4 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="input-field pl-10"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <select
                  className="input-field md:w-48"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Messages</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredMessages.length === 0 ? (
                <div className="card p-12 text-center text-neutral-500">
                  <MessageSquare size={48} className="mx-auto mb-4 opacity-50" />
                  <p>No messages found</p>
                </div>
              ) : (
                filteredMessages.map((message) => (
                  <div key={message._id} className={`card p-6 ${!message.read ? 'border-l-4 border-cyan-600' : ''}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-heading font-bold text-charcoal">{message.name}</h3>
                        <p className="text-sm text-neutral-600">{message.email}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(message.createdAt).toLocaleString()}
                        </p>
                      </div>
                      {!message.read && (
                        <span className="px-2 py-1 bg-cyan-100 text-cyan-700 text-xs rounded">New</span>
                      )}
                    </div>
                    <p className="text-neutral-700 mb-4">{message.message}</p>
                    <div className="flex gap-2">
                      {!message.read && (
                        <button
                          onClick={() => handleMarkRead(message._id)}
                          className="btn-outline text-sm"
                        >
                          <CheckCircle2 size={16} className="mr-1" />
                          Mark Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(message._id)}
                        className="btn-outline text-red-600 text-sm"
                      >
                        <XCircle size={16} className="mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Contact Info Tab */}
        {activeTab === 'info' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">Contact Information</h2>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  <Mail size={16} className="inline mr-2" />
                  Email
                </label>
                <input
                  type="email"
                  className="input-field"
                  value={contactInfo.email}
                  onChange={(e) => setContactInfo({ ...contactInfo, email: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  <Phone size={16} className="inline mr-2" />
                  Phone
                </label>
                <input
                  type="tel"
                  className="input-field"
                  value={contactInfo.phone}
                  onChange={(e) => setContactInfo({ ...contactInfo, phone: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  <MapPin size={16} className="inline mr-2" />
                  Address
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  value={contactInfo.address}
                  onChange={(e) => setContactInfo({ ...contactInfo, address: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  <Globe size={16} className="inline mr-2" />
                  Google Map Embed Code
                </label>
                <textarea
                  className="input-field font-mono text-sm"
                  rows={4}
                  value={contactInfo.googleMapEmbed}
                  onChange={(e) => setContactInfo({ ...contactInfo, googleMapEmbed: e.target.value })}
                  placeholder="Paste Google Maps iframe embed code here..."
                />
              </div>
              <div>
                <h3 className="font-heading font-bold text-charcoal mb-4">Social Media Links</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input
                    type="url"
                    placeholder="Facebook URL"
                    className="input-field"
                    value={contactInfo.socialLinks.facebook}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialLinks: { ...contactInfo.socialLinks, facebook: e.target.value }
                    })}
                  />
                  <input
                    type="url"
                    placeholder="Twitter URL"
                    className="input-field"
                    value={contactInfo.socialLinks.twitter}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialLinks: { ...contactInfo.socialLinks, twitter: e.target.value }
                    })}
                  />
                  <input
                    type="url"
                    placeholder="Instagram URL"
                    className="input-field"
                    value={contactInfo.socialLinks.instagram}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialLinks: { ...contactInfo.socialLinks, instagram: e.target.value }
                    })}
                  />
                  <input
                    type="url"
                    placeholder="LinkedIn URL"
                    className="input-field"
                    value={contactInfo.socialLinks.linkedin}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialLinks: { ...contactInfo.socialLinks, linkedin: e.target.value }
                    })}
                  />
                  <input
                    type="url"
                    placeholder="YouTube URL"
                    className="input-field"
                    value={contactInfo.socialLinks.youtube}
                    onChange={(e) => setContactInfo({
                      ...contactInfo,
                      socialLinks: { ...contactInfo.socialLinks, youtube: e.target.value }
                    })}
                  />
                </div>
              </div>
              <div>
                <h3 className="font-heading font-bold text-charcoal mb-4">Office Hours</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Monday - Friday
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={contactInfo.officeHours.weekdays}
                      onChange={(e) => setContactInfo({
                        ...contactInfo,
                        officeHours: { ...contactInfo.officeHours, weekdays: e.target.value }
                      })}
                      placeholder="9:00 AM - 5:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Saturday
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={contactInfo.officeHours.saturday}
                      onChange={(e) => setContactInfo({
                        ...contactInfo,
                        officeHours: { ...contactInfo.officeHours, saturday: e.target.value }
                      })}
                      placeholder="10:00 AM - 2:00 PM"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Sunday
                    </label>
                    <input
                      type="text"
                      className="input-field"
                      value={contactInfo.officeHours.sunday}
                      onChange={(e) => setContactInfo({
                        ...contactInfo,
                        officeHours: { ...contactInfo.officeHours, sunday: e.target.value }
                      })}
                      placeholder="Closed"
                    />
                  </div>
                </div>
              </div>
              <button 
                onClick={handleSaveContactInfo} 
                className="btn-primary"
                disabled={saving}
              >
                {saving ? (
                  <>
                    <div className="spinner w-5 h-5 mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={18} className="mr-2" />
                    Save Contact Information
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactAdminPortal;

