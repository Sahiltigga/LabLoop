import api from './api';

export const recommendationService = {
  getIdleEquipment: async () => {
    return await api.get('/recommendations/idle-equipment');
  },

  getEquipmentMatches: async (params) => {
    return await api.get('/recommendations/equipment-matches', params);
  },

  getDemandAnalysis: async () => {
    return await api.get('/recommendations/demand-analysis');
  },
};

export default recommendationService;

