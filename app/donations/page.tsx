'use client';

import React, { useEffect, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { HeartHandshake, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import Search from '@/components/Search';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/components/ui/toast';
import { publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import DonationCard from '@/components/donations/donation-card';
import { DonationCampaign } from '@/components/donations/types';
import AddDonationDrawer from '@/components/donations/add-donation-drawer';
import { generateDonationReceipt } from '@/utils/generate-donation-receipt';

const DonationsContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const paymentStatus = searchParams?.get('payment');
  const sessionId = searchParams?.get('session_id');
  const txId = searchParams?.get('tx_id');

  const [campaigns, setCampaigns] = useState<DonationCampaign[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCampaigns = useCallback(async (search?: string) => {
    try {
      setLoading(true);
      const url = search?.trim()
        ? `/donations/campaigns?search=${encodeURIComponent(search.trim())}`
        : '/donations/campaigns';
      const res = await publicApi.get(url);
      const data = res.data?.data || res.data || [];
      setCampaigns(Array.isArray(data) ? data : []);
    } catch {
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCampaigns();
  }, [fetchCampaigns]);

  const handleSearchChange = (val: string) => {
    setSearchTerm(val);
    fetchCampaigns(val);
  };

  const hasVerifiedRef = React.useRef(false);

  useEffect(() => {
    if (paymentStatus === 'success' && (sessionId || txId) && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      const verifyAndToast = async () => {
        try {
          const res = await publicApi.get(`/donations/payment/success?session_id=${sessionId || ''}&tx_id=${txId || ''}`);
          const payload = res.data?.data || res.data;
          fetchCampaigns();

          toast.add({
            id: 'donation-payment-success-toast',
            title: 'Thank you for your contribution to the mankind.',
            type: 'success',
            timeout: 12000,
            actionProps: {
              children: 'Download Receipt',
              onClick: () => {
                generateDonationReceipt({
                  receiptNo: payload.transaction_id || txId || 'TXN-EDRMS',
                  date: new Date(payload.paid_at || Date.now()).toLocaleDateString('en-GB', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  }),
                  receivedFrom: payload.donor_name || (payload.is_anonymous ? 'Anonymous Donor' : 'Valued Donor'),
                  contact: payload.donor_contact || (payload.is_anonymous ? 'Anonymous' : 'N/A'),
                  donationAmount: Number(payload.amount || 0),
                  paymentMethod: payload.payment_gateway || 'STRIPE',
                  transactionId: payload.transaction_id || txId || 'N/A',
                  campaignTitle: payload.campaign_title || 'Emergency Relief Fund',
                  reliefOrg: payload.relief_org || 'Emergency Disaster Response Management System',
                });
              },
            },
          });

          const url = new URL(window.location.href);
          url.searchParams.delete('payment');
          url.searchParams.delete('session_id');
          url.searchParams.delete('tx_id');
          window.history.replaceState({}, '', url.pathname);
        } catch {
        }
      };
      verifyAndToast();
    }
  }, [paymentStatus, sessionId, txId, fetchCampaigns]);

  const handleAddClick = () => {
    if (user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') {
      setIsDrawerOpen(true);
    } else {
      router.push('/manage-donations');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-border/60 pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Emergency Relief Funds & Donations
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Direct financial support, emergency aid funds, and rehabilitation campaigns for affected communities.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
            {(user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') && (
              <Button onClick={handleAddClick} className="h-10 gap-2 font-medium">
                <Plus className="size-4" />
                Add Campaign
              </Button>
            )}

            <Search
              value={searchTerm}
              onChange={handleSearchChange}
              onSubmit={() => fetchCampaigns(searchTerm)}
              placeholder="Search campaigns, relief..."
            />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div key={idx} className="p-5 rounded-2xl border border-border/60 bg-card space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="h-3.5 w-full" />
                <Skeleton className="h-3.5 w-4/5" />
                <Skeleton className="h-3 w-full rounded-full" />
                <div className="flex items-center justify-between pt-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-border/60 bg-muted/10 space-y-3">
            <HeartHandshake className="size-10 text-muted-foreground/60" />
            <h3 className="text-base font-semibold">No relief campaigns found</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              {searchTerm
                ? 'Try adjusting your search term to find matching campaigns.'
                : 'There are currently no active donation campaigns in the system.'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((campaign) => (
              <DonationCard
                key={campaign.id}
                campaign={campaign}
                onClick={() => router.push(`/donations/${campaign.id}`)}
              />
            ))}
          </div>
        )}
      </main>

      <AddDonationDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        onSuccess={() => fetchCampaigns(searchTerm)}
      />
    </div>
  );
};

const DonationsPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <div className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-12 w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-48 rounded-2xl" />
              ))}
            </div>
          </div>
        </div>
      }
    >
      <DonationsContent />
    </Suspense>
  );
};

export default DonationsPage;
