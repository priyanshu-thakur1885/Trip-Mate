import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripsAPI } from '../api/trips';
import toast from 'react-hot-toast';

const CreateTrip = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: '',
    budget: '',
    coverImage: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await tripsAPI.create({
        ...formData,
        budget: parseFloat(formData.budget) || 0,
      });

      if (response.data.success) {
        toast.success('Trip created successfully!');
        navigate(`/trip/${response.data.data._id}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create trip');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Create New Trip</h1>
        <p className="text-gray-600 dark:text-gray-400">Plan your next adventure</p>
      </div>

      <form onSubmit={handleSubmit} className="card space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Trip Title *
            </label>
            <input
              type="text"
              name="title"
              required
              className="input-field"
              placeholder="e.g., Summer Vacation 2024"
              value={formData.title}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Destination *
            </label>
            <input
              type="text"
              name="destination"
              required
              className="input-field"
              placeholder="e.g., Paris, France"
              value={formData.destination}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date *
            </label>
            <input
              type="date"
              name="startDate"
              required
              className="input-field"
              value={formData.startDate}
              onChange={handleChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date *
            </label>
            <input
              type="date"
              name="endDate"
              required
              className="input-field"
              value={formData.endDate}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget (₹)
            </label>
            <input
              type="number"
              name="budget"
              min="0"
              step="0.01"
              className="input-field"
              placeholder="0.00"
              value={formData.budget}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cover Image URL
            </label>
            <input
              type="url"
              name="coverImage"
              className="input-field"
              placeholder="https://example.com/image.jpg"
              value={formData.coverImage}
              onChange={handleChange}
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              name="description"
              rows="4"
              className="input-field"
              placeholder="Tell us about your trip..."
              value={formData.description}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary px-6 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Trip'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateTrip;

