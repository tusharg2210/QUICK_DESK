import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Shield, Bell, Save } from 'lucide-react';
import Button from '../../components/ui/Button';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    notificationPreferences: {
      email: user?.notificationPreferences?.email ?? true,
      ticketUpdates: user?.notificationPreferences?.ticketUpdates ?? true
    }
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === 'checkbox' ? checked : value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const response = await api.put('/auth/profile', formData);
      
      if (response.data.success) {
        toast.success('Profile updated successfully');
      }
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>
        </div>
        
        <div className="p-6">
          <div className="flex items-center space-x-6 mb-6">
            <img
              className="h-20 w-20 rounded-full"
              src={user?.photoURL || `https://ui-avatars.com/api/?name=${user?.name}&background=3b82f6&color=fff`}
              alt={user?.name}
            />
            <div>
              <h4 className="text-lg font-medium text-gray-900">{user?.name}</h4>
              <p className="text-sm text-gray-500">{user?.email}</p>
              <div className="mt-1 flex items-center">
                <Shield className="h-4 w-4 text-gray-400 mr-1" />
                <span className="text-sm text-gray-600 capitalize">{user?.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <User className="inline h-4 w-4 mr-2" />
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 input-field"
                placeholder="Enter your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                <Mail className="inline h-4 w-4 mr-2" />
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                className="mt-1 input-field bg-gray-50"
                disabled
              />
              <p className="mt-1 text-xs text-gray-500">
                Email cannot be changed. It's linked to your Google account.
              </p>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
              <Button
                type="submit"
                loading={loading}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            <Bell className="inline h-5 w-5 mr-2" />
            Notification Preferences
          </h3>
          <p className="text-sm text-gray-600">Choose how you want to be notified</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-500">Receive notifications via email</p>
            </div>
            <input
              type="checkbox"
              name="notificationPreferences.email"
              checked={formData.notificationPreferences.email}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Ticket Updates</h4>
              <p className="text-sm text-gray-500">Get notified when your tickets are updated</p>
            </div>
            <input
              type="checkbox"
              name="notificationPreferences.ticketUpdates"
              checked={formData.notificationPreferences.ticketUpdates}
              onChange={handleInputChange}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
          </div>
        </div>
      </div>

      {/* Account Stats */}
      <div className="bg-white shadow-sm rounded-lg border">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Account Statistics</h3>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Total Tickets</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">0</div>
              <div className="text-sm text-gray-600">Open Tickets</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;