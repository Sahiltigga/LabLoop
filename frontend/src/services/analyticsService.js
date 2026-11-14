import api from './api';

export const analyticsService = {
  getDashboard: async (departmentId) => {
    return await api.get('/analytics/dashboard', { departmentId });
  },

  getUtilization: async (days = 30) => {
    return await api.get('/analytics/utilization', { days });
  },

  getDepartmentComparison: async () => {
    return await api.get('/analytics/department');
  },

  getUsageHistory: async () => {
    return await api.get('/analytics/usage-history');
  },
};

export default analyticsService;

