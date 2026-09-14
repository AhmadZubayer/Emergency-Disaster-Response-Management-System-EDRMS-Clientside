'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import DashboardFrame from '@/components/profile/dashboard-frame';
import EditProfileDrawer, {
  UserProfileData,
} from '@/components/profile/edit-profile-drawer';
import { axiosSecure } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import { getApiErrorMessage } from '@/utils/api-error';

export default function OperationsDashboard({
  role,
  tab,
  children,
}: {
  role: 'VOLUNTEER' | 'RELIEF_ORG';
  tab: string;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [error, setError] = useState('');
  const loadProfile = useCallback(() => {
    return axiosSecure
      .get('/users/profile')
      .then((response) => {
        setError('');
        setProfile(response.data?.data ?? response.data);
      })
      .catch((error: unknown) => {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load your profile. Please retry.',
          ),
        );
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) void loadProfile();
  }, [user, loadProfile]);

  const toggleSafety = async () => {
    setToggling(true);
    try {
      await axiosSecure.patch('/users/is-safe');
      await loadProfile();
    } catch (error) {
      setError(getApiErrorMessage(error, 'Unable to update safety status.'));
    } finally {
      setToggling(false);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role={role}
        tab={tab}
        loading={loading}
        togglingSafety={toggling}
        onEdit={() => setEditing(true)}
        onToggleSafety={toggleSafety}
      >
        {error && <LoadError message={error} retry={loadProfile} />}
        {children}
      </DashboardFrame>
      {profile && (
        <EditProfileDrawer
          open={editing}
          onOpenChange={setEditing}
          profile={profile}
          onSuccess={loadProfile}
        />
      )}
    </>
  );
}

export function LoadError({
  message,
  retry,
}: {
  message: string;
  retry: () => void;
}) {
  return (
    <div
      role="alert"
      className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-sm"
    >
      <p>{message}</p>
      <button
        type="button"
        onClick={retry}
        className="font-medium underline underline-offset-4"
      >
        Retry
      </button>
    </div>
  );
}
