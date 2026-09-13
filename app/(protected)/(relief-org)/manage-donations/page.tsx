'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, MoreHorizontal, FileEdit, Eye, Trash2, AlertCircle } from 'lucide-react';
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
import { toast } from '@/components/ui/toast';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { publicApi } from '@/app/lib/public-api';
import { DonationCampaign } from '@/components/donations/types';
import AddDonationDrawer from '@/components/donations/add-donation-drawer';
import CampaignProgressDrawer from '@/components/donations/campaign-progress-drawer';

const ManageDonationPage = () => {
  const router = useRouter();
  const axiosSecure = useAxiosSecure();

  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);

  const [selectedProgressCampaign, setSelectedProgressCampaign] = useState<DonationCampaign | null>(null);
  const [isProgressDrawerOpen, setIsProgressDrawerOpen] = useState(false);

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
      toast.add({
        id: `delete-campaign-${confirmDeleteTarget.id}`,
        title: `Deleted donation campaign "${confirmDeleteTarget.title}".`,
        type: 'success',
        timeout: 4000,
      });
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

                  return (
                    <TableRow key={c.id} className="text-xs">
                      <TableCell className="font-semibold text-foreground">
                        {c.title}
                      </TableCell>
                      <TableCell className="font-semibold text-foreground">
                        ${target.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-semibold text-emerald-600 dark:text-emerald-400">
                        ${collected.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-600 dark:text-emerald-400 uppercase text-xs">
                        {c.status}
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
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem
                              onClick={() => {
                                setEditingCampaign(c);
                                setIsDrawerOpen(true);
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <FileEdit className="size-3.5 text-muted-foreground" />
                              <span>Edit View</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedProgressCampaign(c);
                                setIsProgressDrawerOpen(true);
                              }}
                              className="gap-2 cursor-pointer"
                            >
                              <Eye className="size-3.5 text-muted-foreground" />
                              <span>Progress & Requests</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setConfirmDeleteTarget(c)}
                              className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                            >
                              <Trash2 className="size-3.5" />
                              <span>Delete</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <CampaignProgressDrawer
        open={isProgressDrawerOpen}
        onClose={() => {
          setIsProgressDrawerOpen(false);
          setSelectedProgressCampaign(null);
        }}
        campaign={selectedProgressCampaign}
        onCampaignUpdated={fetchCampaigns}
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
