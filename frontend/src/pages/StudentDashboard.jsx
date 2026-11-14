import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import DashboardCard from '../components/DashboardCard';
import BookingCard from '../components/BookingCard';
import EquipmentCard from '../components/EquipmentCard';
import BookingForm from '../components/BookingForm';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import { useAuth } from '../context/AuthContext';
import bookingService from '../services/bookingService';
import equipmentService from '../services/equipmentService';
import {
  CalendarCheck,
  Cpu,
  Clock,
  Sparkles,
  CheckCircle,
  ArrowRight,
  BookOpen,
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [myBookings, setMyBookings] = useState([]);
  const [featuredEquipment, setFeaturedEquipment] = useState([]);
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [bookingsRes, eqRes] = await Promise.all([
        bookingService.getAll(),
        equipmentService.getAll({
          status: 'Available',
          limit: 4,
        }),
      ]);

      setMyBookings(bookingsRes.bookings || []);
      setFeaturedEquipment(eqRes.equipment || []);
    } catch (err) {
      setError(err.message || 'Failed to load student dashboard.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudentData();
  }, [user]);

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.create(bookingData);
      setSuccessMsg('Booking request submitted successfully! Awaiting faculty review.');
      fetchStudentData();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      throw err;
    }
  };

  const handleCancelBooking = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this booking reservation?')) return;
    try {
      await bookingService.cancel(id);
      setSuccessMsg('Booking cancelled successfully.');
      fetchStudentData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to cancel booking.');
    }
  };

  const handleCheckIn = async (id) => {
    try {
      await bookingService.checkIn(id);
      setSuccessMsg('Equipment session checked out! Usage timer started.');
      fetchStudentData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to check in equipment.');
    }
  };

  const handleCheckOut = async (id) => {
    const remarks = prompt('Any notes on session completion (e.g. Returned cleanly, tested OK):') || '';
    try {
      await bookingService.checkOut(id, remarks);
      setSuccessMsg('Equipment returned and checked out successfully!');
      fetchStudentData();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to return equipment.');
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Student Portal">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Loading your laboratory workstation..." size="large" />
        </div>
      </AppLayout>
    );
  }

  const activeReservations = myBookings.filter((b) =>
    ['Approved', 'Checked-Out'].includes(b.status)
  );

  const pendingReservations = myBookings.filter((b) => b.status === 'Pending');

  return (
    <AppLayout pageTitle="Student & Researcher Portal">
      {error && <ErrorMessage message={error} onRetry={fetchStudentData} />}
      {successMsg && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-md mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary-400 bg-primary-500/20 px-2.5 py-1 rounded-full border border-primary-500/30">
              Student / Research Scholar
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight mt-2">
              Welcome back, {user?.name}!
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-xl">
              Discover and reserve specialized instruments and computing hardware across all academic departments.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/equipment"
              className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-xl text-xs font-semibold shadow-xs flex items-center space-x-1.5 transition-all"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Browse Equipment</span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <DashboardCard
          title="Active Sessions"
          value={activeReservations.length}
          subtitle="Approved or currently checked out"
          icon={CalendarCheck}
          color="emerald"
        />
        <DashboardCard
          title="Pending Requests"
          value={pendingReservations.length}
          subtitle="Awaiting faculty authorization"
          icon={Clock}
          color="amber"
        />
        <DashboardCard
          title="Total Lifetime Bookings"
          value={myBookings.length}
          subtitle="Academic project usage history"
          icon={BookOpen}
          color="blue"
        />
      </div>

      {/* Current Active & Upcoming Bookings */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 text-base">
            My Current & Upcoming Reservations
          </h3>
          <Link
            to="/bookings"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700"
          >
            Full Booking History
          </Link>
        </div>

        {myBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
            <Cpu className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <h4 className="font-semibold text-slate-800 text-sm">
              No active reservations
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Explore the cross-department equipment catalog and reserve instruments for your capstone or lab sessions.
            </p>
            <Link
              to="/equipment"
              className="mt-4 inline-flex items-center space-x-1.5 px-4 py-2 bg-primary-600 text-white rounded-xl text-xs font-semibold hover:bg-primary-700 transition-colors"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>Explore Equipment</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myBookings.slice(0, 3).map((b) => (
              <BookingCard
                key={b._id}
                booking={b}
                currentUserRole="student"
                onCheckIn={handleCheckIn}
                onCheckOut={handleCheckOut}
                onCancel={handleCancelBooking}
              />
            ))}
          </div>
        )}
      </div>

      {/* Featured Available Equipment */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Available Inter-Department Equipment
            </h3>
            <p className="text-xs text-slate-500">
              High-availability assets ready for institutional reservation
            </p>
          </div>
          <Link
            to="/equipment"
            className="text-xs font-semibold text-primary-600 hover:text-primary-700 flex items-center space-x-1"
          >
            <span>View Full Catalog</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredEquipment.map((eq) => (
            <EquipmentCard
              key={eq._id}
              equipment={eq}
              onBook={(e) => setSelectedEquipmentForBooking(e)}
            />
          ))}
        </div>
      </div>

      {/* Booking Form Modal */}
      {selectedEquipmentForBooking && (
        <BookingForm
          equipment={selectedEquipmentForBooking}
          isOpen={!!selectedEquipmentForBooking}
          onClose={() => setSelectedEquipmentForBooking(null)}
          onSuccess={handleBookingSubmit}
        />
      )}
    </AppLayout>
  );
};

export default StudentDashboard;

