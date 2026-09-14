'use client';

import { useContext } from 'react';
import { AuthContext } from '@/app/contexts/AuthProvider';

const useAuth = () => {
  return useContext(AuthContext);
};

export { useAuth };
export default useAuth;
