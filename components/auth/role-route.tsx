'use client';

import React from 'react';
import Link from 'next/link';
import { ShieldAlert } from 'lucide-react';
import useAuth from '@/app/hooks/useAuth';
import { Button } from '@/components/ui/button';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      </div>
    );
  }

  const userRole = user?.role?.toUpperCase();
  const hasAccess = !!(
    userRole &&
    (userRole === 'ADMIN' || allowedRoles.includes(userRole))
  );

  if (!hasAccess) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6 space-y-4">
        <div className="size-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center">
          <ShieldAlert className="size-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">Access Denied</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            You do not have permission to view this page.
          </p>
        </div>
        <Button render={<Link href="/" />} variant="outline">
          Return to Home
        </Button>
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
