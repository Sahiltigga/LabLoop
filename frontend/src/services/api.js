/**
 * LabLoop Native Fetch API Service
 * Standardized client for REST communication (Academic Checkpoint 04)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to build query parameter strings safely
 */
const buildQueryString = (params = {}) => {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      query.append(key, value);
    }
  });
  const queryString = query.toString();
  return queryString ? `?${queryString}` : '';
};

/**
 * Base fetch wrapper with JWT authentication header and standard error parsing
 */
const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('labloop_token');

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);

    let data;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = { message: await response.text() };
    }

    if (!response.ok) {
      const errorMessage =
        data?.message ||
        `Request failed with HTTP status ${response.status} (${response.statusText})`;
      const error = new Error(errorMessage);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      console.error('[Fetch API Network Error]: Server might be offline or CORS blocked.');
      throw new Error(
        'Unable to connect to LabLoop server. Please check your backend connection.'
      );
    }
    throw error;
  }
};

export const api = {
  get: (endpoint, params) =>
    request(`${endpoint}${buildQueryString(params)}`, { method: 'GET' }),

  post: (endpoint, body) =>
    request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    }),

  put: (endpoint, body) =>
    request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    }),

  patch: (endpoint, body) =>
    request(endpoint, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    }),

  delete: (endpoint) =>
    request(endpoint, {
      method: 'DELETE',
    }),
};

export default api;

