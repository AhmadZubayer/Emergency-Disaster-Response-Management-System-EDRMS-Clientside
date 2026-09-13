'use client';

import { createContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { axiosSecure, publicApi } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role?: string;
} | null;

interface AuthContextType {
  user: UserType;
  loading: boolean;
  signInUser: (email: string, password: string) => Promise<void>;
  registerUser: (name: string, email: string, password: string) => Promise<void>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);
  const sessionExpired = useRef(false);
  const router = useRouter();

  useEffect(() => {
    const interceptor = axiosSecure.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401 && !sessionExpired.current) {
          sessionExpired.current = true;
          setUser(null);
          router.replace('/sign-in');
        }

        return Promise.reject(error);
      }
    );

    return () => {
      axiosSecure.interceptors.response.eject(interceptor);
    };
  }, [router]);

  useEffect(() => {
    let active = true;

    const loadCurrentUser = async () => {
      try {
        const response = await publicApi.get(ENDPOINTS.AUTH.ME);
        if (active) {
          setUser(response.data?.data || response.data);
        }
      } catch {
        if (active) {
          setUser(null);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    loadCurrentUser();

    return () => {
      active = false;
    };
  }, []);

  const signInUser = async (email: string, password: string) => {
    setLoading(true);

    try {
      await publicApi.post(ENDPOINTS.AUTH.SIGN_IN, { email, password });
      const response = await publicApi.get(ENDPOINTS.AUTH.ME);
      sessionExpired.current = false;
      setUser(response.data?.data || response.data);
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, password: string) => {
    setLoading(true);

    try {
      await publicApi.post(ENDPOINTS.AUTH.REGISTER, { name, email, password });
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);

    try {
      await publicApi.post(ENDPOINTS.AUTH.LOGOUT);
    } catch {
      return;
    } finally {
      setUser(null);
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signInUser, registerUser, logOut }}>
      {children}
    </AuthContext.Provider>
  );
};
