import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import MaintenanceModal from '../components/MaintenanceModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import maintenanceService from '../services/maintenanceService';
import equipmentService from '../services/equipmentService';
import { useAuth } from '../context/AuthContext';
import {
  Wrench,
  Plus,
  CheckCircle,
  AlertTriangle,
  Clock,
  DollarSign,
  Filter,
} from 'lucide-react';

export const Maintenance = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [equipmentList, setEquipmentList] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isNewTicketOpen, setIsNewTicketOpen] = useState(false);
  const [selectedTicketForUpdate, setSelectedTicketForUpdate] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchMaintenance = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (statusFilter !== 'All') params.status = statusFilter;
      if (priorityFilter !== 'All') params.priority = priorityFilter;

      const [maintRes, eqRes] = await Promise.all([
        maintenanceService.getAll(params),
        equipmentService.getAll({ limit: 100 }),
      ]);

      setTickets(maintRes.records || []);
      setEquipmentList(eqRes.equipment || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch maintenance tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaintenance();
  }, [statusFilter, priorityFilter]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCreateTicket = async (data) => {
    try {
      await maintenanceService.create(data);
      showToast('Maintenance request logged! Equipment placed in service status.');
      fetchMaintenance();
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateTicket = async (data) => {
    try {
      await maintenanceService.updateStatus(selectedTicketForUpdate._id, data);
      showToast(`Work order updated to '${data.status}'!`);
      setSelectedTicketForUpdate(null);
      fetchMaintenance();
    } catch (err) {
      throw err;
    }
  };

  const isTechnicianOrAdmin = ['admin', 'faculty', 'technician'].includes(
    user?.role
  );

  return (
    <AppLayout pageTitle="Maintenance & Diagnostics">
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Equipment Fault & Maintenance Workbench
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Log equipment malfunctions, manage technician work orders, and track calibration downtime.
          </p>
        </div>

        <button
          onClick={() => setIsNewTicketOpen(true)}
          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold flex items-center space-x-1.5 shadow-2xs hover:shadow-xs transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Report New Fault</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold uppercase tracking-wider">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span>Filter:</span>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700 font-medium"
        >
          <option value="All">All Statuses</option>
          <option value="Reported">Reported</option>
          <option value="Assigned">Assigned</option>
          <option value="In Progress">In Progress</option>
          <option value="Awaiting Inspection">Awaiting Inspection</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700 font-medium"
        >
          <option value="All">All Priorities</option>
          <option value="Critical">Critical</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
      </div>

      {error && <ErrorMessage message={error} onRetry={fetchMaintenance} />}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading maintenance work orders..." size="large" />
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Wrench className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No maintenance records
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            No work orders currently match the selected filter criteria.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((t) => (
            <div
              key={t._id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="font-semibold text-slate-900 text-sm">
                    {t.issue}
                  </span>
                  <StatusBadge status={t.status} />
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      t.priority === 'Critical' || t.priority === 'High'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    Priority: {t.priority}
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium">
                  Equipment:{' '}
                  <span className="text-slate-800 font-semibold">
                    {t.equipment?.name} ({t.equipment?.equipmentCode})
                  </span>{' '}
                  • Location: {t.equipment?.laboratory?.name || 'Lab'} (
                  {t.equipment?.laboratory?.location || 'Campus'})
                </p>

                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  {t.description}
                </p>

                {t.resolutionNotes && (
                  <p className="mt-2 text-xs text-emerald-800 bg-emerald-50 p-2.5 rounded-xl border border-emerald-100 font-medium">
                    <strong>Resolution Notes:</strong> {t.resolutionNotes}
                    {t.repairCost > 0 && ` (Incurred Cost: $${t.repairCost})`}
                  </p>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-4 text-[11px] text-slate-400">
                  <span>Reported by: {t.reportedBy?.name || 'Academic User'}</span>
                  {t.assignedTo && (
                    <span>Assigned Technician: {t.assignedTo?.name}</span>
                  )}
                  <span>
                    Reported on: {new Date(t.reportedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {isTechnicianOrAdmin && (
                <div className="flex items-center space-x-2 self-start md:self-center">
                  <button
                    onClick={() => setSelectedTicketForUpdate(t)}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Update Ticket</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* New Fault Report Modal */}
      {isNewTicketOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">
              Select Equipment to Report Fault
            </h3>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Select Equipment
                </label>
                <select
                  id="targetEquipmentSelect"
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none"
                >
                  {equipmentList.map((e) => (
                    <option key={e._id} value={e._id}>
                      {e.name} ({e.equipmentCode}) - {e.department?.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => setIsNewTicketOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const sel = document.getElementById('targetEquipmentSelect');
                    const chosen = equipmentList.find((e) => e._id === sel.value);
                    setIsNewTicketOpen(false);
                    setSelectedTicketForUpdate(null);
                    // Open standard maintenance modal for chosen equipment
                    setTimeout(() => {
                      const triggerModal = document.createElement('div');
                      setSelectedTicketForUpdate({ equipment: chosen });
                    }, 50);
                  }}
                  className="px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700"
                >
                  Continue to Form
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Update Modal */}
      {selectedTicketForUpdate && (
        <MaintenanceModal
          equipment={selectedTicketForUpdate.equipment}
          maintenanceRecord={selectedTicketForUpdate._id ? selectedTicketForUpdate : null}
          isOpen={!!selectedTicketForUpdate}
          onClose={() => setSelectedTicketForUpdate(null)}
          onSubmit={
            selectedTicketForUpdate._id
              ? handleUpdateTicket
              : handleCreateTicket
          }
          isTechnicianMode={!!selectedTicketForUpdate._id}
        />
      )}
    </AppLayout>
  );
};

export default Maintenance;

