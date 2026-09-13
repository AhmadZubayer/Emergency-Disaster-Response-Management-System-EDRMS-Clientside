'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure, publicApi } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { VolunteerGroup } from '@/components/volunteers/types';
import AddVolunteerGroupDrawer from '@/components/volunteers/add-volunteer-group-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const ReliefOrgManageVolunteersPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [volunteerGroups, setVolunteerGroups] = useState<VolunteerGroup[]>([]);
  const [isGroupDrawerOpen, setIsGroupDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VolunteerGroup | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, groupsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        publicApi.get('/volunteers/groups')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'manage-volunteers-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (groupsResult.status === 'fulfilled') {
        const data = groupsResult.value.data?.data || groupsResult.value.data;
        setVolunteerGroups(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'manage-volunteers-groups-error',
          title: 'Failed to load groups. Please try again.',
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
        tab="manage-volunteers"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Volunteer Management & Task Forces</h3>
              <p className="text-xs text-muted-foreground">
                Organize registered field volunteers into specialized rescue squads.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingGroup(null);
                setIsGroupDrawerOpen(true);
              }}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-4" />
              Create Volunteer Group
            </Button>
          </div>

          {volunteerGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <Users className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">No volunteer groups created.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group Title</TableHead>
                    <TableHead>Disaster / Deployment</TableHead>
                    <TableHead>Capacity</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {volunteerGroups.map((g) => (
                    <TableRow key={g.id}>
                      <TableCell className="font-semibold text-xs">{g.title}</TableCell>
                      <TableCell className="text-xs">{g.disaster_name || 'General'}</TableCell>
                      <TableCell className="text-xs">{g.joined_volunteers || 0} / {g.needed_volunteers}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setEditingGroup(g);
                            setIsGroupDrawerOpen(true);
                          }}
                          className="h-8 px-2 text-xs"
                        >
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
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
      <AddVolunteerGroupDrawer
        open={isGroupDrawerOpen}
        onOpenChange={setIsGroupDrawerOpen}
        onSuccess={fetchPageData}
        editGroup={editingGroup}
      />
    </>
  );
};

export default ReliefOrgManageVolunteersPage;