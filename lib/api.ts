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
