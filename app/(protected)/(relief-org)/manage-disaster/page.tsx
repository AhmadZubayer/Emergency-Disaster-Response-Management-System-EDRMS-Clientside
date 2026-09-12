'use client';

import React, { useEffect, useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  FileEdit,
  ShieldCheck,
  Trash2,
  AlertCircle,
} from 'lucide-react';
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
import { publicApi } from '@/app/lib/public-api';
import { Disaster } from '@/components/disaster/types';
import AddDisasterDrawer from '@/components/disaster/add-disaster-drawer';

const ManageDisasterAlertPage = () => {
  const axiosSecure = useAxiosSecure();

  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingDisaster, setEditingDisaster] = useState<Disaster | null>(null);

  const [confirmSafeTarget, setConfirmSafeTarget] = useState<Disaster | null>(null);
  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<Disaster | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchDisasters = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/disaster');
      const data = res.data?.data || res.data || [];
      setDisasters(Array.isArray(data) ? data : []);
    } catch {
      setDisasters([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDisasters();
  }, []);

  const handleMarkSafe = async () => {
    if (!confirmSafeTarget) return;
    try {
      setActionLoading(true);
      await axiosSecure.patch(`/disaster/${confirmSafeTarget.id}/mark-safe`);
      setConfirmSafeTarget(null);
      await fetchDisasters();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDeleteTarget) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(`/disaster/${confirmDeleteTarget.id}`);
      setConfirmDeleteTarget(null);
      await fetchDisasters();
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
              Manage Disaster Alerts
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish, monitor, and update active emergency disaster warnings.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingDisaster(null);
              setIsDrawerOpen(true);
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-3.5" />
            Add New Alert
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold text-foreground">Name</TableHead>
                <TableHead className="font-bold text-foreground">Type</TableHead>
                <TableHead className="font-bold text-foreground">Location</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading disaster alerts...
                  </TableCell>
                </TableRow>
              ) : disasters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No disaster alerts found. Press &quot;+ Add New Alert&quot; to issue a warning.
                  </TableCell>
                </TableRow>
              ) : (
                disasters.map((d) => (
                  <TableRow key={d.id} className="text-xs">
                    <TableCell className="font-semibold text-foreground">
                      {d.disaster_name}
                    </TableCell>
                    <TableCell className="font-semibold text-foreground uppercase text-xs">
                      {d.type}
                    </TableCell>
                    <TableCell className="max-w-[160px] truncate text-muted-foreground">
                      {d.impacted_location}
                    </TableCell>
                    <TableCell className={`font-bold uppercase text-xs ${
                      d.is_verified
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {d.is_verified ? 'SAFE' : 'ACTIVE ALERT'}
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
                              setEditingDisaster(d);
                              setIsDrawerOpen(true);
                            }}
                            className="gap-2 cursor-pointer"
                          >
                            <FileEdit className="size-3.5 text-muted-foreground" />
                            <span>Update</span>
                          </DropdownMenuItem>
                          {!d.is_verified && (
                            <DropdownMenuItem
                              onClick={() => setConfirmSafeTarget(d)}
                              className="gap-2 cursor-pointer text-emerald-600 focus:text-emerald-600"
                            >
                              <ShieldCheck className="size-3.5" />
                              <span>Mark as Safe</span>
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => setConfirmDeleteTarget(d)}
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

      <AddDisasterDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={fetchDisasters}
        editDisaster={editingDisaster}
      />

      <MuiModal
        open={!!confirmSafeTarget}
        onClose={() => setConfirmSafeTarget(null)}
        title="Mark Disaster as Safe"
        maxWidth="xs"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmSafeTarget(null)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkSafe}
              disabled={actionLoading}
              className="text-xs font-semibold"
            >
              {actionLoading ? 'Updating...' : 'Yes, Mark Safe'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-1">
          <ShieldCheck className="size-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to mark <strong>{confirmSafeTarget?.disaster_name}</strong> as safe?
          </p>
        </div>
      </MuiModal>

      <MuiModal
        open={!!confirmDeleteTarget}
        onClose={() => setConfirmDeleteTarget(null)}
        title="Delete Disaster Alert"
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
            Are you sure you want to delete the alert for <strong>{confirmDeleteTarget?.disaster_name}</strong>? This action cannot be undone.
          </p>
        </div>
      </MuiModal>
    </div>
  );
};

export default ManageDisasterAlertPage;
