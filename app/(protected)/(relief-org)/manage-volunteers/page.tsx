'use client';

import React, { useEffect, useState } from 'react';
import { Plus, MoreHorizontal, FileEdit, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
                <TableHead className="font-bold text-foreground">Group Name</TableHead>
                <TableHead className="font-bold text-foreground">Volunteers</TableHead>
                <TableHead className="font-bold text-foreground">Location</TableHead>
                <TableHead className="font-bold text-foreground">Disaster</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    Loading volunteer groups...
                  </TableCell>
                </TableRow>
              ) : groups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center text-xs text-muted-foreground">
                    No volunteer groups found yet. Press &quot;+ Add Volunteer Group&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                groups.map((group) => (
                  <TableRow key={group.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">
                      {group.title}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground">
                      <span className="text-emerald-600 dark:text-emerald-400">
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
                    <TableCell className={`font-bold uppercase text-xs ${
                      group.status === 'open'
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-muted-foreground'
                    }`}>
                      {group.status === 'open' ? 'OPEN' : 'LOCKED'}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              className="size-8 text-muted-foreground hover:text-foreground"
                            />
                          }
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">Open menu</span>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44">
                          <DropdownMenuItem
                            onClick={() => {
                              setEditingGroup(group);
                              setIsDrawerOpen(true);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <FileEdit className="size-3.5 text-muted-foreground" />
                            <span>Update</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirmDeleteTarget(group)}
                            className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                          >
                            <Trash2 className="size-3.5" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
