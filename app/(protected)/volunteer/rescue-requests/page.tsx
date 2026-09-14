'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileEdit, Trash2, Plus, Eye, MoreHorizontal, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MuiModal from '@/components/mui-modal';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { RescueRequest } from '@/components/rescue-requests/types';
import RescueRequestDetailsDrawer from '@/components/rescue-requests/rescue-request-details-drawer';
import AddRescueRequestDrawer from '@/components/rescue-requests/add-rescue-request-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const VolunteerRescueRequestsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myRescueRequests, setMyRescueRequests] = useState<RescueRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedRescueRequest, setSelectedRescueRequest] = useState<RescueRequest | null>(null);
  const [editingRescueRequest, setEditingRescueRequest] = useState<RescueRequest | null>(null);
  const [isRescueRequestDrawerOpen, setIsRescueRequestDrawerOpen] = useState(false);
  const [confirmTrashItem, setConfirmTrashItem] = useState<RescueRequest | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, rescueRequestsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/rescue-requests/my')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'rescue-requests-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (rescueRequestsResult.status === 'fulfilled') {
        const data = rescueRequestsResult.value.data?.data || rescueRequestsResult.value.data;
        setMyRescueRequests(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'rescue-requests-rescueRequests-error',
          title: 'Failed to load rescue requests. Please try again.',
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

  const handleMoveToTrash = async () => {
    if (!confirmTrashItem) return;
    try {
      setActionInProgress('moving-to-trash');
      const url = `/rescue-requests/${confirmTrashItem.id}`;
      await axiosSecure.delete(url);
      toast.add({
        id: `trash-success-${confirmTrashItem.id}`,
        title: 'Item moved to trash.',
        type: 'success',
        timeout: 4000,
      });
      setConfirmTrashItem(null);
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: 'trash-error',
        title: getApiErrorMessage(err, 'Failed to delete item'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="VOLUNTEER"
        tab="rescue-requests"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium">Your Rescue Requests</h3>
              <p className="text-xs text-muted-foreground">
                Track the deployment status of emergency extraction alerts you have posted.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingRescueRequest(null);
                setIsRescueRequestDrawerOpen(true);
              }}

            >
              <Plus className="size-4" />
              Request Rescue
            </Button>
          </div>

          {myRescueRequests.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border p-4 text-center bg-card space-y-3">
              <LifeBuoy className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                You have not submitted any emergency rescue requests.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-border overflow-hidden bg-card">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Location</TableHead>
                    <TableHead>People</TableHead>
                    <TableHead>Urgency</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myRescueRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell >{r.address}</TableCell>
                      <TableCell >{r.people_count}</TableCell>
                      <TableCell>
                        <Badge
                          variant={r.urgency_level === 'CRITICAL' ? 'destructive' : 'secondary'}
                          className="uppercase"
                        >
                          {r.urgency_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="uppercase">
                          {r.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedRescueRequest(r)}>
                              <Eye className="size-3.5 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingRescueRequest(r);
                                setIsRescueRequestDrawerOpen(true);
                              }}
                            >
                              <FileEdit className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setConfirmTrashItem(r);

                              }}
                              className="text-destructive"
                            >
                              <Trash2 className="size-3.5 mr-2" />
                              Move to Trash
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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
      <RescueRequestDetailsDrawer
        request={selectedRescueRequest}
        open={!!selectedRescueRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRescueRequest(null);
        }}
        onEdit={(r) => {
          setSelectedRescueRequest(null);
          setEditingRescueRequest(r);
          setIsRescueRequestDrawerOpen(true);
        }}
        onRefresh={fetchPageData}
      />
      <AddRescueRequestDrawer
        open={isRescueRequestDrawerOpen}
        onOpenChange={(open) => {
          setIsRescueRequestDrawerOpen(open);
          if (!open) setEditingRescueRequest(null);
        }}
        onSuccess={() => {
          fetchPageData();
          setEditingRescueRequest(null);
        }}
        editRequest={editingRescueRequest}
      />
      <MuiModal
        open={!!confirmTrashItem}
        onClose={() => setConfirmTrashItem(null)}
        title="Move Item to Trash?"
        actions={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmTrashItem(null)}

            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMoveToTrash}
              disabled={actionInProgress === 'moving-to-trash'}

            >
              <Trash2 className="size-3.5" />
              Move to Trash
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-medium text-foreground">
            {confirmTrashItem?.address}
          </span>
          ? This record will be moved to your Trash and can be restored within 30 days.
        </p>
      </MuiModal>
    </>
  );
};

export default VolunteerRescueRequestsPage;
