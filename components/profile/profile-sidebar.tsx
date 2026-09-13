'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  USER_DASHBOARD_ROUTES,
  RELIEF_ORG_DASHBOARD_ROUTES,
  VOLUNTEER_DASHBOARD_ROUTES,
  DashboardRouteItem,
} from '@/lib/dashboard-routes';
import { normalizeRole } from '@/lib/roles';

export interface ProfileSidebarProps {
  role: string;
  activeTab: string;
}

export const ProfileSidebar = ({
  role,
  activeTab,
}: ProfileSidebarProps) => {
  const router = useRouter();
  const pathname = usePathname();

  const normalized = normalizeRole(role);
  const isVolunteer = normalized === 'VOLUNTEER';
  const isReliefOrg = normalized === 'RELIEF_ORG' || normalized === 'ADMIN';

  const reliefOrgDashboardItems = RELIEF_ORG_DASHBOARD_ROUTES.filter(
    (item) => item.category === 'dashboard'
  );
  const reliefOrgGeneralItems = RELIEF_ORG_DASHBOARD_ROUTES.filter(
    (item) => item.category !== 'dashboard'
  );

  const volunteerOperationsItems = VOLUNTEER_DASHBOARD_ROUTES.filter(
    (item) => item.category === 'operations'
  );
  const volunteerGeneralItems = VOLUNTEER_DASHBOARD_ROUTES.filter(
    (item) => item.category !== 'operations'
  );

  const handleNavigate = (item: DashboardRouteItem) => {
    router.push(item.href);
  };

  const isItemActive = (item: DashboardRouteItem) => {
    if (pathname === item.href) return true;
    if (activeTab === item.tab) return true;
    return false;
  };

  return (
    <aside className="w-full md:w-64 shrink-0">
      <div className="bg-card border border-border/60 rounded-2xl p-2 shadow-sm space-y-4">
        {isReliefOrg && (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Relief Organization Dashboard
            </div>
            {reliefOrgDashboardItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        {isVolunteer && (
          <div className="space-y-1">
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Volunteer Operations
            </div>
            {volunteerOperationsItems.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                    active
                      ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                      : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                  }`}
                >
                  <Icon className="size-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="space-y-1">
          {(isVolunteer || isReliefOrg) && (
            <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground border-t border-border/50 pt-3">
              General Options
            </div>
          )}
          {(isReliefOrg
            ? reliefOrgGeneralItems
            : isVolunteer
            ? volunteerGeneralItems
            : USER_DASHBOARD_ROUTES
          ).map((item) => {
            const Icon = item.icon;
            const active = isItemActive(item);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left ${
                  active
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold shadow-xs'
                    : item.destructive
                    ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
                    : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                }`}
              >
                <Icon
                  className={`size-4 shrink-0 ${
                    item.destructive ? 'text-destructive' : ''
                  }`}
                />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
