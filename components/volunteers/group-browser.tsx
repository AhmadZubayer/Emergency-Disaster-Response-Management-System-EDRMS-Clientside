'use client';

import { useCallback, useEffect, useState } from 'react';
import { isAxiosError } from 'axios';
import { UsersRound } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from '@/components/ui/toast';
import { getApiErrorMessage } from '@/utils/api-error';
import OperationsDashboard, { LoadError } from './operations-dashboard';
import RegistrationNotice from './registration-notice';
import OpportunityCard from './opportunity-card';
import {
  OrganizationJoin,
  OrganizationOpportunity,
  VolunteerProfile,
} from './types';

export default function GroupBrowser({
  tab = 'groups',
}: {
  tab?: 'groups' | 'opportunities';
}) {
  const { user } = useAuth();
  const [groups, setGroups] = useState<OrganizationOpportunity[]>([]);
  const [applications, setApplications] = useState<OrganizationJoin[]>([]);
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState<string | null>(null);
  const load = useCallback(() => {
    return Promise.all([
      axiosSecure.get(ENDPOINTS.VOLUNTEERS.ORGANIZATION_REQUESTS),
      axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_ORGANIZATION_JOINS),
      axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME).catch((error: unknown) => {
        if (isAxiosError(error) && error.response?.status === 404) return null;
        throw error;
      }),
    ])
      .then(([groups, applications, profile]) => {
        setError('');
        setGroups(groups.data?.data ?? groups.data);
        setApplications(applications.data?.data ?? applications.data);
        setProfile(profile ? (profile.data?.data ?? profile.data) : null);
      })
      .catch((error: unknown) => {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load volunteer groups. Please retry.',
          ),
        );
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const apply = async (id: string) => {
    setSubmitting(id);
    try {
      await axiosSecure.post(
        ENDPOINTS.VOLUNTEERS.JOIN_ORGANIZATION_REQUEST(id),
      );
      toast.add({
        id: 'group-applied',
        title: 'Application sent to the relief organization.',
        type: 'success',
      });
      await load();
    } catch (error) {
      toast.add({
        id: 'group-apply-error',
        title: getApiErrorMessage(error, 'Unable to submit your application.'),
        type: 'error',
      });
    } finally {
      setSubmitting(null);
    }
  };
  // Keep closed groups visible when the volunteer has already applied or joined.
  const visibleGroups = new Map(groups.map((group) => [group.id, group]));
  for (const application of applications) {
    if (
      application.organization_request &&
      !visibleGroups.has(application.organization_request_id)
    ) {
      visibleGroups.set(
        application.organization_request_id,
        application.organization_request,
      );
    }
  }

  return (
    <OperationsDashboard role="VOLUNTEER" tab={tab}>
      <div className="space-y-5">
        <div>
          <h1 className="text-base font-semibold">
            {tab === 'groups'
              ? 'Volunteer Groups'
              : 'Relief Organization Opportunities'}
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            Explore relief organization groups, apply to join, and track your
            application status.
          </p>
        </div>
        {loading ? (
          <p role="status" className="py-8 text-sm text-muted-foreground">
            Loading volunteer groups...
          </p>
        ) : error ? (
          <LoadError message={error} retry={load} />
        ) : (
          <>
            <RegistrationNotice profile={profile} />
            {visibleGroups.size === 0 ? (
              <div className="rounded-lg border border-dashed bg-card p-10 text-center space-y-3">
                <UsersRound className="mx-auto size-8 text-muted-foreground" />
                <p className="text-sm">No volunteer groups available yet.</p>
                <p className="text-xs text-muted-foreground">
                  Groups published by relief organizations will appear here.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {[...visibleGroups.values()].map((group) => (
                  <OpportunityCard
                    key={group.id}
                    opportunity={group}
                    applicationStatus={
                      applications.find(
                        (a) => a.organization_request_id === group.id,
                      )?.status
                    }
                    canApply={profile?.verification_status === 'verified'}
                    joining={submitting === group.id}
                    onJoin={() => apply(group.id)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </OperationsDashboard>
  );
}
