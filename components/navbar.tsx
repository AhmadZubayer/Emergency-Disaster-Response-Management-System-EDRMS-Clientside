'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronDown,
  UserRound,
  LogOut,
  Menu,
  X,
  HeartHandshake,
  Users,
  ShieldAlert,
  Coins,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/app/hooks/useAuth';

const navItems = [
  { label: 'Disasters', href: '/disaster' },
  { label: 'Missing Persons', href: '/missing-persons' },
  { label: 'Rescue Requests', href: '/rescue-requests' },
  { label: 'Donations', href: '/donations' },
  { label: 'Community', href: '/community' },
];

const Navbar = () => {
  const pathname = usePathname();
  const { user, logOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contributeOpen, setContributeOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  const contributeTimerRef = useRef<NodeJS.Timeout | null>(null);
  const accountTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleContributeMouseEnter = () => {
    if (contributeTimerRef.current) clearTimeout(contributeTimerRef.current);
    setContributeOpen(true);
  };

  const handleContributeMouseLeave = () => {
    contributeTimerRef.current = setTimeout(() => {
      setContributeOpen(false);
    }, 120);
  };

  const handleAccountMouseEnter = () => {
    if (accountTimerRef.current) clearTimeout(accountTimerRef.current);
    setAccountOpen(true);
  };

  const handleAccountMouseLeave = () => {
    accountTimerRef.current = setTimeout(() => {
      setAccountOpen(false);
    }, 120);
  };

  return (
    <header className="sticky top-4 z-50 w-full px-4 sm:px-6 pointer-events-none">
      <div className="max-w-fit mx-auto pointer-events-auto">
        <nav className="flex items-center gap-1.5 bg-white/95 text-neutral-900 rounded-full py-2 px-3.5 shadow-xl shadow-emerald-950/5 backdrop-blur-xl border border-emerald-600/15 transition-all">
          <Link
            href="/"
            className="px-2.5 py-1 text-emerald-700 font-black text-sm tracking-wider uppercase hover:opacity-80 transition-opacity shrink-0"
            title="EDRMS Home"
          >
            EDRMS
          </Link>

          <div className="hidden md:flex items-center gap-1 px-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-1.5 text-sm font-semibold transition-colors ${
                    isActive
                      ? 'text-emerald-700 underline underline-offset-4 decoration-2 decoration-emerald-600'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}

            <div
              className="relative"
              onMouseEnter={handleContributeMouseEnter}
              onMouseLeave={handleContributeMouseLeave}
            >
              <DropdownMenu open={contributeOpen} onOpenChange={setContributeOpen}>
                <DropdownMenuTrigger
                  render={
                    <button
                      type="button"
                      className="px-3 py-1.5 text-sm font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 transition-colors"
                    />
                  }
                >
                  <span>Contribute</span>
                  <ChevronDown className={`size-3.5 text-neutral-400 transition-transform duration-200 ${contributeOpen ? 'rotate-180' : ''}`} />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="center"
                  sideOffset={8}
                  onMouseEnter={handleContributeMouseEnter}
                  onMouseLeave={handleContributeMouseLeave}
                  className="w-52 bg-white/95 text-neutral-900 border border-emerald-600/15 shadow-2xl backdrop-blur-xl rounded-2xl p-1.5"
                >
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                    render={<Link href="/manage-volunteers" />}
                  >
                    <Users className="size-4 text-emerald-600" />
                    <span>Contribute as Volunteer</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                    render={<Link href="/donations" />}
                  >
                    <HeartHandshake className="size-4 text-emerald-600" />
                    <span>Contribute as Donor</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="flex items-center gap-1.5 pl-1">
            {user ? (
              <div
                className="relative"
                onMouseEnter={handleAccountMouseEnter}
                onMouseLeave={handleAccountMouseLeave}
              >
                <DropdownMenu open={accountOpen} onOpenChange={setAccountOpen}>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full px-4 py-1.5 text-sm transition-all shadow-md flex items-center gap-1.5 shrink-0 max-w-[200px] truncate"
                      />
                    }
                  >
                    <span className="truncate">{user.name || user.email}</span>
                    <ChevronDown className={`size-3.5 text-emerald-100 shrink-0 transition-transform duration-200 ${accountOpen ? 'rotate-180' : ''}`} />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={8}
                    onMouseEnter={handleAccountMouseEnter}
                    onMouseLeave={handleAccountMouseLeave}
                    className="w-52 bg-white/95 text-neutral-900 border border-emerald-600/15 shadow-2xl backdrop-blur-xl rounded-2xl p-1.5"
                  >
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                      render={<Link href="/profile" />}
                    >
                      <UserRound className="size-4 text-neutral-500" />
                      <span>View Profile</span>
                    </DropdownMenuItem>
                    {user?.role?.toUpperCase() === 'ADMIN' && (
                      <DropdownMenuItem
                        className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-bold text-emerald-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                        render={<Link href="/admin" />}
                      >
                        <ShieldAlert className="size-4 text-emerald-600" />
                        <span>Admin Panel</span>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                      render={<Link href="/manage-donations" />}
                    >
                      <Coins className="size-4 text-emerald-600" />
                      <span>Manage Donations</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                      render={<Link href="/manage-disaster" />}
                    >
                      <ShieldAlert className="size-4 text-amber-600" />
                      <span>Manage Disasters</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-neutral-700 hover:text-emerald-800 hover:bg-emerald-50 focus:bg-emerald-50 rounded-xl transition-colors"
                      render={<Link href="/manage-volunteers" />}
                    >
                      <Users className="size-4 text-blue-600" />
                      <span>Manage Volunteers</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      variant="destructive"
                      onClick={() => logOut()}
                      className="cursor-pointer gap-2.5 px-3 py-2 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 focus:bg-red-50 rounded-xl mt-1 border-t border-neutral-100 transition-colors"
                    >
                      <LogOut className="size-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Link
                href="/sign-in"
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-full px-4.5 py-1.5 text-sm transition-all shadow-md shrink-0"
              >
                Sign In
              </Link>
            )}

            <button
              type="button"
              className="md:hidden size-8 rounded-full flex items-center justify-center text-neutral-600 hover:text-neutral-900 transition-colors shrink-0"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </nav>

        {mobileOpen && (
          <div className="md:hidden mt-2 p-3 bg-white/95 text-neutral-900 rounded-2xl border border-emerald-600/15 shadow-2xl backdrop-blur-xl flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`px-3.5 py-2 rounded-xl text-sm font-semibold transition-colors ${
                  pathname === item.href
                    ? 'text-emerald-700 underline underline-offset-4 decoration-2 decoration-emerald-600'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {item.label}
              </Link>
            ))}

            <div className="pt-2 border-t border-neutral-100 mt-1 flex flex-col gap-1">
              <span className="text-xs uppercase font-bold text-neutral-400 px-3.5">
                Contribute
              </span>
              <Link
                href="/manage-volunteers"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
              >
                <Users className="size-4 text-emerald-600" />
                <span>Contribute as Volunteer</span>
              </Link>
              <Link
                href="/donations"
                onClick={() => setMobileOpen(false)}
                className="px-3.5 py-2 rounded-xl text-sm font-medium text-neutral-600 hover:text-neutral-900 flex items-center gap-2"
              >
                <HeartHandshake className="size-4 text-emerald-600" />
                <span>Contribute as Donor</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
