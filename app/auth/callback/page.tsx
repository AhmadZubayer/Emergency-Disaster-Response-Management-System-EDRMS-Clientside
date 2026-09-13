'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/hooks/useAuth';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { fetchCurrentUser } = useAuth();

  useEffect(() => {
    const accessToken = searchParams.get('access_token');
    const error = searchParams.get('error');

    if (error) {
      console.error('Google OAuth error:', error);
      router.replace('/sign-in?error=' + encodeURIComponent(error));
      return;
    }

    if (accessToken) {
      localStorage.setItem('access_token', accessToken);
      fetchCurrentUser().then(() => {
        router.replace('/dashboard');
      }).catch(() => {
        router.replace('/dashboard');
      });
    } else {
      router.replace('/sign-in');
    }
  }, [searchParams, router, fetchCurrentUser]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center space-y-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground font-medium">Completing Google Sign In...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
