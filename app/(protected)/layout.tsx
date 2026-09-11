'use client';

import React from 'react';
import ProtectedRoute from '@/components/auth/protected-route';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default ProtectedLayout;
