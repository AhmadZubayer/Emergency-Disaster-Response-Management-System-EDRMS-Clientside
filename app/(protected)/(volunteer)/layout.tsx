'use client';

import React from 'react';
import Navbar from '@/components/navbar';
import RoleRoute from '@/components/auth/role-route';
import VolunteerSidebar from '@/components/volunteers/volunteer-sidebar';

const VolunteerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <RoleRoute allowedRoles={['USER', 'VOLUNTEER']}>
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-8 md:flex-row">
            <VolunteerSidebar />
            <div className="w-full min-w-0 flex-1">{children}</div>
          </div>
        </main>
      </div>
    </RoleRoute>
  );
};

export default VolunteerLayout;
