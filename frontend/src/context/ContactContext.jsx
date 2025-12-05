import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { contactService } from '../services/contactService';

const ContactContext = createContext();

export const useContact = () => {
  const context = useContext(ContactContext);
  if (!context) {
    throw new Error('useContact must be used within a ContactProvider');
  }
  return context;
};

export const ContactProvider = ({ children }) => {
  const [contactInfo, setContactInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadContactInfo = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await contactService.getContactInfo();
      setContactInfo(data);
    } catch (err) {
      console.error('Failed to load contact info:', err);
      setError(err.message || 'Failed to load contact information');
      // Set default values if API fails
      setContactInfo({
        email: 'elp@uoem.ac.ke',
        phone: '+254 712 345 678',
        address: 'University of Embu\nP.O. Box 6-60100\nEmbu, Kenya',
        googleMapEmbed: '',
        socialLinks: {
          facebook: 'https://facebook.com',
          twitter: 'https://twitter.com',
          instagram: 'https://www.instagram.com/uoem_elc?igsh=MXAzbW42dXQ4MDJ1YQ==',
          linkedin: 'https://linkedin.com',
          youtube: 'https://youtube.com'
        },
        officeHours: {
          weekdays: '9:00 AM - 5:00 PM',
          saturday: '10:00 AM - 2:00 PM',
          sunday: 'Closed'
        }
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContactInfo();
    
    // Listen for contact info updates from other tabs/windows
    const handleContactInfoUpdate = () => {
      loadContactInfo();
    };
    
    if (typeof window !== 'undefined') {
      window.addEventListener('contactInfoUpdated', handleContactInfoUpdate);
      // Also listen for storage events (cross-tab communication)
      window.addEventListener('storage', (e) => {
        if (e.key === 'contactInfoUpdated') {
          loadContactInfo();
        }
      });
    }
    
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('contactInfoUpdated', handleContactInfoUpdate);
      }
    };
  }, [loadContactInfo]);

  const updateContactInfo = async (token, contactData) => {
    try {
      setError(null);
      const response = await contactService.updateContactInfo(token, contactData);
      // Reload contact info after update to ensure all components get the latest data
      await loadContactInfo();
      // Dispatch custom event to notify other tabs/windows (if needed)
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('contactInfoUpdated'));
        // Also use localStorage to notify other tabs
        localStorage.setItem('contactInfoUpdated', Date.now().toString());
        localStorage.removeItem('contactInfoUpdated');
      }
      return response;
    } catch (err) {
      console.error('Failed to update contact info:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update contact information');
      throw err;
    }
  };

  const value = {
    contactInfo,
    loading,
    error,
    loadContactInfo,
    updateContactInfo
  };

  return <ContactContext.Provider value={value}>{children}</ContactContext.Provider>;
};

