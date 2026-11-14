import React, { useState, useEffect } from 'react';
import { X, Building2 } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

export const DepartmentModal = ({
  department,
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!department;

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    headOfDepartment: '',
    contactEmail: '',
    contactPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name || '',
        code: department.code || '',
        description: department.description || '',
        headOfDepartment: department.headOfDepartment || '',
        contactEmail: department.contactEmail || '',
        contactPhone: department.contactPhone || '',
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        headOfDepartment: '',
        contactEmail: '',
        contactPhone: '',
      });
    }
  }, [department, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.code.trim()) {
      setError('Department name and code are required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        code: formData.code.toUpperCase().trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save department.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-primary-600" />
            <h3 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit Academic Department' : 'Create Academic Department'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department Name *
              </label>
              <input
                type="text"
                name="name"
                required
                placeholder="e.g. Mechanical Engineering"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Code *
              </label>
              <input
                type="text"
                name="code"
                required
                placeholder="e.g. ME"
                value={formData.code}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none uppercase font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Head of Department
            </label>
            <input
              type="text"
              name="headOfDepartment"
              placeholder="e.g. Dr. Jane Doe"
              value={formData.headOfDepartment}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Email
              </label>
              <input
                type="email"
                name="contactEmail"
                placeholder="dept@labloop.edu"
                value={formData.contactEmail}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                name="contactPhone"
                placeholder="+1-555-0199"
                value={formData.contactPhone}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              rows="2"
              placeholder="Academic disciplines, research groups..."
              value={formData.description}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-2xs hover:shadow-xs transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DepartmentModal;

