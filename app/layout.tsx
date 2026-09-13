import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

import { AuthProvider } from '@/contexts/auth-provider';
import { Toaster } from '@/components/ui/toast';

import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'EDRMS',
  description: 'Emergency & Disaster Response Management System',
};

const RootLayout = ({
  children,
}: {
  children: ReactNode;
}) => {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <Toaster>
            {children}
          </Toaster>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;


