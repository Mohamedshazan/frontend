// lib/api.ts
import axios from 'axios';

const instance = axios.create({
  baseURL:
    process.env.NEXT_PUBLIC_API_URL ||
    'https://asset-backend-production-acb2.up.railway.app/api',
  headers: {
    Accept: 'application/json',
  },
});

// Attach token to every request
instance.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Auto redirect to login on 401
instance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (typeof window !== 'undefined' && error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('userName');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default instance;
