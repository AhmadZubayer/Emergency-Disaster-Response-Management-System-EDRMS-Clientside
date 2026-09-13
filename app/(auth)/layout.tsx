'use client';

import React from 'react';
import Navbar from '@/components/navbar';

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
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
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthLayout;
