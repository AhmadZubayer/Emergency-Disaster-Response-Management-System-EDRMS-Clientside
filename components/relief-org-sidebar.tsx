'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { User, AlertTriangle, Users, HeartHandshake } from 'lucide-react';

const navItems = [
  {
    label: 'Profile',
    href: '/profile',
    icon: User,
  },
  {
    label: 'Disaster',
    href: '/manage-disaster',
    icon: AlertTriangle,
  },
  {
    label: 'Volunteers',
    href: '/manage-volunteers',
    icon: Users,
  },
  {
    label: 'Donations',
    href: '/manage-donations',
    icon: HeartHandshake,
  },
];

const ReliefOrgSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="bg-card border border-border/60 rounded-xl p-1.5 shadow-sm space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/profile' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <Icon
                className={`size-4 shrink-0 ${
                  isActive
                    ? 'text-emerald-600 dark:text-emerald-400'
                    : 'text-muted-foreground'
                }`}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default ReliefOrgSidebar;
