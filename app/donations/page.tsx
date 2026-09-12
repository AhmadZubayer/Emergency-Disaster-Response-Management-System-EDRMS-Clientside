'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, HeartHandshake, Plus } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { publicApi } from '@/app/lib/public-api';
import useAuth from '@/app/hooks/useAuth';
import DonationCard from '@/components/donations/donation-card';
import { DonationCampaign } from '@/components/donations/types';
import AddDonationDrawer from '@/components/donations/add-donation-drawer';
import { generateDonationReceipt } from '@/lib/generate-donation-receipt';

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
  }, [paymentStatus, sessionId, txId]);

  const handleAddClick = () => {
    if (user?.role === 'RELIEF_ORG' || user?.role === 'ADMIN') {
      setIsDrawerOpen(true);
    } else {
      router.push('/manage-donations');
    }
  };

  const filteredCampaigns = campaigns.filter((c) => {
    const term = searchTerm.toLowerCase();
    return (
      c.title?.toLowerCase().includes(term) ||
      c.description?.toLowerCase().includes(term)
    );
  });

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

            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search campaigns, relief..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 h-10 bg-card border-border/60"
              />
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-36 rounded-2xl bg-muted/40 animate-pulse border border-border/40"
              />
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
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
            {filteredCampaigns.map((campaign) => (
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
        onSuccess={fetchCampaigns}
      />
    </div>
  );
};

const DonationsPage = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-background" />}>
      <DonationsContent />
    </Suspense>
  );
};

export default DonationsPage;
