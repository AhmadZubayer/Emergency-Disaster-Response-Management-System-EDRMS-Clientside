import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { Geist_Mono, Inter } from 'next/font/google';

import { AuthProvider } from '@/contexts/auth-provider';
import Footer from '@/components/footer';
import ChatbotUI from '@/chatbot/chat-ui';
import { Toaster } from '@/components/ui/toast';
import { TooltipProvider } from '@/components/ui/tooltip';

import './globals.css';
const inter = Inter({
  variable: '--font-inter',
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
      className={`${inter.variable} ${geistMono.variable} h-full font-sans antialiased`}
    >
      <body className="min-h-full">
        <AuthProvider>
          <TooltipProvider>
            <Toaster>
              <div className="flex min-h-screen flex-col">
                <div className="flex-1">{children}</div>
                <Footer />
                <ChatbotUI />
              </div>
            </Toaster>
          </TooltipProvider>
        </AuthProvider>
      </body>
    </html>
  );
};

export default RootLayout;
