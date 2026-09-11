import React from 'react';
import SignUpForm from '@/components/auth/signUpForm';

const SignUpPage = () => {
  return (
    <main className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-4">
      <SignUpForm />
    </main>
  );
};

export default SignUpPage;
