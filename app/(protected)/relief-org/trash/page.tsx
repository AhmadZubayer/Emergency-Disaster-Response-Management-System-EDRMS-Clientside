'use client';

import { useEffect, useState, useCallback } from 'react';
import { Trash2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
interface TrashItemData {
  id: string;
  item_id: string;
  item_type: 'MISSING_PERSON' | 'RESCUE_REQUEST' | 'COMMUNITY_POST';
  item_title: string;
  deleted_at: string;
  expires_at: string;
}

const formatTrashType = (type: string) => {
  switch (type) {
    case 'MISSING_PERSON':
      return 'Missing person';
    case 'RESCUE_REQUEST':
      return 'Rescue request';
    case 'COMMUNITY_POST':
      return 'Community post';
    default:
      return type;
  }
};

const formatTrashDate = (dateStr?: string) => {
  if (!dateStr) return 'N/A';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};
const ReliefOrgTrashPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myTrashItems, setMyTrashItems] = useState<TrashItemData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, trashResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/trash')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'trash-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (trashResult.status === 'fulfilled') {
        const data = trashResult.value.data?.data || trashResult.value.data;
        setMyTrashItems(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'trash-trash-error',
          title: 'Failed to load trash. Please try again.',
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

  const handleRestore = async (id: string, title: string) => {
    try {
      setActionInProgress(`restore-${id}`);
      await axiosSecure.post(`/trash/${id}/restore`);
      toast.add({
        id: `restore-${id}`,
        title: `Restored "${title}" successfully`,
        type: 'success',
        timeout: 4000,
      });
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: `restore-error-${id}`,
        title: getApiErrorMessage(err, 'Failed to restore item'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };

  const handleDeletePermanently = async (id: string, title: string) => {
    try {
      setActionInProgress(`delete-${id}`);
      await axiosSecure.delete(`/trash/${id}`);
      toast.add({
        id: `delete-${id}`,
        title: `Permanently deleted "${title}"`,
        type: 'success',
        timeout: 4000,
      });
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: `delete-error-${id}`,
        title: getApiErrorMessage(err, 'Failed to permanently delete item'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setActionInProgress(null);
    }
  };

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
        tab="trash"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-destructive">Trash & Recycling Bin</h3>
            <p className="text-xs text-muted-foreground">
              Deleted reports, requests, and posts. Items are permanently deleted automatically after 30 days.
            </p>
          </div>

          {myTrashItems.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <Trash2 className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">Your trash bin is currently empty.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Item</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date deleted</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myTrashItems.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-semibold text-xs">{item.item_title}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px] uppercase font-bold">
                          {formatTrashType(item.item_type)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">{formatTrashDate(item.deleted_at)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRestore(item.id, item.item_title)}
                            disabled={actionInProgress === `restore-${item.id}`}
                            className="h-8 px-3 rounded-xl gap-1 text-xs"
                          >
                            {actionInProgress === `restore-${item.id}` ? (
                              <Spinner className="size-3" />
                            ) : (
                              <RotateCcw className="size-3" />
                            )}
                            Restore
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeletePermanently(item.id, item.item_title)}
                            disabled={actionInProgress === `delete-${item.id}`}
                            className="h-8 px-3 rounded-xl gap-1 text-xs text-destructive hover:bg-destructive/10"
                          >
                            {actionInProgress === `delete-${item.id}` ? (
                              <Spinner className="size-3" />
                            ) : (
                              <Trash2 className="size-3" />
                            )}
                            Delete
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
    </>
  );
};

export default ReliefOrgTrashPage;