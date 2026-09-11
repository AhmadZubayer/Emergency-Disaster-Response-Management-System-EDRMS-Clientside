'use client';

import React, { createContext, useContext, useState } from 'react';

type User = {
  id: string;
  name: string;
  email: string;
  role?: string;
} | null;

interface AuthContextType {
  user: User;
  status: 'authenticated' | 'unauthenticated' | 'loading';
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  status: 'unauthenticated',
  setUser: () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User>(null);
  const status = user ? 'authenticated' : 'unauthenticated';

  return (
    <AuthContext.Provider value={{ user, status, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
