'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileEdit, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
const renderValue = (val?: string | number | null) => {
  if (val !== undefined && val !== null && String(val).trim().length > 0) {
    return <span className="font-medium text-foreground">{String(val)}</span>;
  }
  return <span className="text-muted-foreground/50 italic font-normal">Not added</span>;
};
const ReliefOrgProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);

  const formattedAddress = profile?.address
    ? [profile.address.house, profile.address.city, profile.address.district, profile.address.country]
      .filter(Boolean)
      .join(', ')
    : null;

  const coordinates =
    profile?.gps_lat !== undefined && profile?.gps_lat !== null && profile?.gps_lng !== undefined && profile?.gps_lng !== null
      ? `${profile.gps_lat}, ${profile.gps_lng}`
      : null;

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'profile-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    if (user) {
      fetchPageData();
    }
  }, [user, fetchPageData]);

  const handleToggleSafety = async () => {
    try {
      setTogglingSafety(true);
      await axiosSecure.patch('/users/is-safe');
      await fetchPageData();
    } catch (err) {
      toast.add({ id: 'safety-update-error', title: getApiErrorMessage(err, 'Failed to update safety status.'), type: 'error' });
    } finally {
      setTogglingSafety(false);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="RELIEF_ORG"
        tab="profile"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4 space-y-6">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">Personal Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Verified civilian credentials and emergency identity.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditOpen(true)}

              >
                <Pencil className="size-3.5" />
                Edit
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Full Name
                </span>
                <div>{renderValue(profile?.name)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Account Email
                </span>
                <div>{renderValue(profile?.auth?.email || user?.email)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Primary Phone
                </span>
                <div>{renderValue(profile?.phone)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  System Role
                </span>
                <div className="capitalize">{renderValue(profile?.auth?.role || user?.role)}</div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-sm font-medium text-foreground">Safety Status & Medical Overview</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Critical information used for emergency rescue priority.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Safety Status
                </span>
                <div>
                  {profile?.is_safe ? (
                    <Badge variant="outline" >
                      Safe
                    </Badge>
                  ) : (
                    <Badge variant="destructive">
                      Requires Assistance / Danger
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Emergency Broadcast Message
                </span>
                <div className="leading-relaxed bg-muted/20 p-3 rounded-lg border border-border">
                  {renderValue(profile?.emergency_message)}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Medical Information & History
                </span>
                <div className="leading-relaxed bg-muted/20 p-3 rounded-lg border border-border">
                  {renderValue(profile?.medical_information)}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-6">
            <div className="border-b border-border pb-4">
              <h3 className="text-sm font-medium text-foreground">Primary Address & Coordinates</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Registered residence and real-time pinned rescue location.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Physical Address
                </span>
                <div>{renderValue(formattedAddress)}</div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Pinned GPS Coordinates
                </span>
                <div>{renderValue(coordinates)}</div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              onClick={() => setIsEditOpen(true)}

            >
              <FileEdit className="size-4" />
              Edit Profile Details
            </Button>
          </div>
        </div>
      </DashboardFrame>
      {profile && (
        <EditProfileDrawer
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          profile={profile}
          onSuccess={fetchPageData}
        />
      )}
    </>
  );
};

export default ReliefOrgProfilePage;
