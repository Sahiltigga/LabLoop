import React, { useState } from 'react';
import { X, Wrench, CheckCircle } from 'lucide-react';
import ErrorMessage from './ErrorMessage';

export const MaintenanceModal = ({
  equipment,
  maintenanceRecord,
  isOpen,
  onClose,
  onSubmit,
  isTechnicianMode = false,
}) => {
  const [formData, setFormData] = useState({
    issue: maintenanceRecord?.issue || '',
    description: maintenanceRecord?.description || '',
    priority: maintenanceRecord?.priority || 'Medium',
    status: maintenanceRecord?.status || 'Reported',
    resolutionNotes: maintenanceRecord?.resolutionNotes || '',
    repairCost: maintenanceRecord?.repairCost || 0,
    newCondition: 'Good',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!isTechnicianMode && (!formData.issue.trim() || !formData.description.trim())) {
      setError('Please provide both an issue title and a detailed fault description.');
      return;
    }

    try {
      setLoading(true);
      if (isTechnicianMode) {
        await onSubmit({
          status: formData.status,
          resolutionNotes: formData.resolutionNotes.trim(),
          repairCost: parseFloat(formData.repairCost) || 0,
          newCondition: formData.newCondition,
        });
      } else {
        await onSubmit({
          equipmentId: equipment?._id,
          issue: formData.issue.trim(),
          description: formData.description.trim(),
          priority: formData.priority,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit maintenance update.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-100">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-primary-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {isTechnicianMode ? 'Update Maintenance Progress' : 'Report Equipment Fault'}
              </h3>
              <p className="text-xs text-slate-500 font-mono">
                {equipment?.name || maintenanceRecord?.equipment?.name || 'Equipment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && <ErrorMessage message={error} />}

          {!isTechnicianMode ? (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Issue Summary *
                </label>
                <input
                  type="text"
                  name="issue"
                  required
                  placeholder="e.g. Spindle motor won't turn, laser calibration error"
                  value={formData.issue}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Priority Level *
                </label>
                <select
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="Low">Low - Minor cosmetic / non-blocking</option>
                  <option value="Medium">Medium - Degraded functionality</option>
                  <option value="High">High - Unit unusable / safety hazard</option>
                  <option value="Critical">Critical - Major lab shutdown</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Fault Description *
                </label>
                <textarea
                  name="description"
                  rows="3"
                  required
                  placeholder="Describe error codes, symptoms, and circumstances of the malfunction..."
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Maintenance Status *
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  <option value="In Progress">In Progress (Under service)</option>
                  <option value="Awaiting Inspection">Awaiting Inspection</option>
                  <option value="Completed">Completed (Ready for lab use)</option>
                  <option value="Rejected">Rejected (Not a fault / false alarm)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Repair Cost ($)
                </label>
                <input
                  type="number"
                  name="repairCost"
                  min="0"
                  step="0.01"
                  value={formData.repairCost}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                />
              </div>

              {formData.status === 'Completed' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                    Restored Equipment Condition *
                  </label>
                  <select
                    name="newCondition"
                    value={formData.newCondition}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  >
                    <option value="Excellent">Excellent - Like new</option>
                    <option value="Good">Good - Standard operating</option>
                    <option value="Fair">Fair - Usable with caveats</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Technician Resolution Notes
                </label>
                <textarea
                  name="resolutionNotes"
                  rows="3"
                  placeholder="Detail parts replaced, tests performed, and calibration..."
                  value={formData.resolutionNotes}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none resize-none"
                />
              </div>
            </>
          )}

          {/* Footer */}
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
              <span>{loading ? 'Submitting...' : isTechnicianMode ? 'Update Ticket' : 'Submit Ticket'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MaintenanceModal;

