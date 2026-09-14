'use client';

import React from 'react';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface SignInSuccessProps {
  userName?: string;
}

const SignInSuccess = ({ userName }: SignInSuccessProps) => {
  return (
    <div className="space-y-4 py-2">
      <Alert className="text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-4 text-primary dark:text-primary" />
        <AlertTitle >Sign in successful</AlertTitle>
        <AlertDescription >
          {userName ? `Welcome back, ${userName}!` : 'You have successfully signed in.'}
        </AlertDescription>
      </Alert>
      <div className="pt-2 text-center">
        <Button
          render={<Link href="/dashboard" />}
          className="w-full"
        >
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
};

export default SignInSuccess;
