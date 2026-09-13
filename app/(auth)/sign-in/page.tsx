'use client';

import React, { Suspense } from 'react';
import SignInForm from '@/components/auth/signInForm';

const SignInPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <SignInForm />
    </Suspense>
  );
};

export default SignInPage;
