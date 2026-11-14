import api from './api';

export const equipmentService = {
  getAll: async (params) => {
    return await api.get('/equipment', params);
  },

  getById: async (id) => {
    return await api.get(`/equipment/${id}`);
  },

  create: async (data) => {
    return await api.post('/equipment', data);
  },

  update: async (id, data) => {
    return await api.put(`/equipment/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/equipment/${id}`);
  },
};

export default equipmentService;

