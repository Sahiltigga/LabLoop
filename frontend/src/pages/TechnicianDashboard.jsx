import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import MaintenanceModal from '../components/MaintenanceModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import maintenanceService from '../services/maintenanceService';
import {
  Wrench,
  CheckCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';

export const TechnicianDashboard = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchTechnicianData = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await maintenanceService.getAll();
      setTickets(res.records || []);
    } catch (err) {
      setError(err.message || 'Failed to load technician maintenance tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicianData();
  }, []);

  const handleUpdateTicket = async (updateData) => {
    try {
      await maintenanceService.updateStatus(selectedTicket._id, updateData);
      setSuccessMsg(`Ticket status updated to '${updateData.status}'!`);
      setSelectedTicket(null);
      fetchTechnicianData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Technician Portal">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading assigned technical work orders..." size="large" />
        </div>
      </AppLayout>
    );
  }

  const activeTickets = tickets.filter(
    (t) => t.status !== 'Completed' && t.status !== 'Rejected'
  );

  const criticalTickets = tickets.filter(
    (t) => t.priority === 'Critical' || t.priority === 'High'
  );

  const completedTickets = tickets.filter((t) => t.status === 'Completed');

  return (
    <AppLayout pageTitle="Technician Maintenance Workbench">
      {error && <ErrorMessage message={error} onRetry={fetchTechnicianData} />}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-amber-950 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30">
            Technical Services & Maintenance
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
            Equipment Health & Repair Desk
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
            Diagnose reported faults, log repair milestones, track replacement costs, and authorize equipment return to active service.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Active Work Orders"
          value={activeTickets.length}
          subtitle="Tickets requiring inspection or repair"
          icon={Wrench}
          color="amber"
        />
        <DashboardCard
          title="High/Critical Priority"
          value={criticalTickets.length}
          subtitle="Major unit blockages"
          icon={AlertTriangle}
          color="rose"
        />
        <DashboardCard
          title="Resolved Repairs"
          value={completedTickets.length}
          subtitle="Equipment restored to catalog"
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Work Orders Queue */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">
            Assigned Equipment Maintenance Queue
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            {activeTickets.length} active tickets
          </span>
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-xs text-slate-400">
            No maintenance work orders assigned. All campus equipment operational!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 p-3 rounded-2xl transition-colors"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
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

                  <p className="mt-1 text-xs text-slate-500 font-medium">
                    Equipment:{' '}
                    <span className="text-slate-800 font-semibold">
                      {t.equipment?.name} ({t.equipment?.equipmentCode})
                    </span>{' '}
                    • Lab: {t.equipment?.laboratory?.name || 'Lab'} (
                    {t.equipment?.laboratory?.location || 'Campus'})
                  </p>

                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {t.description}
                  </p>

                  {t.resolutionNotes && (
                    <p className="mt-1 text-xs text-emerald-700 bg-emerald-50/80 px-2 py-1 rounded-md">
                      <strong>Resolution:</strong> {t.resolutionNotes}
                    </p>
                  )}
                </div>

                <div className="flex items-center space-x-2 self-start sm:self-center">
                  <button
                    onClick={() => setSelectedTicket(t)}
                    className="px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1 shadow-2xs"
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Update Status</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Technician Update Modal */}
      {selectedTicket && (
        <MaintenanceModal
          maintenanceRecord={selectedTicket}
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onSubmit={handleUpdateTicket}
          isTechnicianMode={true}
        />
      )}
    </AppLayout>
  );
};

export default TechnicianDashboard;

