'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileWarning,
  HeartHandshake,
  MapPinned,
  UserRound,
  UsersRound,
} from 'lucide-react';

const navItems = [
  { label: 'Dashboard', href: '/volunteer-dashboard', icon: LayoutDashboard },
  { label: 'Volunteer Profile', href: '/volunteer-profile', icon: UserRound },
  { label: 'Nearby Rescue', href: '/nearby-rescue', icon: MapPinned },
  { label: 'My Tasks', href: '/my-tasks', icon: ClipboardList },
  { label: 'Field Reports', href: '/field-reports', icon: FileWarning },
  { label: 'Opportunities', href: '/opportunities', icon: HeartHandshake },
  { label: 'Group Joins', href: '/groups', icon: UsersRound },
];

const VolunteerSidebar = () => {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-60 shrink-0">
      <div className="rounded-xl border border-border/60 bg-card p-1.5 shadow-sm space-y-1">
        <div className="px-3.5 py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
          Volunteer Operations
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                  : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
              }`}
            >
              <Icon className="size-4 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default VolunteerSidebar;
