'use client';

import React from 'react';
import Navbar from '@/components/navbar';
import ReliefOrgSidebar from '@/components/relief-org-sidebar';
import RoleRoute from '@/components/auth/role-route';

const ReliefOrgLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleRoute allowedRoles={['RELIEF_ORG', 'ADMIN']}>
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <ReliefOrgSidebar />
            <div className="flex-1 w-full min-w-0">
              {children}
            </div>
          </div>
        </main>
      </div>
    </RoleRoute>
  );
};

export default ReliefOrgLayout;

