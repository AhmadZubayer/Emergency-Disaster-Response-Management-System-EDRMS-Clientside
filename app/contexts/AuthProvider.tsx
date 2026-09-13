'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { publicApi } from '@/app/lib/public-api';

export type UserType = {
  id: string;
  name: string;
  email: string;
  role?: string;
} | null;

interface AuthContextType {
  user: UserType;
  loading: boolean;
  signInUser: (email: string, pass: string) => Promise<any>;
  registerUser: (name: string, email: string, pass: string) => Promise<any>;
  logOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signInUser: async () => {},
  registerUser: async () => {},
  logOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserType>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = useCallback(async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setUser(null);
        return;
      }
      const res = await publicApi.get('/auth/me');
      const userData = res.data?.data || res.data;
      setUser(userData);
    } catch (err) {
      console.error('fetchCurrentUser failed:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const signInUser = async (email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await publicApi.post(
        '/auth/sign-in',
        { email, password: pass },
        { withCredentials: true }
      );
      const token = res.data?.data?.access_token || res.data?.access_token;
      if (token && typeof window !== 'undefined') {
        localStorage.setItem('access_token', token);
      }
      await fetchCurrentUser();
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const registerUser = async (name: string, email: string, pass: string) => {
    setLoading(true);
    try {
      const res = await publicApi.post(
        '/auth/register-user',
        { name, email, password: pass },
        { withCredentials: true }
      );
      return res.data;
    } finally {
      setLoading(false);
    }
  };

  const logOut = async () => {
    setLoading(true);
    try {
      await publicApi.post('/auth/logout');
    } catch {
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token');
      }
      setUser(null);
      setLoading(false);
    }
  };

  const authInfo = {
    user,
    loading,
    signInUser,
    registerUser,
    logOut,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export default AuthProvider;