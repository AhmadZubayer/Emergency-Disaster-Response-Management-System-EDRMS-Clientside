import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist, Geist_Mono } from 'next/font/google';

import UserSidebar from '@/components/userSidebar';
import UserHeader from '@/components/userHeader';
import {
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';

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

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SidebarProvider>
          <UserSidebar />

          <SidebarInset className="min-w-0">
            <UserHeader />
            <div className="flex-1">{children}</div>
          </SidebarInset>
        </SidebarProvider>
      </body>
    </html>
  );
}