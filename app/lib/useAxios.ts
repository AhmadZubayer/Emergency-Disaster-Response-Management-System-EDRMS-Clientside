import axios from 'axios';

const axiosInstance = axios.create({
  baseURL:
    typeof window === 'undefined'
      ? `${process.env.BACKEND_URL}/api` 
      : '/api',                        
  timeout: 15000,
});

export default axiosInstance;