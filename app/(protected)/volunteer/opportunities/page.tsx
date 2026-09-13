'use client';

import { useEffect, useState, useCallback } from 'react';
import { HeartHandshake } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { OrganizationOpportunity, OrganizationJoin } from '@/components/volunteers/types';
import OpportunityCard from '@/components/volunteers/opportunity-card';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const VolunteerOpportunitiesPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [opportunities, setOpportunities] = useState<OrganizationOpportunity[]>([]);
  const [joinedOpportunities, setJoinedOpportunities] = useState<OrganizationJoin[]>([]);
  const [joiningOpportunityId, setJoiningOpportunityId] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, opportunitiesResult, joinsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get(ENDPOINTS.VOLUNTEERS.ORGANIZATION_REQUESTS),
        axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_ORGANIZATION_JOINS)
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'opportunities-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (opportunitiesResult.status === 'fulfilled') {
        const data = opportunitiesResult.value.data?.data || opportunitiesResult.value.data;
        setOpportunities(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'opportunities-opportunities-error',
          title: 'Failed to load opportunities. Please try again.',
          type: 'error'
        });
      }
      if (joinsResult.status === 'fulfilled') {
        const data = joinsResult.value.data?.data || joinsResult.value.data;
        setJoinedOpportunities(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'opportunities-joins-error',
          title: 'Failed to load joined opportunities. Please try again.',
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

  const handleJoinOpportunity = async (oppId: string) => {
    setJoiningOpportunityId(oppId);
    try {
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.JOIN_ORGANIZATION_REQUEST(oppId));
      toast.add({
        id: `join-${oppId}`,
        title: 'Joined relief opportunity successfully!',
        type: 'success',
        timeout: 4000,
      });
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: `join-err-${oppId}`,
        title: getApiErrorMessage(err, 'Failed to join opportunity.'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setJoiningOpportunityId(null);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="VOLUNTEER"
        tab="opportunities"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Relief Organization Opportunities</h3>
            <p className="text-xs text-muted-foreground">
              Explore open volunteer calls published by authorized relief organizations.
            </p>
          </div>

          {opportunities.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <HeartHandshake className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No volunteer opportunities currently available.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {opportunities.map((opp) => {
                const isJoined = joinedOpportunities.some(
                  (j) => j.organization_request_id === opp.id
                );
                return (
                  <OpportunityCard
                    key={opp.id}
                    opportunity={opp}
                    joined={isJoined}
                    joining={joiningOpportunityId === opp.id}
                    onJoin={() => handleJoinOpportunity(opp.id)}
                  />
                );
              })}
            </div>
          )}
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

export default VolunteerOpportunitiesPage;