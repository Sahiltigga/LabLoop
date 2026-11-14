import React, { useState, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import BookingCard from '../components/BookingCard';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useBookings from '../hooks/useBookings';
import { useAuth } from '../context/AuthContext';
import {
  CalendarCheck,
  CheckCircle,
  Clock,
  Filter,
  Check,
  X,
  RefreshCw,
} from 'lucide-react';

export const Bookings = () => {
  const { user } = useAuth();
  const {
    bookings,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    stats,
    refetch,
    approveBooking,
    rejectBooking,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
  } = useBookings();

  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApprove = async (id) => {
    try {
      await approveBooking(id);
      showToast('Booking approved successfully!');
    } catch (err) {
      showToast(`Approval failed: ${err.message}`);
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Please provide reason for rejection:') || 'Scheduling conflict';
    try {
      await rejectBooking(id, reason);
      showToast('Booking request rejected.');
    } catch (err) {
      showToast(`Rejection failed: ${err.message}`);
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await checkInBooking(id);
      showToast('Equipment checked out for session!');
    } catch (err) {
      showToast(`Check-in failed: ${err.message}`);
    }
  };

  const handleCheckOut = async (id) => {
    const remarks = prompt('Session completion remarks (optional):') || '';
    try {
      await checkOutBooking(id, remarks);
      showToast('Equipment returned successfully! Usage hours recorded.');
    } catch (err) {
      showToast(`Check-out failed: ${err.message}`);
    }
  };

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
    try {
      await cancelBooking(id);
      showToast('Reservation cancelled.');
    } catch (err) {
      showToast(`Cancellation failed: ${err.message}`);
    }
  };

  const statusTabs = useMemo(() => [
    { label: 'All Bookings', value: 'All', count: stats.total },
    { label: 'Pending Review', value: 'Pending', count: stats.pending },
    { label: 'Approved', value: 'Approved', count: stats.approved },
    { label: 'Checked-Out', value: 'Checked-Out', count: stats.checkedOut },
    { label: 'Completed', value: 'Completed', count: stats.completed },
    { label: 'Cancelled', value: 'Cancelled', count: stats.cancelled },
  ], [stats]);

  return (
    <AppLayout pageTitle="Equipment Reservations">
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
            Reservation & Usage Management
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {user?.role === 'student'
              ? 'Track personal booking approvals, scheduled sessions, and check-in status.'
              : 'Review inter-department reservation requests, verify availability conflicts, and record equipment returns.'}
          </p>
        </div>

        <button
          onClick={refetch}
          className="p-2 text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium flex items-center space-x-1.5 self-start sm:self-auto shadow-2xs transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Filter Tabs */}
      <div className="flex items-center space-x-1 overflow-x-auto pb-2 mb-6 border-b border-slate-200/80">
        {statusTabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setStatusFilter(tab.value)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all flex items-center space-x-2 ${
              statusFilter === tab.value
                ? 'bg-primary-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                statusFilter === tab.value
                  ? 'bg-white/20 text-white'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Retrieving laboratory reservations..." size="large" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <CalendarCheck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No bookings found
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            There are currently no reservation records matching the "{statusFilter}" status filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bookings.map((booking) => (
            <BookingCard
              key={booking._id}
              booking={booking}
              currentUserRole={user?.role}
              onApprove={handleApprove}
              onReject={handleReject}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
              onCancel={handleCancel}
            />
          ))}
        </div>
      )}
    </AppLayout>
  );
};

export default Bookings;

