import React, { useState } from 'react';
import { Heart, Calendar, MapPin, Users, Send } from 'lucide-react';
import { toast } from 'react-toastify';

const VolunteerForm = () => {
  const [formData, setFormData] = useState({
    activity: '',
    date: '',
    hours: '',
    location: '',
    description: '',
    participants: ''
  });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Volunteer hours submitted successfully!');
      setFormData({
        activity: '',
        date: '',
        hours: '',
        location: '',
        description: '',
        participants: ''
      });
      setSubmitting(false);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="container-custom max-w-3xl">
        <div className="card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart size={32} className="text-white" />
            </div>
            <h1 className="font-heading text-3xl font-bold text-charcoal mb-2">
              Log Volunteer Hours
            </h1>
            <p className="text-neutral-600">
              Record your community service and volunteer activities
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Activity/Project Name *
              </label>
              <input
                type="text"
                name="activity"
                value={formData.activity}
                onChange={handleChange}
                required
                className="input-field"
                placeholder="e.g., Tree Planting Initiative"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Date *
                </label>
                <div className="relative">
                  <Calendar size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="input-field pl-11"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-charcoal mb-2">
                  Hours Volunteered *
                </label>
                <input
                  type="number"
                  name="hours"
                  value={formData.hours}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.5"
                  className="input-field"
                  placeholder="4"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Location *
              </label>
              <div className="relative">
                <MapPin size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="input-field pl-11"
                  placeholder="e.g., Embu Town Center"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Number of Participants
              </label>
              <div className="relative">
                <Users size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
                <input
                  type="number"
                  name="participants"
                  value={formData.participants}
                  onChange={handleChange}
                  min="1"
                  className="input-field pl-11"
                  placeholder="20"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-charcoal mb-2">
                Activity Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                rows="5"
                className="input-field resize-none"
                placeholder="Describe the volunteer activity, your role, and the impact..."
              ></textarea>
            </div>

            <div className="bg-accent-blue/10 border border-accent-blue/20 rounded-lg p-4">
              <p className="text-sm text-neutral-700">
                <strong>Note:</strong> Your submission will be reviewed by the ELP team. 
                Approved hours will be added to your volunteer record.
              </p>
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
                  Submit Volunteer Hours
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default VolunteerForm;
