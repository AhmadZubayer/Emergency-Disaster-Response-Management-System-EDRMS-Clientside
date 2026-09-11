import React from 'react';
import SignInForm from '@/components/auth/signInForm';

const SignInPage = () => {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <SignInForm />
    </main>
  );
};

export default SignInPage;
