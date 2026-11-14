import React, { useState, useEffect } from 'react';
import { X, Plus, Edit2 } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

export const EquipmentModal = ({
  equipment,
  departments = [],
  laboratories = [],
  isOpen,
  onClose,
  onSubmit,
}) => {
  const isEdit = !!equipment;

  const [formData, setFormData] = useState({
    name: '',
    equipmentCode: '',
    category: 'Electronics',
    description: '',
    department: '',
    laboratory: '',
    modelNumber: '',
    manufacturer: '',
    quantity: 1,
    availableQuantity: 1,
    condition: 'Good',
    status: 'Available',
    requiresTraining: false,
    maxBookingHours: 4,
    specifications: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (equipment) {
      setFormData({
        name: equipment.name || '',
        equipmentCode: equipment.equipmentCode || '',
        category: equipment.category || 'Electronics',
        description: equipment.description || '',
        department: equipment.department?._id || equipment.department || '',
        laboratory: equipment.laboratory?._id || equipment.laboratory || '',
        modelNumber: equipment.modelNumber || '',
        manufacturer: equipment.manufacturer || '',
        quantity: equipment.quantity || 1,
        availableQuantity: equipment.availableQuantity || 1,
        condition: equipment.condition || 'Good',
        status: equipment.status || 'Available',
        requiresTraining: Boolean(equipment.requiresTraining),
        maxBookingHours: equipment.maxBookingHours || 4,
        specifications: equipment.specifications || '',
      });
    } else {
      setFormData({
        name: '',
        equipmentCode: '',
        category: 'Electronics',
        description: '',
        department: departments[0]?._id || '',
        laboratory: laboratories[0]?._id || '',
        modelNumber: '',
        manufacturer: '',
        quantity: 1,
        availableQuantity: 1,
        condition: 'Good',
        status: 'Available',
        requiresTraining: false,
        maxBookingHours: 4,
        specifications: '',
      });
    }
  }, [equipment, departments, laboratories, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.name.trim() || !formData.equipmentCode.trim()) {
      setError('Name and equipment code are required.');
      return;
    }

    try {
      setLoading(true);
      await onSubmit({
        ...formData,
        quantity: parseInt(formData.quantity, 10),
        availableQuantity: parseInt(formData.availableQuantity, 10),
        maxBookingHours: parseInt(formData.maxBookingHours, 10),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to save equipment record.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-100 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            {isEdit ? (
              <Edit2 className="w-5 h-5 text-primary-600" />
            ) : (
              <Plus className="w-5 h-5 text-primary-600" />
            )}
            <h3 className="text-base font-semibold text-slate-900">
              {isEdit ? 'Edit Equipment Details' : 'Register New Equipment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && <ErrorMessage message={error} />}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Equipment Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Digital Storage Oscilloscope"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Equipment Code (Unique) *
              </label>
              <input
                type="text"
                name="equipmentCode"
                required
                value={formData.equipmentCode}
                onChange={handleChange}
                placeholder="e.g. EQ-ECE-101"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Computing & IoT">Computing & IoT</option>
                <option value="Electronics">Electronics</option>
                <option value="Testing & Measurement">Testing & Measurement</option>
                <option value="Prototyping">Prototyping & Fabrication</option>
                <option value="Optics & Physics">Optics & Physics</option>
                <option value="Mechanical">Mechanical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Department *
              </label>
              <select
                name="department"
                required
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Laboratory Location *
              </label>
              <select
                name="laboratory"
                required
                value={formData.laboratory}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">Select Laboratory</option>
                {laboratories.map((l) => (
                  <option key={l._id} value={l._id}>
                    {l.name} ({l.location})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Model / Manufacturer
              </label>
              <input
                type="text"
                name="modelNumber"
                value={formData.modelNumber}
                onChange={handleChange}
                placeholder="e.g. Keysight DSO-X 2002A"
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Total Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                min="1"
                required
                value={formData.quantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Available Stock *
              </label>
              <input
                type="number"
                name="availableQuantity"
                min="0"
                max={formData.quantity}
                required
                value={formData.availableQuantity}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Max Hours / Booking
              </label>
              <input
                type="number"
                name="maxBookingHours"
                min="1"
                max="24"
                value={formData.maxBookingHours}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Condition
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Excellent">Excellent</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
                <option value="Needs Maintenance">Needs Maintenance</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Available">Available</option>
                <option value="Partially Available">Partially Available</option>
                <option value="Under Maintenance">Under Maintenance</option>
                <option value="Unavailable">Unavailable</option>
                <option value="Retired">Retired</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Equipment Description *
            </label>
            <textarea
              name="description"
              rows="2"
              required
              value={formData.description}
              onChange={handleChange}
              placeholder="Detailed description of features and usage..."
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="requiresTraining"
              name="requiresTraining"
              checked={formData.requiresTraining}
              onChange={handleChange}
              className="w-4 h-4 text-primary-600 rounded border-slate-300 focus:ring-primary-500"
            />
            <label htmlFor="requiresTraining" className="text-xs text-slate-700 font-medium">
              Requires prerequisite safety certification / faculty training before booking
            </label>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
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
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Register Equipment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EquipmentModal;

