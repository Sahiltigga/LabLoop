import api from './api';

export const bookingService = {
  getAll: async (params) => {
    return await api.get('/bookings', params);
  },

  getById: async (id) => {
    return await api.get(`/bookings/${id}`);
  },

  create: async (bookingData) => {
    return await api.post('/bookings', bookingData);
  },

  updateStatus: async (id, status, rejectionReason) => {
    return await api.patch(`/bookings/${id}/status`, { status, rejectionReason });
  },

  checkIn: async (id) => {
    return await api.post(`/bookings/${id}/check-in`);
  },

  checkOut: async (id, remarks) => {
    return await api.post(`/bookings/${id}/check-out`, { remarks });
  },

  cancel: async (id) => {
    return await api.patch(`/bookings/${id}/cancel`);
  },
};

export default bookingService;

