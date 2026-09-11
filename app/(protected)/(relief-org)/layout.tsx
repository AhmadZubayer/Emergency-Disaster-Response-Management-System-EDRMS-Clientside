'use client';

import React from 'react';
import RoleRoute from '@/components/auth/role-route';

const ReliefOrgLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleRoute allowedRoles={['RELIEF_ORG', 'ADMIN']}>
      {children}
    </RoleRoute>
  );
};

export default ReliefOrgLayout;
