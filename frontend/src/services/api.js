import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to ensure Authorization header is set
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - clear it
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Trade API
export const tradeAPI = {
  getAll: (params) => axiosInstance.get('/trades', { params }),
  getById: (id) => axiosInstance.get(`/trades/${id}`),
  create: (tradeData) => axiosInstance.post('/trades', tradeData),
  update: (id, tradeData) => axiosInstance.put(`/trades/${id}`, tradeData),
  delete: (id) => axiosInstance.delete(`/trades/${id}`),
  batchDelete: (tradeIds) => axiosInstance.delete('/trades/batch/delete', { data: { tradeIds } })
};

// Analytics API
export const analyticsAPI = {
  getSummary: () => axiosInstance.get('/analytics/summary'),
  getAIReview: (period) => axiosInstance.get('/analytics/ai-review', { params: { period } }),
  export: () => axiosInstance.get('/analytics/export', { responseType: 'blob' }),
  getTrends: () => axiosInstance.get('/analytics/trends')
};

// Auth API  
export const authAPI = {
  login: (email, password) => axiosInstance.post('/auth/login', { email, password }),
  register: (name, email, password) => axiosInstance.post('/auth/register', { name, email, password }),
  getProfile: () => axiosInstance.get('/auth/me')
};

export default axiosInstance;
