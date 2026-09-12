import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:
    typeof window === 'undefined'
      ? `${process.env.BACKEND_URL || 'http://localhost:3000'}/api`
      : '/api',
  timeout: 15000,
  withCredentials: true,
});

export default axiosInstance;