'use client';

import React, { useEffect, useState } from 'react';
import { Plus, FileEdit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MuiModal from '@/components/mui-modal';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { VolunteerGroup } from '@/components/volunteers/types';
import AddVolunteerGroupDrawer from '@/components/volunteers/add-volunteer-group-drawer';

const ManageVolunteerGroupsPage = () => {
  const axiosSecure = useAxiosSecure();

  const [groups, setGroups] = useState<VolunteerGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VolunteerGroup | null>(null);

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<VolunteerGroup | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axiosSecure.get('/volunteers/organization-requests/my-created');
      const data = res.data?.data || res.data || [];
      setGroups(Array.isArray(data) ? data : []);
    } catch {
      setGroups([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleDelete = async () => {
    if (!confirmDeleteTarget) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(
        `/volunteers/organization-requests/${confirmDeleteTarget.id}`
      );
      setConfirmDeleteTarget(null);
      await fetchGroups();
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="w-full lg:w-[55vw] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Manage Volunteer Groups
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Coordinate volunteer relief teams, dispatch field operations, and assign tasks.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingGroup(null);
              setIsDrawerOpen(true);
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-3.5" />
            Add Volunteer Group
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold text-foreground">Group No</TableHead>
                <TableHead className="font-bold text-foreground">No of Volunteers</TableHead>
                <TableHead className="font-bold text-foreground">Location</TableHead>
                <TableHead className="font-bold text-foreground">Disaster</TableHead>
                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading volunteer groups...
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-40 text-center text-xs text-muted-foreground">
                    <div className="flex flex-col items-center justify-center gap-2 py-4">
                      <p>No volunteer groups found yet.</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingGroup(null);
                          setIsDrawerOpen(true);
                        }}
                        className="gap-1 text-xs font-medium"
                      >
                        <Plus className="size-3.5" />
                        Add Volunteer Group
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">
                      <div>{group.title}</div>
                      <Badge
                        variant={group.status === 'open' ? 'default' : 'secondary'}
                        className="text-[9px] uppercase px-1.5 py-0 mt-0.5"
                      >
                        {group.status === 'open' ? 'Accepting' : 'Locked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium text-foreground">
                      <span className="text-emerald-600 font-bold">
                        {group.joined_volunteers || 0}
                      </span>
                      <span className="text-muted-foreground"> / {group.needed_volunteers}</span>
                    </TableCell>
                    <TableCell className="max-w-[140px] truncate text-muted-foreground">
                      {group.location}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {group.disaster_name || 'General / None'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingGroup(group);
                            setIsDrawerOpen(true);
                          }}
                          className="h-7 text-xs px-2 gap-1"
                        >
                          <FileEdit className="size-3" />
                          Update
                        </Button>

                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setConfirmDeleteTarget(group)}
                          className="h-7 text-xs px-2 gap-1"
                        >
                          <Trash2 className="size-3" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddVolunteerGroupDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={fetchGroups}
        editGroup={editingGroup}
      />

      <MuiModal
        open={!!confirmDeleteTarget}
        onClose={() => setConfirmDeleteTarget(null)}
        title="Delete Volunteer Group"
        maxWidth="xs"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={actionLoading}
              className="text-xs font-semibold"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-1">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to delete <strong>{confirmDeleteTarget?.title}</strong>? All registered join requests will be cancelled.
          </p>
        </div>
      </MuiModal>
    </div>
  );
};

export default ManageVolunteerGroupsPage;
