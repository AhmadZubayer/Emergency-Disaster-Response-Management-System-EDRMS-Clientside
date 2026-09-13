'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ShieldCheck,
  User,
  LogOut,
} from 'lucide-react';
import useAuth from '@/app/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logOut } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-extrabold text-xl text-emerald-600 tracking-tight flex items-center gap-2">
            <ShieldCheck className="size-6" />
            <span>EDRMS</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4 text-sm font-semibold text-muted-foreground">
            <Link
              href="/"
              className={`hover:text-foreground transition-colors ${
                pathname === '/' ? 'text-emerald-600 font-bold' : ''
              }`}
            >
              Home
            </Link>
            {user?.role?.toUpperCase() === 'ADMIN' && (
              <Link
                href="/admin"
                className={`hover:text-foreground transition-colors flex items-center gap-1.5 ${
                  pathname?.startsWith('/admin') ? 'text-emerald-600 font-bold' : ''
                }`}
              >
                <ShieldCheck className="size-4 text-emerald-600" />
                <span>Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold text-muted-foreground hidden sm:inline-block">
                {user.name || user.email}
              </span>
              <button
                onClick={() => logOut()}
                className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Logout"
              >
                <LogOut className="size-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/sign-in"
              className="bg-emerald-600 text-white font-semibold text-xs px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
