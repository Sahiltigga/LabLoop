import api from './api';

export const maintenanceService = {
  getAll: async (params) => {
    return await api.get('/maintenance', params);
  },

  getById: async (id) => {
    return await api.get(`/maintenance/${id}`);
  },

  create: async (data) => {
    return await api.post('/maintenance', data);
  },

  updateStatus: async (id, data) => {
    return await api.patch(`/maintenance/${id}`, data);
  },
};

export default maintenanceService;

