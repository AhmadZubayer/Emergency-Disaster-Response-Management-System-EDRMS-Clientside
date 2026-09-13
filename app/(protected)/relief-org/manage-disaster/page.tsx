'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure, publicApi } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { Disaster } from '@/components/disaster/types';
import AddDisasterDrawer from '@/components/disaster/add-disaster-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const ReliefOrgManageDisasterPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [isDisasterDrawerOpen, setIsDisasterDrawerOpen] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState<Disaster | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, disastersResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        publicApi.get('/disaster')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'manage-disaster-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (disastersResult.status === 'fulfilled') {
        const data = disastersResult.value.data?.data || disastersResult.value.data;
        setDisasters(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'manage-disaster-disasters-error',
          title: 'Failed to load disasters. Please try again.',
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
        tab="manage-disaster"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Disaster Warnings Management</h3>
              <p className="text-xs text-muted-foreground">
                Broadcast emergency alerts, manage affected regions, and issue all-clear notices.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingDisaster(null);
                setIsDisasterDrawerOpen(true);
              }}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-4" />
              Add Disaster Alert
            </Button>
          </div>

          {disasters.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <AlertTriangle className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">No active disaster alerts registered.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Disaster</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {disasters.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold text-xs">{d.disaster_name}</TableCell>
                      <TableCell className="text-xs capitalize">{d.type}</TableCell>
                      <TableCell className="text-xs">{d.impacted_location}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {d.is_verified ? 'Safe / Resolved' : 'Active Warning'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => router.push(`/disaster/${d.id}`)}
                            className="h-8 px-2 text-xs"
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingDisaster(d);
                              setIsDisasterDrawerOpen(true);
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            Edit
                          </Button>
                        </div>
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
      <AddDisasterDrawer
        open={isDisasterDrawerOpen}
        onOpenChange={setIsDisasterDrawerOpen}
        onSuccess={fetchPageData}
        editDisaster={editingDisaster}
      />
    </>
  );
};

export default ReliefOrgManageDisasterPage;