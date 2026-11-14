import React, { useState, useEffect } from 'react';
import AppLayout from '../components/AppLayout';
import EquipmentCard from '../components/EquipmentCard';
import EquipmentTable from '../components/EquipmentTable';
import SearchBar from '../components/SearchBar';
import BookingForm from '../components/BookingForm';
import EquipmentModal from '../components/EquipmentModal';
import MaintenanceModal from '../components/MaintenanceModal';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import useEquipment from '../hooks/useEquipment';
import departmentService from '../services/departmentService';
import equipmentService from '../services/equipmentService';
import bookingService from '../services/bookingService';
import maintenanceService from '../services/maintenanceService';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  LayoutGrid,
  List,
  Filter,
  CheckCircle,
  Cpu,
  RefreshCw,
} from 'lucide-react';

export const Equipment = () => {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [departments, setDepartments] = useState([]);
  const [laboratories, setLaboratories] = useState([]);

  // Modals state
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [selectedEquipmentForBooking, setSelectedEquipmentForBooking] = useState(null);

  const [isEquipmentModalOpen, setIsEquipmentModalOpen] = useState(false);
  const [selectedEquipmentForEdit, setSelectedEquipmentForEdit] = useState(null);

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState(false);
  const [selectedEquipmentForMaintenance, setSelectedEquipmentForMaintenance] = useState(null);

  const [toastMessage, setToastMessage] = useState(null);

  const {
    equipment,
    categories,
    loading,
    error,
    total,
    filters,
    availableCount,
    updateFilter,
    resetFilters,
    refetch,
  } = useEquipment();

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        const [deptRes, labRes] = await Promise.all([
          departmentService.getAll(),
          departmentService.getLaboratories(),
        ]);
        setDepartments(deptRes.departments || []);
        setLaboratories(labRes.laboratories || []);
      } catch (err) {
        console.warn('Could not fetch departments for filters:', err);
      }
    };
    loadDepartments();
  }, []);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Handlers
  const handleOpenBooking = (eq) => {
    setSelectedEquipmentForBooking(eq);
    setIsBookingModalOpen(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      await bookingService.create(bookingData);
      showToast('Booking request submitted successfully! Awaiting faculty review.');
      refetch();
    } catch (err) {
      throw err;
    }
  };

  const handleOpenReportFault = (eq) => {
    setSelectedEquipmentForMaintenance(eq);
    setIsMaintenanceModalOpen(true);
  };

  const handleMaintenanceSubmit = async (maintData) => {
    try {
      await maintenanceService.create(maintData);
      showToast('Fault report logged! Equipment marked for inspection.');
      refetch();
    } catch (err) {
      throw err;
    }
  };

  const handleSaveEquipment = async (data) => {
    try {
      if (selectedEquipmentForEdit) {
        await equipmentService.update(selectedEquipmentForEdit._id, data);
        showToast('Equipment updated successfully.');
      } else {
        await equipmentService.create(data);
        showToast('New equipment registered successfully.');
      }
      setSelectedEquipmentForEdit(null);
      refetch();
    } catch (err) {
      throw err;
    }
  };

  const canAddEquipment = ['admin', 'faculty'].includes(user?.role);

  return (
    <AppLayout pageTitle="Equipment Catalog">
      {toastMessage && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Institutional Laboratory Catalog
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Discover, reserve, and share scientific apparatus, computing kits, and machinery across all campus departments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Grid / Table View Toggle */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center space-x-1 border border-slate-200">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Table View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          {/* Add Equipment (Admin/Faculty) */}
          {canAddEquipment && (
            <button
              onClick={() => {
                setSelectedEquipmentForEdit(null);
                setIsEquipmentModalOpen(true);
              }}
              className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-semibold shadow-2xs hover:shadow-xs transition-all flex items-center space-x-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Register Equipment</span>
            </button>
          )}
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs mb-6 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search */}
          <div className="md:col-span-5">
            <SearchBar
              value={filters.search}
              onChange={(val) => updateFilter('search', val)}
              onClear={() => updateFilter('search', '')}
              placeholder="Search by name, code, model, or keywords..."
            />
          </div>

          {/* Department Filter */}
          <div className="md:col-span-3">
            <select
              value={filters.department}
              onChange={(e) => updateFilter('department', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700 font-medium"
            >
              <option value="All">All Academic Departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.category}
              onChange={(e) => updateFilter('category', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700 font-medium"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="md:col-span-2">
            <select
              value={filters.status}
              onChange={(e) => updateFilter('status', e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Partially Available">Partially Available</option>
              <option value="Under Maintenance">Under Maintenance</option>
              <option value="Unavailable">Unavailable</option>
            </select>
          </div>
        </div>

        {/* Results Count & Reset Filter */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
          <span>
            Showing <strong className="text-slate-800">{equipment.length}</strong> of{' '}
            <strong className="text-slate-800">{total}</strong> equipment records (
            <span className="text-emerald-600 font-semibold">{availableCount}</span> ready for
            booking)
          </span>

          <button
            onClick={resetFilters}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium flex items-center space-x-1"
          >
            <RefreshCw className="w-3 h-3" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>

      {/* Main Content (Loading, Error, Grid, or Table) */}
      {error && <ErrorMessage message={error} onRetry={refetch} />}

      {loading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner message="Searching equipment inventory..." size="large" />
        </div>
      ) : equipment.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center">
          <Cpu className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">
            No equipment found
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search keywords, clearing departmental filters, or check the Intelligence Engine for cross-department matches.
          </p>
          <button
            onClick={resetFilters}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            Clear All Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {equipment.map((item) => (
            <EquipmentCard
              key={item._id}
              equipment={item}
              onBook={handleOpenBooking}
              onReportFault={handleOpenReportFault}
            />
          ))}
        </div>
      ) : (
        <EquipmentTable
          equipment={equipment}
          onBook={handleOpenBooking}
          onReportFault={handleOpenReportFault}
        />
      )}

      {/* Booking Form Modal */}
      {isBookingModalOpen && selectedEquipmentForBooking && (
        <BookingForm
          equipment={selectedEquipmentForBooking}
          isOpen={isBookingModalOpen}
          onClose={() => {
            setIsBookingModalOpen(false);
            setSelectedEquipmentForBooking(null);
          }}
          onSuccess={handleBookingSubmit}
        />
      )}

      {/* Register / Edit Equipment Modal */}
      {isEquipmentModalOpen && (
        <EquipmentModal
          equipment={selectedEquipmentForEdit}
          departments={departments}
          laboratories={laboratories}
          isOpen={isEquipmentModalOpen}
          onClose={() => {
            setIsEquipmentModalOpen(false);
            setSelectedEquipmentForEdit(null);
          }}
          onSubmit={handleSaveEquipment}
        />
      )}

      {/* Maintenance / Fault Reporting Modal */}
      {isMaintenanceModalOpen && selectedEquipmentForMaintenance && (
        <MaintenanceModal
          equipment={selectedEquipmentForMaintenance}
          isOpen={isMaintenanceModalOpen}
          onClose={() => {
            setIsMaintenanceModalOpen(false);
            setSelectedEquipmentForMaintenance(null);
          }}
          onSubmit={handleMaintenanceSubmit}
        />
      )}
    </AppLayout>
  );
};

export default Equipment;

