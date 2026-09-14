'use client';

import React from 'react';
import RouteFallbackControl from '@/components/auth/route-fallback-control';

const ProtectedLayout = ({ children }: { children: React.ReactNode }) => {
  return <RouteFallbackControl>{children}</RouteFallbackControl>;
};

export default ProtectedLayout;
