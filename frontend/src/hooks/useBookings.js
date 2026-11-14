import { useState, useEffect, useCallback, useMemo } from 'react';
import bookingService from '../services/bookingService';

export const useBookings = (initialParams = {}) => {
  const [allBookings, setAllBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState(initialParams?.status || 'All');

  // Serialize to string so object reference changes on each render don't trigger re-fetching
  const serializedParams = useMemo(() => JSON.stringify(initialParams || {}), [initialParams]);

  const fetchBookings = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const parsedParams = JSON.parse(serializedParams);
      // Remove status from server query so we fetch all relevant bookings
      // and keep client-side tab counts accurate and responsive without buffering
      const { status, ...restParams } = parsedParams;
      const res = await bookingService.getAll(restParams);
      setAllBookings(res.bookings || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch bookings.');
    } finally {
      setLoading(false);
    }
  }, [serializedParams]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const approveBooking = async (id) => {
    const res = await bookingService.updateStatus(id, 'Approved');
    setAllBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...res.booking } : b))
    );
    return res;
  };

  const rejectBooking = async (id, reason) => {
    const res = await bookingService.updateStatus(id, 'Rejected', reason);
    setAllBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...res.booking } : b))
    );
    return res;
  };

  const checkInBooking = async (id) => {
    const res = await bookingService.checkIn(id);
    setAllBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...res.booking } : b))
    );
    return res;
  };

  const checkOutBooking = async (id, remarks) => {
    const res = await bookingService.checkOut(id, remarks);
    setAllBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...res.booking } : b))
    );
    return res;
  };

  const cancelBooking = async (id) => {
    const res = await bookingService.cancel(id);
    setAllBookings((prev) =>
      prev.map((b) => (b._id === id ? { ...b, ...res.booking } : b))
    );
    return res;
  };

  // Grouped stats memoized across all bookings
  const stats = useMemo(() => {
    return {
      total: allBookings.length,
      pending: allBookings.filter((b) => b.status === 'Pending').length,
      approved: allBookings.filter((b) => b.status === 'Approved').length,
      checkedOut: allBookings.filter((b) => b.status === 'Checked-Out').length,
      completed: allBookings.filter((b) => b.status === 'Completed').length,
      cancelled: allBookings.filter((b) => b.status === 'Cancelled').length,
    };
  }, [allBookings]);

  // Client-side filtered list based on the active tab
  const bookings = useMemo(() => {
    if (statusFilter === 'All') return allBookings;
    return allBookings.filter((b) => b.status === statusFilter);
  }, [allBookings, statusFilter]);

  return {
    bookings,
    allBookings,
    loading,
    error,
    statusFilter,
    setStatusFilter,
    stats,
    refetch: fetchBookings,
    approveBooking,
    rejectBooking,
    checkInBooking,
    checkOutBooking,
    cancelBooking,
  };
};

export default useBookings;

