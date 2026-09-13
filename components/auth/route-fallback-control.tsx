'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import useAuth from '@/hooks/use-auth';
import { normalizeRole } from '@/lib/roles';
import { getDashboardRoutesByRole } from '@/lib/dashboard-routes';
import { Spinner } from '@/components/ui/spinner';

interface RouteFallbackControlProps {
  children: React.ReactNode;
}

const isAuthorizedRoute = (pathname: string, userRole?: string | null): boolean => {
  const role = normalizeRole(userRole);

  if (role === 'ADMIN') {
    return true;
  }

  const allowedRoutes = getDashboardRoutesByRole(role);
  return allowedRoutes.some((route) => pathname.startsWith(route.href));
};

const RouteFallbackControl = ({ children }: RouteFallbackControlProps) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const isAuthorized = user ? isAuthorizedRoute(pathname, user.role) : false;

  useEffect(() => {
    if (!loading && !user) {
      const returnUrl = pathname ? `?returnUrl=${encodeURIComponent(pathname)}` : '';
      router.push(`/sign-in${returnUrl}`);
      return;
    }

    if (!loading && user && !isAuthorized) {
      router.push('/');
    }
  }, [user, loading, isAuthorized, router, pathname]);

  if (loading || !user || !isAuthorized) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
        <Spinner className="size-8 text-emerald-600" />
      </div>
    );
  }

  return <>{children}</>;
};

export default RouteFallbackControl;

