'use client';

import axios from 'axios';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './useAuth';

export const axiosSecure = axios.create({
  baseURL: '/api',
  withCredentials: true,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const useAxiosSecure = () => {
  const { user, logOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const resInterceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      async (error) => {
        const statusCode = error.response?.status;
        if (statusCode === 401 || statusCode === 403) {
          await logOut();
          router.push('/sign-in');
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.response.eject(resInterceptor);
    };
  }, [user, logOut, router]);

  return axiosSecure;
};

export default useAxiosSecure;
