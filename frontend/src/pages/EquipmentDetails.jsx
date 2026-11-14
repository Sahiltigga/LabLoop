import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import StatusBadge from '../components/StatusBadge';
import BookingForm from '../components/BookingForm';
import MaintenanceModal from '../components/MaintenanceModal';
import EquipmentModal from '../components/EquipmentModal';
import ConfirmationModal from '../components/ConfirmationModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import equipmentService from '../services/equipmentService';
import bookingService from '../services/bookingService';
import maintenanceService from '../services/maintenanceService';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Building,
  MapPin,
  Calendar,
  Wrench,
  ShieldAlert,
  Clock,
  User,
  CheckCircle,
  Trash2,
  Edit,
  Tag,
  Hash,
} from 'lucide-react';

export const EquipmentDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [equipment, setEquipment] = useState(null);
  const [upcomingBookings, setUpcomingBookings] = useState([]);
  const [maintenanceHistory, setMaintenanceHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [isFaultOpen, setIsFaultOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await equipmentService.getById(id);
      setEquipment(res.equipment);
      setUpcomingBookings(res.upcomingBookings || []);
      setMaintenanceHistory(res.maintenanceHistory || []);
    } catch (err) {
      setError(err.message || 'Failed to load equipment specifications.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.create(bookingData);
      showToast('Booking request submitted successfully! Awaiting faculty review.');
      fetchDetails();
    } catch (err) {
      throw err;
    }
  };

  const handleFaultSubmit = async (faultData) => {
    try {
      await maintenanceService.create(faultData);
      showToast('Fault report logged! Equipment flagged for inspection.');
      fetchDetails();
    } catch (err) {
      throw err;
    }
  };

  const handleEditSubmit = async (data) => {
    try {
      await equipmentService.update(equipment._id, data);
      showToast('Equipment updated successfully.');
      fetchDetails();
    } catch (err) {
      throw err;
    }
  };

  const handleDelete = async () => {
    try {
      await equipmentService.delete(equipment._id);
      navigate('/equipment', { replace: true });
    } catch (err) {
      setError(err.message || 'Failed to delete equipment.');
      setIsDeleteOpen(false);
    }
  };

  if (loading) {
    return (
      <AppLayout pageTitle="Equipment Specifications">
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Retrieving laboratory instrumentation data..." size="large" />
        </div>
      </AppLayout>
    );
  }

  if (error || !equipment) {
    return (
      <AppLayout pageTitle="Equipment Not Found">
        <ErrorMessage
          message={error || 'Equipment record not found.'}
          onRetry={fetchDetails}
        />
        <Link
          to="/equipment"
          className="mt-4 inline-flex items-center space-x-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Equipment Catalog</span>
        </Link>
      </AppLayout>
    );
  }

  const isUsable =
    ['Available', 'Partially Available'].includes(equipment.status) &&
    equipment.availableQuantity > 0;

  const canEdit = ['admin', 'faculty'].includes(user?.role);
  const canDelete = user?.role === 'admin';

  return (
    <AppLayout pageTitle={equipment.name}>
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back Link */}
      <div className="mb-4">
        <Link
          to="/equipment"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Equipment Catalog</span>
        </Link>
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-2xs mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-700">
                {equipment.category}
              </span>
              <StatusBadge status={equipment.status} />
              <StatusBadge status={equipment.condition} />
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {equipment.name}
            </h1>
            <p className="text-xs font-mono text-slate-400 mt-1">
              Code: {equipment.equipmentCode} • Model: {equipment.modelNumber || 'N/A'} • Manufacturer: {equipment.manufacturer || 'Standard'}
            </p>

            <p className="mt-4 text-sm text-slate-600 leading-relaxed max-w-3xl">
              {equipment.description}
            </p>

            {equipment.requiresTraining && (
              <div className="mt-4 inline-flex items-center space-x-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>
                  <strong>Training Required:</strong> Users must complete departmental lab safety induction before operating this equipment.
                </span>
              </div>
            )}
          </div>

          {/* Action buttons box */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[200px]">
            <button
              onClick={() => setIsBookingOpen(true)}
              disabled={!isUsable}
              className={`w-full py-2.5 px-4 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 shadow-2xs transition-all ${
                isUsable
                  ? 'bg-primary-600 hover:bg-primary-700 text-white'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Reserve Equipment</span>
            </button>

            <button
              onClick={() => setIsFaultOpen(true)}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 rounded-xl text-xs font-semibold flex items-center justify-center space-x-2 transition-all"
            >
              <Wrench className="w-4 h-4" />
              <span>Report Malfunction</span>
            </button>

            {canEdit && (
              <button
                onClick={() => setIsEditOpen(true)}
                className="w-full py-2 px-4 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Edit className="w-3.5 h-3.5" />
                <span>Edit Specs</span>
              </button>
            )}

            {canDelete && (
              <button
                onClick={() => setIsDeleteOpen(true)}
                className="w-full py-2 px-4 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 text-rose-600 rounded-xl text-xs font-medium flex items-center justify-center space-x-2 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Asset</span>
              </button>
            )}
          </div>
        </div>

        {/* Specifications Grid */}
        <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-slate-400 block font-medium">Available Quantity</span>
            <span className="text-lg font-bold text-slate-900 mt-0.5 block">
              <span className={equipment.availableQuantity > 0 ? 'text-emerald-600' : 'text-slate-400'}>
                {equipment.availableQuantity}
              </span>{' '}
              / {equipment.quantity}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-slate-400 block font-medium">Department</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
              {equipment.department?.name}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-slate-400 block font-medium">Laboratory Room</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block truncate">
              {equipment.laboratory?.name}
            </span>
            <span className="text-[11px] text-slate-500 block truncate">
              {equipment.laboratory?.location}
            </span>
          </div>

          <div className="bg-slate-50 p-3.5 rounded-2xl">
            <span className="text-slate-400 block font-medium">Max Session Duration</span>
            <span className="text-sm font-bold text-slate-900 mt-1 block">
              {equipment.maxBookingHours || 4} hours per booking
            </span>
          </div>
        </div>

        {/* Additional Technical Specs */}
        {equipment.specifications && (
          <div className="mt-6 p-4 rounded-2xl bg-blue-50/40 border border-blue-100/60 text-xs">
            <h4 className="font-semibold text-slate-800 uppercase tracking-wider text-[11px] mb-1">
              Technical Specifications
            </h4>
            <p className="text-slate-600 leading-relaxed font-mono">
              {equipment.specifications}
            </p>
          </div>
        )}
      </div>

      {/* Schedules and Maintenance Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Active Bookings */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center space-x-2 mb-4">
            <Clock className="w-5 h-5 text-primary-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Upcoming Reservation Schedule ({upcomingBookings.length})
            </h3>
          </div>

          {upcomingBookings.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No active reservations currently scheduled. Equipment is open for bookings!
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {upcomingBookings.map((b) => (
                <div key={b._id} className="py-3 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-slate-800">
                      {new Date(b.startTime).toLocaleDateString()}
                    </span>
                    <p className="text-slate-400 text-[11px] mt-0.5">
                      {new Date(b.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                      {new Date(b.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Reserved by: <span className="font-medium text-slate-700">{b.user?.name}</span> ({b.requestedQuantity} unit)
                    </p>
                  </div>
                  <StatusBadge status={b.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Maintenance History */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-2xs">
          <div className="flex items-center space-x-2 mb-4">
            <Wrench className="w-5 h-5 text-amber-600" />
            <h3 className="font-bold text-slate-900 text-base">
              Maintenance & Calibration History ({maintenanceHistory.length})
            </h3>
          </div>

          {maintenanceHistory.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No recorded maintenance incidents. Hardware in good health.
            </p>
          ) : (
            <div className="divide-y divide-slate-100 text-xs">
              {maintenanceHistory.map((m) => (
                <div key={m._id} className="py-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-800">{m.issue}</span>
                    <StatusBadge status={m.status} />
                  </div>
                  <p className="text-slate-500 text-[11px] mt-1">{m.description}</p>
                  {m.resolutionNotes && (
                    <p className="text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md text-[11px] mt-1 font-medium">
                      Resolved: {m.resolutionNotes}
                    </p>
                  )}
                  <p className="text-slate-400 text-[10px] mt-1">
                    Reported on: {new Date(m.reportedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Booking Form Modal */}
      {isBookingOpen && (
        <BookingForm
          equipment={equipment}
          isOpen={isBookingOpen}
          onClose={() => setIsBookingOpen(false)}
          onSuccess={handleBookingSubmit}
        />
      )}

      {/* Fault Reporting Modal */}
      {isFaultOpen && (
        <MaintenanceModal
          equipment={equipment}
          isOpen={isFaultOpen}
          onClose={() => setIsFaultOpen(false)}
          onSubmit={handleFaultSubmit}
        />
      )}

      {/* Edit Equipment Modal */}
      {isEditOpen && (
        <EquipmentModal
          equipment={equipment}
          isOpen={isEditOpen}
          onClose={() => setIsEditOpen(false)}
          onSubmit={handleEditSubmit}
        />
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteOpen}
        title="Delete Equipment Record"
        message={`Are you sure you want to permanently remove "${equipment.name}" (${equipment.equipmentCode}) from the catalog?`}
        confirmText="Delete Equipment"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => setIsDeleteOpen(false)}
      />
    </AppLayout>
  );
};

export default EquipmentDetails;

