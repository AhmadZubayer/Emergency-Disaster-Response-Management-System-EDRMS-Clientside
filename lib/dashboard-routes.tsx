import React from 'react';
import { normalizeRole } from '@/lib/roles';
import {
  UserRound,
  User,
  LifeBuoy,
  HeartHandshake,
  FileText,
  Trash2,
  ShieldCheck,
  ClipboardList,
  MapPinned,
  FileWarning,
  UsersRound,
  AlertTriangle,
  Users,
  MessageSquare,
} from 'lucide-react';

export interface DashboardRouteItem {
  id: string;
  label: string;
  href: string;
  tab: string;
  icon: React.ComponentType<{ className?: string }>;
  destructive?: boolean;
  category?: 'dashboard' | 'operations' | 'general';
}

export const USER_DASHBOARD_ROUTES: DashboardRouteItem[] = [
  {
    id: 'profile',
    label: 'Your Profile',
    href: '/user/profile',
    tab: 'profile',
    icon: UserRound,
    category: 'general',
  },
  {
    id: 'rescue-requests',
    label: 'Rescue Requests',
    href: '/user/rescue-requests',
    tab: 'rescue-requests',
    icon: LifeBuoy,
    category: 'general',
  },
  {
    id: 'missing-persons',
    label: 'Missing Persons',
    href: '/user/missing-persons',
    tab: 'missing-persons',
    icon: User,
    category: 'general',
  },
  {
    id: 'posts',
    label: 'Community Posts',
    href: '/user/community-posts',
    tab: 'posts',
    icon: MessageSquare,
    category: 'general',
  },
  {
    id: 'donations',
    label: 'Donations',
    href: '/user/donations',
    tab: 'donations',
    icon: HeartHandshake,
    category: 'general',
  },
  {
    id: 'applications',
    label: 'Applications',
    href: '/user/applications',
    tab: 'applications',
    icon: FileText,
    category: 'general',
  },
  {
    id: 'trash',
    label: 'Trash',
    href: '/user/trash',
    tab: 'trash',
    icon: Trash2,
    destructive: true,
    category: 'general',
  },
];

export const RELIEF_ORG_DASHBOARD_ROUTES: DashboardRouteItem[] = [
  {
    id: 'manage-disaster',
    label: 'Manage Disaster',
    href: '/relief-org/manage-disaster',
    tab: 'manage-disaster',
    icon: AlertTriangle,
    category: 'dashboard',
  },
  {
    id: 'manage-donations',
    label: 'Manage Donations',
    href: '/relief-org/manage-donations',
    tab: 'manage-donations',
    icon: HeartHandshake,
    category: 'dashboard',
  },
  {
    id: 'manage-volunteers',
    label: 'Manage Volunteer Groups',
    href: '/relief-org/manage-volunteers',
    tab: 'manage-volunteers',
    icon: Users,
    category: 'dashboard',
  },
  {
    id: 'profile',
    label: 'Your Profile',
    href: '/relief-org/profile',
    tab: 'profile',
    icon: UserRound,
    category: 'general',
  },
  {
    id: 'missing-persons',
    label: 'Missing Person Requests',
    href: '/relief-org/missing-persons',
    tab: 'missing-persons',
    icon: User,
    category: 'general',
  },
  {
    id: 'rescue-requests',
    label: 'Rescue Requests',
    href: '/relief-org/rescue-requests',
    tab: 'rescue-requests',
    icon: LifeBuoy,
    category: 'general',
  },
  {
    id: 'posts',
    label: 'Posts',
    href: '/relief-org/community-posts',
    tab: 'posts',
    icon: MessageSquare,
    category: 'general',
  },
  {
    id: 'donations',
    label: 'Donations',
    href: '/relief-org/donations',
    tab: 'donations',
    icon: HeartHandshake,
    category: 'general',
  },
  {
    id: 'applications',
    label: 'Applications',
    href: '/relief-org/applications',
    tab: 'applications',
    icon: FileText,
    category: 'general',
  },
  {
    id: 'trash',
    label: 'Trash',
    href: '/relief-org/trash',
    tab: 'trash',
    icon: Trash2,
    destructive: true,
    category: 'general',
  },
];

export const VOLUNTEER_DASHBOARD_ROUTES: DashboardRouteItem[] = [
  {
    id: 'volunteer-profile',
    label: 'Volunteer Profile',
    href: '/volunteer/profile',
    tab: 'volunteer-profile',
    icon: ShieldCheck,
    category: 'operations',
  },
  {
    id: 'opportunities',
    label: 'Opportunities',
    href: '/volunteer/opportunities',
    tab: 'opportunities',
    icon: HeartHandshake,
    category: 'operations',
  },
  {
    id: 'my-tasks',
    label: 'My Tasks',
    href: '/volunteer/my-tasks',
    tab: 'my-tasks',
    icon: ClipboardList,
    category: 'operations',
  },
  {
    id: 'nearby-rescue',
    label: 'Nearby Rescue',
    href: '/volunteer/nearby-rescue',
    tab: 'nearby-rescue',
    icon: MapPinned,
    category: 'operations',
  },
  {
    id: 'field-reports',
    label: 'Field Reports',
    href: '/volunteer/field-reports',
    tab: 'field-reports',
    icon: FileWarning,
    category: 'operations',
  },
  {
    id: 'groups',
    label: 'Group Joins',
    href: '/volunteer/groups',
    tab: 'groups',
    icon: UsersRound,
    category: 'operations',
  },
  {
    id: 'profile',
    label: 'Your Profile',
    href: '/volunteer/personal-profile',
    tab: 'profile',
    icon: UserRound,
    category: 'general',
  },
  {
    id: 'missing-persons',
    label: 'Missing Person Requests',
    href: '/volunteer/missing-persons',
    tab: 'missing-persons',
    icon: User,
    category: 'general',
  },
  {
    id: 'rescue-requests',
    label: 'Rescue Requests',
    href: '/volunteer/rescue-requests',
    tab: 'rescue-requests',
    icon: LifeBuoy,
    category: 'general',
  },
  {
    id: 'posts',
    label: 'Posts',
    href: '/volunteer/community-posts',
    tab: 'posts',
    icon: MessageSquare,
    category: 'general',
  },
  {
    id: 'donations',
    label: 'Donations',
    href: '/volunteer/donations',
    tab: 'donations',
    icon: HeartHandshake,
    category: 'general',
  },
  {
    id: 'applications',
    label: 'Applications',
    href: '/volunteer/applications',
    tab: 'applications',
    icon: FileText,
    category: 'general',
  },
  {
    id: 'trash',
    label: 'Trash',
    href: '/volunteer/trash',
    tab: 'trash',
    icon: Trash2,
    destructive: true,
    category: 'general',
  },
];

export const getDashboardRoutesByRole = (
  role?: string | null
): DashboardRouteItem[] => {
  const norm = normalizeRole(role);
  if (norm === 'RELIEF_ORG' || norm === 'ADMIN') {
    return RELIEF_ORG_DASHBOARD_ROUTES;
  }
  if (norm === 'VOLUNTEER') {
    return VOLUNTEER_DASHBOARD_ROUTES;
  }
  return USER_DASHBOARD_ROUTES;
};

export const getPrimaryProfileRoute = (role?: string | null): string => {
  const norm = normalizeRole(role);
  if (norm === 'RELIEF_ORG' || norm === 'ADMIN') {
    return '/relief-org/profile';
  }
  if (norm === 'VOLUNTEER') {
    return '/volunteer/profile';
  }
  return '/user/profile';
};
