'use client';

import { useEffect, useState, useCallback } from 'react';
import { User, FileEdit, Trash2, Plus, Eye, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import MuiModal from '@/components/mui-modal';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import MissingPersonDetailsDrawer from '@/components/missing-persons/missing-person-details-drawer';
import AddMissingPersonDrawer from '@/components/missing-persons/add-missing-person-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const ReliefOrgMissingPersonsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myMissingPersons, setMyMissingPersons] = useState<MissingPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<MissingPerson | null>(null);
  const [isMissingPersonDrawerOpen, setIsMissingPersonDrawerOpen] = useState(false);
  const [confirmTrashItem, setConfirmTrashItem] = useState<MissingPerson | null>(null);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, missingPersonsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/missing-persons/my')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'missing-persons-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (missingPersonsResult.status === 'fulfilled') {
        const data = missingPersonsResult.value.data?.data || missingPersonsResult.value.data;
        setMyMissingPersons(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'missing-persons-missingPersons-error',
          title: 'Failed to load missing-person reports. Please try again.',
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
      const url = `/missing-persons/${confirmTrashItem.id}`;
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
        role="RELIEF_ORG"
        tab="missing-persons"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Your Missing Person Reports</h3>
              <p className="text-xs text-muted-foreground">
                Manage individuals you have reported missing during active crises.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingPerson(null);
                setIsMissingPersonDrawerOpen(true);
              }}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-4" />
              Report Missing Person
            </Button>
          </div>

          {myMissingPersons.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <User className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                You have not filed any missing person reports.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Full Name</TableHead>
                    <TableHead>Age</TableHead>
                    <TableHead>Last Seen Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myMissingPersons.map((p) => (
                    <TableRow key={p.id}>
                      <TableCell className="font-semibold text-xs">{p.full_name}</TableCell>
                      <TableCell className="text-xs">{p.age || 'N/A'}</TableCell>
                      <TableCell className="text-xs">{p.last_seen_location}</TableCell>
                      <TableCell>
                        <Badge
                          variant={p.status === 'found' ? 'default' : 'secondary'}
                          className="text-[10px] uppercase font-bold"
                        >
                          {p.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="h-8 w-8 p-0 inline-flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground">
                            <MoreHorizontal className="size-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setSelectedPerson(p)}>
                              <Eye className="size-3.5 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingPerson(p);
                                setIsMissingPersonDrawerOpen(true);
                              }}
                            >
                              <FileEdit className="size-3.5 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setConfirmTrashItem(p);

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
      <MissingPersonDetailsDrawer
        person={selectedPerson}
        open={!!selectedPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
        onEdit={(p) => {
          setSelectedPerson(null);
          setEditingPerson(p);
          setIsMissingPersonDrawerOpen(true);
        }}
        onRefresh={fetchPageData}
      />
      <AddMissingPersonDrawer
        open={isMissingPersonDrawerOpen}
        onOpenChange={(open) => {
          setIsMissingPersonDrawerOpen(open);
          if (!open) setEditingPerson(null);
        }}
        onSuccess={() => {
          fetchPageData();
          setEditingPerson(null);
        }}
        editPerson={editingPerson}
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
              className="rounded-xl"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleMoveToTrash}
              disabled={actionInProgress === 'moving-to-trash'}
              className="rounded-xl gap-1.5"
            >
              <Trash2 className="size-3.5" />
              Move to Trash
            </Button>
          </>
        }
      >
        <p className="text-xs text-muted-foreground">
          Are you sure you want to delete{' '}
          <span className="font-semibold text-foreground">
            {confirmTrashItem?.full_name}
          </span>
          ? This record will be moved to your Trash and can be restored within 30 days.
        </p>
      </MuiModal>
    </>
  );
};

export default ReliefOrgMissingPersonsPage;