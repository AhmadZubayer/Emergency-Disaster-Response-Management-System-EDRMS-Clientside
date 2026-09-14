'use client';

import React from 'react';
import { FileEdit, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '@/components/navbar';
import ProfileSidebar from '@/components/profile/profile-sidebar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Spinner } from '@/components/ui/spinner';
import useAuth from '@/hooks/use-auth';
import { UserProfileData } from '@/components/profile/edit-profile-drawer';

interface DashboardFrameProps {
  children: React.ReactNode;
  profile: UserProfileData | null;
  role: string;
  tab: string;
  loading: boolean;
  togglingSafety: boolean;
  onEdit: () => void;
  onToggleSafety: () => void;
}

const DashboardFrame = ({ children, profile, role, tab, loading, togglingSafety, onEdit, onToggleSafety }: DashboardFrameProps) => {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-4">
              <div className="size-16 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-medium text-xl overflow-hidden shadow-inner">
                {profile?.photo_url ? (
                  <img
                    src={profile.photo_url}
                    alt={profile.name}
                    className="size-full object-cover"
                  />
                ) : (
                  <span>{profile?.name?.charAt(0)?.toUpperCase() || user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-medium tracking-tight text-foreground">
                    {profile?.name || user?.name || 'Emergency System User'}
                  </h1>
                  <Badge variant="outline" className="uppercase">
                    {user?.role || role}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {profile?.auth?.email || user?.email || 'user@emergency-system.org'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Button
                size="sm"
                variant={profile?.is_safe ? 'default' : 'destructive'}
                onClick={onToggleSafety}
                disabled={togglingSafety}

              >
                {togglingSafety ? (
                  <Spinner className="size-3.5" />
                ) : profile?.is_safe ? (
                  <CheckCircle2 className="size-3.5" />
                ) : (
                  <AlertCircle className="size-3.5" />
                )}
                {profile?.is_safe ? 'Marked Safe' : 'Mark In Danger'}
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={onEdit}

              >
                <FileEdit className="size-3.5" />
                Edit Profile
              </Button>
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <ProfileSidebar role={user?.role || role} activeTab={tab} />
            <div className="flex-1 w-full min-w-0 space-y-6">
              {loading ? (
                <div className="rounded-lg border border-border bg-card p-4 space-y-4" role="status" aria-label="Loading dashboard">
                  <Skeleton className="h-6 w-48" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
              ) : children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardFrame;
