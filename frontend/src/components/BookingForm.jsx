import React, { useState } from 'react';
import { X, Calendar, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

export const BookingForm = ({ equipment, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '12:00',
    requestedQuantity: 1,
    purpose: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen || !equipment) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!formData.purpose.trim()) {
      setError('Please provide a specific purpose or project title for this booking.');
      return;
    }

    const startDateTime = new Date(`${formData.date}T${formData.startTime}:00`);
    const endDateTime = new Date(`${formData.date}T${formData.endTime}:00`);

    if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
      setError('Invalid date or time format.');
      return;
    }

    if (startDateTime >= endDateTime) {
      setError('Booking start time must be earlier than the end time.');
      return;
    }

    const now = new Date();
    if (startDateTime < new Date(now.getTime() - 5 * 60 * 1000)) {
      setError('Cannot reserve an equipment slot in the past.');
      return;
    }

    const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);
    if (equipment.maxBookingHours && durationHours > equipment.maxBookingHours) {
      setError(
        `Selected duration (${durationHours.toFixed(1)} hrs) exceeds the maximum allowed limit of ${
          equipment.maxBookingHours
        } hours for this equipment.`
      );
      return;
    }

    const qty = parseInt(formData.requestedQuantity, 10);
    if (isNaN(qty) || qty <= 0) {
      setError('Please request at least 1 unit.');
      return;
    }

    if (qty > equipment.quantity) {
      setError(`Cannot request more than total available inventory (${equipment.quantity}).`);
      return;
    }

    try {
      setLoading(true);
      await onSuccess({
        equipmentId: equipment._id,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        requestedQuantity: qty,
        purpose: formData.purpose.trim(),
      });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit booking reservation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Reserve Equipment
            </h3>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {equipment.name} ({equipment.equipmentCode})
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          {equipment.requiresTraining && (
            <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Notice:</strong> This equipment requires verified faculty supervision or specialized laboratory training before check-out.
              </span>
            </div>
          )}

          {/* Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Reservation Date *
            </label>
            <div className="relative">
              <input
                type="date"
                name="date"
                required
                value={formData.date}
                min={new Date().toISOString().split('T')[0]}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Time Pickers */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                name="startTime"
                required
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                name="endTime"
                required
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Quantity */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Quantity *
              </label>
              <span className="text-xs text-slate-400">
                Max available: {equipment.availableQuantity} unit(s)
              </span>
            </div>
            <input
              type="number"
              name="requestedQuantity"
              min="1"
              max={equipment.quantity}
              required
              value={formData.requestedQuantity}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
            />
          </div>

          {/* Purpose */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Project Purpose / Research Details *
            </label>
            <textarea
              name="purpose"
              rows="3"
              required
              placeholder="Explain experiment or project requirements..."
              value={formData.purpose}
              onChange={handleChange}
              className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none placeholder-slate-400"
            />
          </div>

          {/* Action Buttons */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{loading ? 'Submitting...' : 'Confirm Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BookingForm;

