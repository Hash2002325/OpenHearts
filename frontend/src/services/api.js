import axios from 'axios';

// Base URL from environment variable
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests automatically if user is logged in
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  // Register new user
  register: (userData) => api.post('/auth/register', userData),
  
  // Login user
  login: (credentials) => api.post('/auth/login', credentials),
  
  // Get current user info
  getMe: () => api.get('/auth/me')
};

// Categories API calls
export const categoriesAPI = {
  // Get all categories
  getAll: () => api.get('/categories'),
  
  // Get single category
  getById: (id) => api.get(`/categories/${id}`),
  
  // Create category (admin only)
  create: (categoryData) => api.post('/categories', categoryData),
  
  // Update category (admin only)
  update: (id, categoryData) => api.put(`/categories/${id}`, categoryData),
  
  // Delete category (admin only)
  delete: (id) => api.delete(`/categories/${id}`)
};

// Donations API calls
export const donationsAPI = {
  // Get user's donations (or all if admin)
  getAll: () => api.get('/donations'),
  
  // Get single donation
  getById: (id) => api.get(`/donations/${id}`),
  
  // Create donation
  create: (donationData) => api.post('/donations', donationData),
  
  // Get stats (admin only)
  getStats: () => api.get('/donations/stats/total')
};

export default api;