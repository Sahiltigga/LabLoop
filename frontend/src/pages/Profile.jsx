import React, { useState } from 'react';
import AppLayout from '../components/AppLayout';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import authService from '../services/authService';
import {
  User,
  Mail,
  Shield,
  Building,
  Phone,
  Key,
  CheckCircle,
  Save,
} from 'lucide-react';

export const Profile = () => {
  const { user, updateCurrentUser } = useAuth();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    studentOrEmployeeId: user?.studentOrEmployeeId || '',
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const updatePayload = {
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      studentOrEmployeeId: formData.studentOrEmployeeId.trim(),
    };

    if (formData.newPassword) {
      if (formData.newPassword.length < 6) {
        setError('New password must be at least 6 characters long.');
        return;
      }
      if (formData.newPassword !== formData.confirmNewPassword) {
        setError('New passwords do not match.');
        return;
      }
      updatePayload.password = formData.newPassword;
    }

    try {
      setLoading(true);
      const res = await authService.updateProfile(updatePayload);
      updateCurrentUser(res.user);
      setSuccess('Profile details successfully updated!');
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: '',
      }));
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout pageTitle="User Profile">
      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && <ErrorMessage message={error} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-2xl uppercase shadow-md mb-4">
            {user?.name ? user.name.charAt(0) : 'U'}
          </div>

          <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
          <span className="inline-block px-3 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary-50 text-primary-700 mt-1">
            {user?.role}
          </span>

          <div className="w-full mt-6 pt-6 border-t border-slate-100 text-left text-xs space-y-3">
            <div className="flex items-center space-x-3 text-slate-600">
              <Mail className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span className="truncate">{user?.email}</span>
            </div>

            {user?.department && (
              <div className="flex items-center space-x-3 text-slate-600">
                <Building className="w-4 h-4 text-slate-400 flex-shrink-0" />
                <span className="truncate">
                  {user.department.name || 'Central Administration'}
                </span>
              </div>
            )}

            <div className="flex items-center space-x-3 text-slate-600">
              <Shield className="w-4 h-4 text-slate-400 flex-shrink-0" />
              <span>Institutional ID: {user?.studentOrEmployeeId || 'N/A'}</span>
            </div>
          </div>
        </div>

        {/* Edit Form */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs">
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Account Information
          </h3>
          <p className="text-xs text-slate-500 mb-6">
            Update your academic profile and credentials
          </p>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Roll No / Employee ID
                </label>
                <input
                  type="text"
                  name="studentOrEmployeeId"
                  value={formData.studentOrEmployeeId}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+1-555-0100"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center space-x-1.5">
                <Key className="w-3.5 h-3.5 text-primary-600" />
                <span>Change Password (Leave blank to keep current)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleChange}
                    placeholder="Repeat new password"
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Saving...' : 'Update Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default Profile;

