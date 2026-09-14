import axios from 'axios';

export const publicApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});

publicApi.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
