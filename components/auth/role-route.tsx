'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/hooks/use-auth';
import { normalizeRole } from '@/lib/roles';
import { Spinner } from '@/components/ui/spinner';

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
}

const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const userRole = normalizeRole(user?.role);
  const normalizedAllowedRoles = allowedRoles.map((role) => normalizeRole(role));

  const hasAccess = Boolean(
    user && (userRole === 'ADMIN' || normalizedAllowedRoles.includes(userRole))
  );

  useEffect(() => {
    if (!loading && (!user || !hasAccess)) {
      router.push('/');
    }
  }, [loading, user, hasAccess, router]);

  if (loading || !user || !hasAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <Spinner className="size-8 text-emerald-600" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RoleRoute;
