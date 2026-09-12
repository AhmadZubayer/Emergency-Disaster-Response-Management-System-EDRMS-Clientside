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
import { publicApi } from '@/app/lib/public-api';
import { DonationCampaign } from '@/components/donations/types';
import AddDonationDrawer from '@/components/donations/add-donation-drawer';

const ManageDonationPage = () => {
  const axiosSecure = useAxiosSecure();

  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);

  const [confirmDeleteTarget, setConfirmDeleteTarget] = useState<DonationCampaign | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchCampaigns = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get('/donations/campaigns');
      const data = res.data?.data || res.data || [];
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleDelete = async () => {
    if (!confirmDeleteTarget) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(`/donations/campaigns/${confirmDeleteTarget.id}`);
      setConfirmDeleteTarget(null);
      await fetchCampaigns();
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
              Manage Donations & Financial Aid
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Oversee relief campaigns, monitor fundraising targets, and manage aid allocations.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingCampaign(null);
              setIsDrawerOpen(true);
            }}
            size="sm"
            className="gap-1.5 text-xs font-semibold shrink-0"
          >
            <Plus className="size-3.5" />
            Add New Donation
          </Button>
        </div>

        <div className="rounded-xl border border-border/70 bg-card overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40 text-xs">
                <TableHead className="font-bold text-foreground">Name</TableHead>
                <TableHead className="font-bold text-foreground">Expected Target</TableHead>
                <TableHead className="font-bold text-foreground">Target Collected</TableHead>
                <TableHead className="font-bold text-foreground">Status</TableHead>
                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    Loading donation campaigns...
                  </TableCell>
                </TableRow>
              ) : campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No donation campaigns found. Press &quot;+ Add New Donation&quot; to create one.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((c) => {
                  const target = Number(c.target_amount) || 0;
                  const collected = Number(c.raised_amount) || 0;
                  const progressPct = target > 0 ? Math.min(100, Math.round((collected / target) * 100)) : 0;

                  return (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell>
                        <div className="font-semibold text-foreground">{c.title}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {c.start_date ? new Date(c.start_date).toLocaleDateString() : 'N/A'} -{' '}
                          {c.end_date ? new Date(c.end_date).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ${target.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="font-semibold text-emerald-600 dark:text-emerald-400">
                          ${collected.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-muted-foreground font-medium">
                          {progressPct}% funded
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            c.status === 'active'
                              ? 'default'
                              : c.status === 'completed'
                              ? 'secondary'
                              : 'destructive'
                          }
                          className="text-[10px] uppercase font-bold"
                        >
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingCampaign(c);
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
                            onClick={() => setConfirmDeleteTarget(c)}
                            className="h-7 text-xs px-2 gap-1"
                          >
                            <Trash2 className="size-3" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <AddDonationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={fetchCampaigns}
        editCampaign={editingCampaign}
      />

      <MuiModal
        open={!!confirmDeleteTarget}
        onClose={() => setConfirmDeleteTarget(null)}
        title="Delete Donation Campaign"
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
            Are you sure you want to delete <strong>{confirmDeleteTarget?.title}</strong>? All records associated with this campaign will be affected.
          </p>
        </div>
      </MuiModal>
    </div>
  );
};

export default ManageDonationPage;
