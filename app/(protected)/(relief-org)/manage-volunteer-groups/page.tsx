'use client';

import React from 'react';
import Navbar from '@/components/navbar';
import { Users } from 'lucide-react';

const ManageVolunteerGroupsPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-border/60 pb-6">
          <div className="size-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
            <Users className="size-6" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
              Manage Volunteer Groups
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Coordinate volunteer relief teams, dispatch field operations, and assign tasks.
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-border/70 p-12 text-center bg-card">
          <p className="text-sm font-medium text-muted-foreground">
            Volunteer groups management module
          </p>
        </div>
      </main>
    </div>
  );
};

export default ManageVolunteerGroupsPage;
