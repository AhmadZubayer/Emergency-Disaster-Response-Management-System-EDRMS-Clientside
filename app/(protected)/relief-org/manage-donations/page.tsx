'use client';

import { useEffect, useState, useCallback } from 'react';
import { Plus, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure, publicApi } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { DonationCampaign } from '@/components/donations/types';
import AddDonationDrawer from '@/components/donations/add-donation-drawer';
import CampaignProgressDrawer from '@/components/donations/campaign-progress-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const ReliefOrgManageDonationsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [isDonationDrawerOpen, setIsDonationDrawerOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaign | null>(null);
  const [selectedProgressCampaign, setSelectedProgressCampaign] = useState<DonationCampaign | null>(null);
  const [isProgressDrawerOpen, setIsProgressDrawerOpen] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, campaignsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        publicApi.get('/donations/campaigns')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'manage-donations-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (campaignsResult.status === 'fulfilled') {
        const data = campaignsResult.value.data?.data || campaignsResult.value.data;
        setCampaigns(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'manage-donations-campaigns-error',
          title: 'Failed to load campaigns. Please try again.',
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
        tab="manage-donations"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold">Donation Campaigns Management</h3>
              <p className="text-xs text-muted-foreground">
                Track funds raised, disburse financial aid, and publish campaigns.
              </p>
            </div>
            <Button
              size="sm"
              onClick={() => {
                setEditingCampaign(null);
                setIsDonationDrawerOpen(true);
              }}
              className="rounded-xl gap-1.5 text-xs font-semibold"
            >
              <Plus className="size-4" />
              Create Campaign
            </Button>
          </div>

          {campaigns.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <HeartHandshake className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">No donation campaigns created.</p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Title</TableHead>
                    <TableHead>Raised / Target</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-semibold text-xs">{c.title}</TableCell>
                      <TableCell className="text-xs font-bold">${c.raised_amount} / ${c.target_amount}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {c.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedProgressCampaign(c);
                              setIsProgressDrawerOpen(true);
                            }}
                            className="h-8 px-2 text-xs"
                          >
                            Progress
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingCampaign(c);
                              setIsDonationDrawerOpen(true);
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
      <AddDonationDrawer
        open={isDonationDrawerOpen}
        onOpenChange={setIsDonationDrawerOpen}
        onSuccess={fetchPageData}
        editCampaign={editingCampaign}
      />
      <CampaignProgressDrawer
        campaign={selectedProgressCampaign}
        open={isProgressDrawerOpen}
        onClose={() => setIsProgressDrawerOpen(false)}
        onCampaignUpdated={fetchPageData}
      />
    </>
  );
};

export default ReliefOrgManageDonationsPage;