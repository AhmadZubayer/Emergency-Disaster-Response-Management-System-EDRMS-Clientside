'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { UsersRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const VolunteerGroupsPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);

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
          id: 'groups-profile-error',
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
        role="VOLUNTEER"
        tab="groups"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Volunteer Group Deployments</h3>
              <p className="text-xs text-muted-foreground">
                Teams and task forces you have been assigned to.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => router.push('/groups')}

            >
              View Group Deployments
            </Button>
          </div>

          <div className="rounded-lg border border-dashed border-border p-4 text-center bg-card space-y-2">
            <UsersRound className="size-8 text-muted-foreground/60 mx-auto" />
            <p className="text-xs text-muted-foreground">
              View your assigned rescue group details and operational partners.
            </p>
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

export default VolunteerGroupsPage;
