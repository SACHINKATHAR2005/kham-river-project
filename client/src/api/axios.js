import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://kham-river-project.onrender.com/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const mlApi = axios.create({
  baseURL: 'http://localhost:8000'
});

// Add interceptors for api instance
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Add default export
export default api;