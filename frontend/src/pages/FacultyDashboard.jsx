import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import equipmentService from '../services/equipmentService';
import recommendationService from '../services/recommendationService';
import {
  Cpu,
  CalendarCheck,
  CheckCircle,
  XCircle,
  PlusCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export const FacultyDashboard = () => {
  const { user } = useAuth();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [departmentEquipment, setDepartmentEquipment] = useState([]);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  const fetchFacultyData = async () => {
    try {
      setLoading(true);
      setError(null);

      const deptId = user?.department?._id || user?.department;

      const [bookingsRes, eqRes, matchRes] = await Promise.all([
        bookingService.getAll({
          status: 'Pending',
          department: deptId,
        }),
        equipmentService.getAll({
          department: deptId,
          limit: 10,
        }),
        recommendationService.getEquipmentMatches({
          departmentId: deptId,
        }),
      ]);

      setPendingBookings(bookingsRes.bookings || []);
      setDepartmentEquipment(eqRes.equipment || []);
      setMatches(matchRes.matches?.slice(0, 3) || []);
    } catch (err) {
      setError(err.message || 'Failed to load faculty dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacultyData();
  }, [user]);

  const handleApprove = async (id) => {
    try {
      await bookingService.updateStatus(id, 'Approved');
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
      setActionSuccess('Booking approved successfully!');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to approve booking.');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please enter a rejection reason:') || 'Unavailable or scheduling conflict';
    try {
      await bookingService.updateStatus(id, 'Rejected', reason);
      setPendingBookings((prev) => prev.filter((b) => b._id !== id));
      setActionSuccess('Booking request rejected.');
      setTimeout(() => setActionSuccess(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reject booking.');
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Faculty Portal">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading department laboratory management..." size="large" />
        </div>
      </AppLayout>
    );
  }

  const availableEqCount = departmentEquipment.filter(
    (e) => e.status === 'Available' || e.status === 'Partially Available'
  ).length;

  return (
    <AppLayout pageTitle="Faculty / Lab Manager Dashboard">
      {error && <ErrorMessage message={error} onRetry={fetchFacultyData} />}
      {actionSuccess && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/20 px-2.5 py-1 rounded-full border border-primary-500/30">
              Department Lab Manager
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
              {user?.department?.name || 'Department'} Laboratory Control
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Authorize student booking requests, oversee laboratory inventory, and discover cross-department resources.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/equipment"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Manage Equipment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Pending Approval Queue"
          value={pendingBookings.length}
          subtitle="Requests awaiting your review"
          icon={CalendarCheck}
          color="amber"
        />
        <DashboardCard
          title="Department Equipment"
          value={departmentEquipment.length}
          subtitle={`${availableEqCount} currently available`}
          icon={Cpu}
          color="blue"
        />
        <DashboardCard
          title="Sharing Opportunities"
          value={matches.length}
          subtitle="Compatible equipment in other depts"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Pending Bookings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-slate-900 text-base">
              Pending Student Booking Requests ({pendingBookings.length})
            </h3>
          </div>
          <Link
            to="/bookings"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            All Bookings
          </Link>
        </div>

        {pendingBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">All caught up!</h4>
            <p className="text-xs text-slate-400 mt-1">
              No pending equipment booking requests currently require review in your department.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingBookings.map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                currentUserRole="faculty"
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        )}
      </div>

      {/* Resource Sharing Suggestions */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-primary-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Recommended Equipment Sharing from Other Departments
            </h3>
          </div>
          <Link
            to="/recommendations"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>Explore Matching Engine</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {matches.map((m) => (
            <div
              key={m.equipment._id}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-slate-500">
                    {m.equipment.department?.name}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    {m.score}% Match
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 text-sm mt-1">
                  {m.equipment.name}
                </h4>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {m.explanation}
                </p>
              </div>

              <Link
                to={`/equipment/${m.equipment._id}`}
                className="mt-3 text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
              >
                <span>View Specs</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
};

export default FacultyDashboard;

