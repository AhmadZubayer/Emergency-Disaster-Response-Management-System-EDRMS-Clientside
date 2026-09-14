'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/navbar';
import ModernButton from '@/components/modernBtn';

export interface ErrorProps {
  title?: string;
  description?: string;
  code?: string | number;
  onAction?: () => void;
  actionText?: string;
}

const Error = ({
  title = 'Something Went Wrong',
  description = 'An unexpected error occurred. Please try again later or return to home.',
  code = '500',
  onAction,
  actionText = 'Back to Home',
}: ErrorProps) => {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      router.push('/');
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-cover bg-center bg-no-repeat bg-fixed relative"
      style={{
        backgroundImage: "url('/reg-page-bg.png')",
      }}
    >
      <div className="absolute inset-0 bg-black/15 pointer-events-none" />
      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-4 py-8">
          <div className="w-full max-w-md bg-background dark:bg-card rounded-lg border border-white/40 dark:border-border p-4 sm:p-10 text-center space-y-4">
            <h1 className="text-2xl font-medium tracking-tight text-foreground">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                {description}
              </p>
            )}
            {code && (
              <p className="text-xs font-mono font-medium text-red-500">
                Error Code: {code}
              </p>
            )}
            <div className="pt-3 flex justify-center">
              <ModernButton onClick={handleAction}>
                {actionText}
              </ModernButton>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Error;
