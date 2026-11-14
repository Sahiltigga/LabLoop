import api from './api';

export const departmentService = {
  getAll: async () => {
    return await api.get('/departments');
  },

  getById: async (id) => {
    return await api.get(`/departments/${id}`);
  },

  create: async (data) => {
    return await api.post('/departments', data);
  },

  update: async (id, data) => {
    return await api.put(`/departments/${id}`, data);
  },

  delete: async (id) => {
    return await api.delete(`/departments/${id}`);
  },

  getLaboratories: async (params) => {
    return await api.get('/laboratories', params);
  },

  createLaboratory: async (data) => {
    return await api.post('/laboratories', data);
  },
};

export default departmentService;

