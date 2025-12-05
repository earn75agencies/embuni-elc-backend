/**
 * DesignAdminPortal - Dedicated portal for Website Design Admin
 * 
 * Manages UI content, banner texts, footer information, colors, and overall design consistency
 */

import React, { useState, useEffect } from 'react';
import { 
  Palette, Save, Image, Type, Layout, Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { designSettingsService } from '../services/designSettingsService';

const DesignAdminPortal = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('banner'); // banner, footer, colors, hero

  const [bannerData, setBannerData] = useState({
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    backgroundImage: '',
    backgroundImageFile: null
  });

  const [footerData, setFooterData] = useState({
    description: '',
    copyright: '',
    quickLinks: []
  });

  const [colorScheme, setColorScheme] = useState({
    primary: '#3B82F6',
    secondary: '#8B5CF6',
    accent: '#10B981'
  });

  const [heroData, setHeroData] = useState({
    title: '',
    subtitle: '',
    image: '',
    imageFile: null
  });

  useEffect(() => {
    fetchDesignSettings();
  }, [token]);

  const fetchDesignSettings = async () => {
    try {
      setLoading(true);
      const response = await designSettingsService.getDesignSettings(token);
      const settings = response.data;
      
      if (settings.banner) setBannerData(settings.banner);
      if (settings.footer) setFooterData(settings.footer);
      if (settings.colors) setColorScheme(settings.colors);
      if (settings.hero) setHeroData(settings.hero);
      
      setLoading(false);
    } catch (error) {
      toast.error('Failed to load design settings');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDesignSettings();
  }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await designSettingsService.updateDesignSettings(token, {
        banner: bannerData,
        footer: footerData,
        colors: colorScheme,
        hero: heroData
      });
      toast.success('Design settings saved successfully');
    } catch (error) {
      toast.error('Failed to save design settings');
      console.error('Error saving design settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
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
            <Palette size={32} className="text-violet-600" />
            Website Design Management
          </h1>
          <p className="text-neutral-600 mt-1">
            Manage UI content, banners, footer, colors, and overall design consistency
          </p>
        </div>
      </div>

      <div className="container-custom py-8">
        {/* Tabs */}
        <div className="card p-4 mb-6">
          <div className="flex gap-2 overflow-x-auto">
            {['banner', 'footer', 'colors', 'hero'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                  activeTab === tab
                    ? 'bg-violet-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Banner Tab */}
        {activeTab === 'banner' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">Banner Settings</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Banner Title"
                className="input-field"
                value={bannerData.title}
                onChange={(e) => setBannerData({ ...bannerData, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Banner Subtitle"
                className="input-field"
                value={bannerData.subtitle}
                onChange={(e) => setBannerData({ ...bannerData, subtitle: e.target.value })}
              />
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="CTA Button Text"
                  className="input-field"
                  value={bannerData.ctaText}
                  onChange={(e) => setBannerData({ ...bannerData, ctaText: e.target.value })}
                />
                <input
                  type="url"
                  placeholder="CTA Button Link"
                  className="input-field"
                  value={bannerData.ctaLink}
                  onChange={(e) => setBannerData({ ...bannerData, ctaLink: e.target.value })}
                />
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setBannerData({ 
                        ...bannerData, 
                        backgroundImageFile: file,
                        backgroundImage: '' // Clear URL if file is selected
                      });
                    }
                  }}
                />
                {bannerData.backgroundImageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {bannerData.backgroundImageFile.name}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                <input
                  type="url"
                  placeholder="Background Image URL"
                  className="input-field"
                  value={bannerData.backgroundImage}
                  onChange={(e) => setBannerData({ 
                    ...bannerData, 
                    backgroundImage: e.target.value,
                    backgroundImageFile: null // Clear file if URL is entered
                  })}
                />
                {(bannerData.backgroundImage || bannerData.backgroundImageFile) && (
                  <div className="mt-3">
                    <img
                      src={bannerData.backgroundImageFile ? URL.createObjectURL(bannerData.backgroundImageFile) : bannerData.backgroundImage}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Tab */}
        {activeTab === 'footer' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">Footer Settings</h2>
            <div className="space-y-4">
              <textarea
                placeholder="Footer Description"
                className="input-field"
                rows={4}
                value={footerData.description}
                onChange={(e) => setFooterData({ ...footerData, description: e.target.value })}
              />
              <input
                type="text"
                placeholder="Copyright Text"
                className="input-field"
                value={footerData.copyright}
                onChange={(e) => setFooterData({ ...footerData, copyright: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* Colors Tab */}
        {activeTab === 'colors' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">Color Scheme</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Primary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-20 h-10 rounded border"
                    value={colorScheme.primary}
                    onChange={(e) => setColorScheme({ ...colorScheme, primary: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={colorScheme.primary}
                    onChange={(e) => setColorScheme({ ...colorScheme, primary: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Secondary Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-20 h-10 rounded border"
                    value={colorScheme.secondary}
                    onChange={(e) => setColorScheme({ ...colorScheme, secondary: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={colorScheme.secondary}
                    onChange={(e) => setColorScheme({ ...colorScheme, secondary: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">Accent Color</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-20 h-10 rounded border"
                    value={colorScheme.accent}
                    onChange={(e) => setColorScheme({ ...colorScheme, accent: e.target.value })}
                  />
                  <input
                    type="text"
                    className="input-field flex-1"
                    value={colorScheme.accent}
                    onChange={(e) => setColorScheme({ ...colorScheme, accent: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="card p-6">
            <h2 className="font-heading text-2xl font-bold text-charcoal mb-6">Hero Section</h2>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Hero Title"
                className="input-field"
                value={heroData.title}
                onChange={(e) => setHeroData({ ...heroData, title: e.target.value })}
              />
              <input
                type="text"
                placeholder="Hero Subtitle"
                className="input-field"
                value={heroData.subtitle}
                onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })}
              />
              <div>
                <input
                  type="file"
                  accept="image/*"
                  className="input-field"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setHeroData({ 
                        ...heroData, 
                        imageFile: file,
                        image: '' // Clear URL if file is selected
                      });
                    }
                  }}
                />
                {heroData.imageFile && (
                  <p className="text-sm text-green-600 mt-2">
                    Selected: {heroData.imageFile.name}
                  </p>
                )}
                <p className="text-xs text-neutral-500 mt-2 mb-2">Or enter image URL:</p>
                <input
                  type="url"
                  placeholder="Hero Image URL"
                  className="input-field"
                  value={heroData.image}
                  onChange={(e) => setHeroData({ 
                    ...heroData, 
                    image: e.target.value,
                    imageFile: null // Clear file if URL is entered
                  })}
                />
                {(heroData.image || heroData.imageFile) && (
                  <div className="mt-3">
                    <img
                      src={heroData.imageFile ? URL.createObjectURL(heroData.imageFile) : heroData.image}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={18} className="mr-2" />
            {saving ? 'Saving...' : 'Save Design Settings'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DesignAdminPortal;

