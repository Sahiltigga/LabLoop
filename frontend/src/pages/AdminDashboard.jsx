import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import StatusBadge from '../components/StatusBadge';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import analyticsService from '../services/analyticsService';
import recommendationService from '../services/recommendationService';
import {
  Cpu,
  CalendarCheck,
  Wrench,
  AlertOctagon,
  Sparkles,
  Building2,
  Users,
  TrendingUp,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMaintenance, setRecentMaintenance] = useState([]);
  const [idleRecommendations, setIdleRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [dashRes, recRes] = await Promise.all([
        analyticsService.getDashboard(),
        recommendationService.getIdleEquipment(),
      ]);

      setStats(dashRes.stats);
      setRecentBookings(dashRes.recentBookings || []);
      setRecentMaintenance(dashRes.recentMaintenance || []);
      setIdleRecommendations(recRes.recommendations?.slice(0, 3) || []);
    } catch (err) {
      setError(err.message || 'Failed to load administrator dashboard data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <AppLayout pageTitle="Institution Administration">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Aggregating institutional laboratory statistics..." size="large" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout pageTitle="Super Admin Dashboard">
      {error && <ErrorMessage message={error} onRetry={fetchDashboardData} />}

      {/* Top Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-300 border border-primary-500/30 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Campus Resource Intelligence Active</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Institutional Laboratory Overview
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Monitoring cross-department resource utilization, scheduled reservations, equipment downtime, and inter-department sharing opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5">
            <Link
              to="/recommendations"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Intelligence Engine</span>
            </Link>
            <Link
              to="/equipment"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        <DashboardCard
          title="Total Equipment"
          value={stats?.totalEquipment || 0}
          subtitle={`${stats?.availableEquipment || 0} currently usable`}
          icon={Cpu}
          color="blue"
        />
        <DashboardCard
          title="Active Bookings"
          value={stats?.activeBookings || 0}
          subtitle={`${stats?.pendingBookings || 0} pending review`}
          icon={CalendarCheck}
          color="emerald"
        />
        <DashboardCard
          title="Equipment in Service"
          value={stats?.underMaintenanceEquipment || 0}
          subtitle="Under repair / maintenance"
          icon={Wrench}
          color="rose"
        />
        <DashboardCard
          title="Avg Utilization Rate"
          value={`${stats?.overallUtilizationRate || 0}%`}
          subtitle={`${stats?.underutilizedCount || 0} underutilized assets`}
          icon={TrendingUp}
          color="amber"
        />
      </div>

      {/* Secondary Metrics & Sharing Opportunities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* LabLoop Resource Intelligence Alerts */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-primary-50 text-primary-600">
                <Sparkles className="w-4 h-4" />
              </div>
              <h3 className="font-bold text-slate-900 text-base">
                LabLoop Intelligence Sharing Alerts
              </h3>
            </div>
            <Link
              to="/recommendations"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
            >
              <span>View All Recommendations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {idleRecommendations.map((rec) => (
              <div
                key={rec.equipmentId}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-900 text-sm">
                      {rec.equipmentName}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      ({rec.equipmentCode})
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                      {rec.utilizationRate}% Utilized
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                    {rec.explanation}
                  </p>
                </div>
                <Link
                  to="/recommendations"
                  className="px-3 py-1.5 bg-white hover:bg-primary-50 border border-slate-200 text-primary-700 rounded-xl text-xs font-semibold whitespace-nowrap shadow-2xs transition-colors self-start sm:self-auto"
                >
                  Optimize Asset
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Institutional Statistics */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-base mb-4">
              Institution Overview
            </h3>
            <div className="space-y-3.5 text-xs">
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-2">
                  <Building2 className="w-4 h-4 text-slate-400" />
                  <span>Academic Departments:</span>
                </span>
                <span className="font-bold text-slate-900">{stats?.totalDepartments || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-2">
                  <Users className="w-4 h-4 text-slate-400" />
                  <span>Registered Users:</span>
                </span>
                <span className="font-bold text-slate-900">{stats?.totalUsers || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 flex items-center space-x-2">
                  <CalendarCheck className="w-4 h-4 text-slate-400" />
                  <span>Total Reservations:</span>
                </span>
                <span className="font-bold text-slate-900">{stats?.totalBookings || 0}</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-slate-500 flex items-center space-x-2">
                  <AlertOctagon className="w-4 h-4 text-slate-400" />
                  <span>Completed Sessions:</span>
                </span>
                <span className="font-bold text-emerald-600">{stats?.completedBookings || 0}</span>
              </div>
            </div>
          </div>

          <Link
            to="/analytics"
            className="mt-6 w-full py-2.5 px-4 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-xl text-xs font-semibold text-center block transition-colors"
          >
            Open Comprehensive Analytics
          </Link>
        </div>
      </div>

      {/* Recent Bookings and Maintenance Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Recent Reservation Requests
            </h3>
            <Link
              to="/bookings"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentBookings.length === 0 ? (
              <p className="text-slate-400 py-4">No recent bookings recorded.</p>
            ) : (
              recentBookings.map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-slate-800">
                      {b.equipment?.name || 'Equipment'}
                    </h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reserved by <span className="text-slate-600 font-medium">{b.user?.name}</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={b.status} />
                    <p className="text-[10px] text-slate-400 mt-1">
                      {new Date(b.startTime).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Maintenance Tickets */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900 text-base">
              Active Maintenance Work Orders
            </h3>
            <Link
              to="/maintenance"
              className="text-xs font-semibold text-primary-600 hover:text-primary-700"
            >
              View All
            </Link>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {recentMaintenance.length === 0 ? (
              <p className="text-slate-400 py-4">No active maintenance work orders.</p>
            ) : (
              recentMaintenance.map((m) => (
                <div key={m._id} className="py-3 flex items-center justify-between gap-3">
                  <div>
                    <h5 className="font-semibold text-slate-800">{m.issue}</h5>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Asset:{' '}
                      <span className="text-slate-600 font-medium">
                        {m.equipment?.name} ({m.equipment?.equipmentCode})
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <StatusBadge status={m.status} />
                    <p className="text-[10px] text-slate-400 mt-1 font-mono">
                      Priority: {m.priority}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminDashboard;

