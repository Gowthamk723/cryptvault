import axios from 'axios';

// 1. Set the Base URL
// This points to your Express Server
const api = axios.create({
  baseURL: 'http://localhost:5000/api',
});

// 2. The "Interceptor"
// Before every request, check if we have a token and attach it.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;