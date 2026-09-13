import axios from 'axios';

export const publicApi = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
});
