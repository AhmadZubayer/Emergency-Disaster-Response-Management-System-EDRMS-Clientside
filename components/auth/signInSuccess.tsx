'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import useAuth from '@/app/hooks/useAuth';

interface SignInSuccessProps {
  userName?: string;
}

const SignInSuccess = ({ userName }: SignInSuccessProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role?.toUpperCase() === 'ADMIN';

  return (
    <div className="space-y-4 py-2">
      <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4 text-emerald-600 dark:text-emerald-400" />
        <AlertTitle className="font-semibold">Sign in successful</AlertTitle>
        <AlertDescription className="text-xs">
          {userName ? `Welcome back, ${userName}!` : 'You have successfully signed in.'}
        </AlertDescription>
      </Alert>

      <div className="pt-2 text-center space-y-2">
        {isAdmin ? (
          <Button
            render={<Link href="/admin" />}
            className="w-full h-10 rounded-full font-bold bg-emerald-600 hover:bg-emerald-500 gap-2"
          >
            <ShieldCheck className="size-4" />
            <span>Go to Admin Panel</span>
          </Button>
        ) : (
          <Button
            render={<Link href="/dashboard" />}
            className="w-full h-10 rounded-full font-semibold gap-2"
          >
            <LayoutDashboard className="size-4" />
            <span>Go to Dashboard</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default SignInSuccess;
