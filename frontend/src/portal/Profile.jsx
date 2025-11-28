import React, { useState, useRef } from 'react';
import { User, Mail, Phone, BookOpen, Save, Camera, Upload } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { toast } from 'react-toastify';
import { buildUrl } from '../config/api';

const Profile = () => {
  const { user, token, updateUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef(null);
  
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
    course: user?.course || '',
    yearOfStudy: user?.yearOfStudy || '',
    bio: user?.bio || '',
    avatar: user?.avatar || '',
    socialLinks: {
      linkedin: user?.socialLinks?.linkedin || '',
      twitter: user?.socialLinks?.twitter || '',
      instagram: user?.socialLinks?.instagram || ''
    }
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('social_')) {
      const platform = name.replace('social_', '');
      setFormData({
        ...formData,
        socialLinks: { ...formData.socialLinks, [platform]: value }
      });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error('Image size must be less than 5MB');
      return;
    }

    setUploadingPhoto(true);
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await fetch(buildUrl('/auth/profile/avatar'), {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const data = await response.json();
      if (data.success) {
        updateUser({ ...user, avatar: data.avatar });
        setFormData({ ...formData, avatar: data.avatar });
        toast.success('Profile photo updated successfully!');
      } else {
        throw new Error(data.message || 'Failed to upload photo');
      }
    } catch (error) {
      console.error('Photo upload error:', error);
      toast.error(error.message || 'Failed to upload profile photo');
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await authService.updateProfile(token, formData);
      updateUser({ ...user, ...formData });
      toast.success('Profile updated successfully!');
      setEditing(false);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-4xl">
        <div className="card p-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal">
              My Profile
            </h1>
            {!editing && (
              <button
                onClick={() => setEditing(true)}
                className="btn-primary"
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Picture */}
          <div className="flex items-center space-x-6 mb-8 pb-8 border-b border-neutral-200">
            <div className="relative">
              {user?.avatar ? (
                <img
                  src={user.avatar}
                  alt="Profile"
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-primary/20"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-primary flex items-center justify-center ring-4 ring-primary/20">
                  <span className="text-white text-3xl font-bold">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              )}
              {editing && (
                <>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-dark transition-colors cursor-pointer"
                    title="Upload profile photo"
                  >
                    {uploadingPhoto ? (
                      <div className="spinner w-5 h-5"></div>
                    ) : (
                      <Camera size={18} />
                    )}
                  </label>
                </>
              )}
            </div>
            <div>
              <h2 className="font-heading text-2xl font-bold text-charcoal">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-neutral-600">{user?.email}</p>
              <p className="text-sm text-primary font-medium mt-1 capitalize">
                {user?.membershipStatus || 'Active'} Member
              </p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="space-y-6">
              {/* Personal Information */}
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  Academic Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Student ID
                    </label>
                    <input
                      type="text"
                      name="studentId"
                      value={formData.studentId}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Course
                    </label>
                    <input
                      type="text"
                      name="course"
                      value={formData.course}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Year of Study
                    </label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                    >
                      <option value="">Select Year</option>
                      <option value="1">Year 1</option>
                      <option value="2">Year 2</option>
                      <option value="3">Year 3</option>
                      <option value="4">Year 4</option>
                      <option value="5">Year 5</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  About Me (Bio)
                </h3>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  disabled={!editing}
                  rows="5"
                  maxLength={500}
                  className="input-field resize-none"
                  placeholder="Write a brief bio about yourself (max 500 characters)..."
                ></textarea>
                <p className="text-xs text-neutral-500 mt-1">
                  {formData.bio?.length || 0} / 500 characters
                </p>
              </div>

              {/* Social Links */}
              <div>
                <h3 className="font-heading text-xl font-bold text-charcoal mb-4">
                  Social Links
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      name="social_linkedin"
                      value={formData.socialLinks.linkedin}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                      placeholder="https://linkedin.com/in/yourprofile"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Twitter
                    </label>
                    <input
                      type="url"
                      name="social_twitter"
                      value={formData.socialLinks.twitter}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                      placeholder="https://twitter.com/yourhandle"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-charcoal mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      name="social_instagram"
                      value={formData.socialLinks.instagram}
                      onChange={handleChange}
                      disabled={!editing}
                      className="input-field"
                      placeholder="https://instagram.com/yourhandle"
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              {editing && (
                <div className="flex space-x-4 pt-6 border-t border-neutral-200">
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary flex items-center"
                  >
                    {saving ? (
                      <div className="spinner w-5 h-5"></div>
                    ) : (
                      <>
                        <Save size={18} className="mr-2" />
                        Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEditing(false);
                      setFormData({
                        firstName: user?.firstName || '',
                        lastName: user?.lastName || '',
                        email: user?.email || '',
                        phone: user?.phone || '',
                        studentId: user?.studentId || '',
                        course: user?.course || '',
                        yearOfStudy: user?.yearOfStudy || '',
                        bio: user?.bio || '',
                        socialLinks: {
                          linkedin: user?.socialLinks?.linkedin || '',
                          twitter: user?.socialLinks?.twitter || '',
                          instagram: user?.socialLinks?.instagram || ''
                        }
                      });
                    }}
                    className="btn-outline"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
