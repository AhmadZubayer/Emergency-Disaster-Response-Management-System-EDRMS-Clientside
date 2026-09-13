'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  AlertTriangle,
  LifeBuoy,
  MessageSquare,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

const navItems = [
  {
    label: 'Overview',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    label: 'Accounts',
    href: '/admin/accounts',
    icon: Users,
  },
  {
    label: 'Volunteers',
    href: '/admin/volunteers',
    icon: UserCheck,
  },
  {
    label: 'Relief Orgs',
    href: '/admin/relief-orgs',
    icon: Building2,
  },
  {
    label: 'Disasters',
    href: '/admin/disasters',
    icon: AlertTriangle,
  },
  {
    label: 'Rescue Requests',
    href: '/admin/rescue-requests',
    icon: LifeBuoy,
  },
  {
    label: 'Community Posts',
    href: '/admin/community-posts',
    icon: MessageSquare,
  },
  {
    label: 'Database Explorer',
    href: '/admin/tables',
    icon: Database,
  },
  {
    label: 'Reports',
    href: '/admin/reports',
    icon: FileSpreadsheet,
  },
];

const AdminSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="bg-card border border-border/60 rounded-xl p-1.5 shadow-sm space-y-1">
        <div className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border/40 mb-1">
          Admin Management
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== '/admin' && pathname?.startsWith(item.href));

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 font-bold shadow-xs'
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

export default AdminSidebar;
