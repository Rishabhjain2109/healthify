import axios from 'axios';

const API = axios.create({
  baseURL: 'http://localhost:5000', // Removed /api since it's already in the routes
});

// Attach JWT to every request if token exists
API.interceptors.request.use(
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

export default API;
