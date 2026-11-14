import api from './api';

export const authService = {
  login: async (email, password) => {
    const data = await api.post('/auth/login', { email, password });
    if (data.token) {
      localStorage.setItem('labloop_token', data.token);
      localStorage.setItem('labloop_user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (userData) => {
    const data = await api.post('/auth/register', userData);
    if (data.token) {
      localStorage.setItem('labloop_token', data.token);
      localStorage.setItem('labloop_user', JSON.stringify(data.user));
    }
    return data;
  },

  getMe: async () => {
    return await api.get('/auth/me');
  },

  updateProfile: async (profileData) => {
    const data = await api.put('/auth/profile', profileData);
    if (data.user) {
      localStorage.setItem('labloop_user', JSON.stringify(data.user));
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('labloop_token');
    localStorage.removeItem('labloop_user');
  },

  getCurrentStoredUser: () => {
    const stored = localStorage.getItem('labloop_user');
    try {
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },
};

export default authService;

