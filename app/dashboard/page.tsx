'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAuth from '@/app/hooks/useAuth';

export default function DashboardRedirectPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push('/sign-in');
      return;
    }

    const role = user.role?.toUpperCase();
    if (role === 'ADMIN') {
      router.push('/admin');
    } else if (role === 'RELIEF_ORG') {
      router.push('/relief-org/manage-disaster');
    } else if (role === 'VOLUNTEER') {
      router.push('/volunteer/profile');
    } else {
      router.push('/user/profile');
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-3">
      <div className="size-8 rounded-full border-2 border-emerald-600 border-t-transparent animate-spin" />
      <p className="text-sm font-semibold text-muted-foreground">Redirecting to your dashboard...</p>
    </div>
  );
}
