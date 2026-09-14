import axios from 'axios';

const apiConfig = {
  baseURL: '/api',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
};

export const publicApi = axios.create(apiConfig);
export const axiosSecure = axios.create(apiConfig);

// Use the same bearer token for retained dashboards and the admin panel.
for (const client of [publicApi, axiosSecure]) {
  client.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
}
