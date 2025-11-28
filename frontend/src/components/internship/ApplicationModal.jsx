import React, { useState } from 'react';
import { X, FileText, Calendar, MapPin, Briefcase, GraduationCap } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const ApplicationModal = ({ internship, isOpen, onClose, onSubmit }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    university: '',
    major: '',
    yearOfStudy: '',
    gpa: '',
    experience: '',
    motivation: '',
    availability: '',
    resume: null,
    coverLetter: null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: files ? files[0] : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('validation.required');
    if (!formData.lastName.trim()) newErrors.lastName = t('validation.required');
    if (!formData.email.trim()) {
      newErrors.email = t('validation.required');
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = t('validation.email');
    }
    if (!formData.phone.trim()) newErrors.phone = t('validation.required');
    if (!formData.university.trim()) newErrors.university = t('validation.required');
    if (!formData.major.trim()) newErrors.major = t('validation.required');
    if (!formData.yearOfStudy) newErrors.yearOfStudy = t('validation.required');
    if (!formData.gpa) newErrors.gpa = t('validation.required');
    if (!formData.motivation.trim()) newErrors.motivation = t('validation.required');
    if (!formData.availability.trim()) newErrors.availability = t('validation.required');
    if (!formData.resume) newErrors.resume = t('validation.resumeRequired');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const applicationData = new FormData();
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null) {
          applicationData.append(key, formData[key]);
        }
      });
      applicationData.append('internshipId', internship._id);

      await onSubmit(applicationData);
      onClose();
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        university: '',
        major: '',
        yearOfStudy: '',
        gpa: '',
        experience: '',
        motivation: '',
        availability: '',
        resume: null,
        coverLetter: null
      });
    } catch (error) {
      console.error('Application submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900">
              {t('internship.applyFor')} - {internship.title}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Internship Details */}
          <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span className="font-medium">{internship.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-blue-600" />
                <span>{internship.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-600" />
                <span>{internship.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>{internship.type}</span>
              </div>
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6">
            <div className="space-y-8">
              {/* Personal Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('application.personalInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.firstName')} *
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{errors.firstName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.lastName')} *
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{errors.lastName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.email')} *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.email && (
                      <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.phone')} *
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('application.academicInfo')}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.university')} *
                    </label>
                    <input
                      type="text"
                      name="university"
                      value={formData.university}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.university ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.university && (
                      <p className="text-red-500 text-sm mt-1">{errors.university}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.major')} *
                    </label>
                    <input
                      type="text"
                      name="major"
                      value={formData.major}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.major ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.major && (
                      <p className="text-red-500 text-sm mt-1">{errors.major}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.yearOfStudy')} *
                    </label>
                    <select
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.yearOfStudy ? 'border-red-500' : 'border-gray-300'
                      }`}
                    >
                      <option value="">{t('application.selectYear')}</option>
                      <option value="1">1st Year</option>
                      <option value="2">2nd Year</option>
                      <option value="3">3rd Year</option>
                      <option value="4">4th Year</option>
                      <option value="5">5th Year</option>
                      <option value="graduate">Graduate</option>
                    </select>
                    {errors.yearOfStudy && (
                      <p className="text-red-500 text-sm mt-1">{errors.yearOfStudy}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.gpa')} *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="4"
                      name="gpa"
                      value={formData.gpa}
                      onChange={handleChange}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.gpa ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.gpa && (
                      <p className="text-red-500 text-sm mt-1">{errors.gpa}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('application.additionalInfo')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.experience')}
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder={t('application.experiencePlaceholder')}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.motivation')} *
                    </label>
                    <textarea
                      name="motivation"
                      value={formData.motivation}
                      onChange={handleChange}
                      rows={4}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.motivation ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('application.motivationPlaceholder')}
                    />
                    {errors.motivation && (
                      <p className="text-red-500 text-sm mt-1">{errors.motivation}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.availability')} *
                    </label>
                    <textarea
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      rows={3}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.availability ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder={t('application.availabilityPlaceholder')}
                    />
                    {errors.availability && (
                      <p className="text-red-500 text-sm mt-1">{errors.availability}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Documents */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('application.documents')}
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.resume')} * (PDF, DOC, DOCX - Max 5MB)
                    </label>
                    <input
                      type="file"
                      name="resume"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.resume ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.resume && (
                      <p className="text-red-500 text-sm mt-1">{errors.resume}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('application.coverLetter')} (PDF, DOC, DOCX - Max 5MB)
                    </label>
                    <input
                      type="file"
                      name="coverLetter"
                      onChange={handleChange}
                      accept=".pdf,.doc,.docx"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? t('common.submitting') : t('application.submitApplication')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ApplicationModal;
