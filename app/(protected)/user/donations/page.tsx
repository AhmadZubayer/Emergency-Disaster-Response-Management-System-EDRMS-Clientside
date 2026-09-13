'use client';

import { useEffect, useState, useCallback } from 'react';
import { Download, HeartHandshake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { generateDonationReceipt } from '@/utils/generate-donation-receipt';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
interface UserDonation {
  id: string;
  campaign_id: string;
  campaign_title: string;
  amount: number;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  paid_at: string;
  created_at: string;
}

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
const UserDonationsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myDonations, setMyDonations] = useState<UserDonation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, donationsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/donations/my-donations')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'donations-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (donationsResult.status === 'fulfilled') {
        const data = donationsResult.value.data?.data || donationsResult.value.data;
        setMyDonations(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'donations-donations-error',
          title: 'Failed to load donations. Please try again.',
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
        role="USER"
        tab="donations"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Your Donation Contributions</h3>
            <p className="text-xs text-muted-foreground">
              History of humanitarian aid funds contributed through your account.
            </p>
          </div>

          {myDonations.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <HeartHandshake className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                You have not made any donations yet.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Gateway</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myDonations.map((d) => (
                    <TableRow key={d.id}>
                      <TableCell className="font-semibold text-xs">{d.campaign_title || 'Emergency Aid'}</TableCell>
                      <TableCell className="text-xs font-bold">${d.amount}</TableCell>
                      <TableCell className="text-xs uppercase">{d.payment_gateway}</TableCell>
                      <TableCell className="text-xs">{formatTrashDate(d.paid_at || d.created_at)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold text-emerald-600">
                          {d.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            generateDonationReceipt({
                              receiptNo: d.transaction_id || d.id,
                              date: formatTrashDate(d.paid_at || d.created_at),
                              receivedFrom: profile?.name || user?.name || 'Valued Donor',
                              contact: profile?.phone || user?.email || 'N/A',
                              donationAmount: Number(d.amount),
                              paymentMethod: d.payment_gateway,
                              transactionId: d.transaction_id || d.id,
                              campaignTitle: d.campaign_title || 'Emergency Relief Fund',
                              reliefOrg: 'Emergency Disaster Response Management System',
                            });
                          }}
                          className="h-8 px-2 text-xs rounded-xl gap-1"
                        >
                          <Download className="size-3.5" />
                          Receipt
                        </Button>
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

export default UserDonationsPage;