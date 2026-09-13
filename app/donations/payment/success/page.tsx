'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, Download, Loader2 } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/toast';
import { publicApi } from '@/app/lib/public-api';
import { generateDonationReceipt } from '@/lib/generate-donation-receipt';

const PaymentSuccessContent = () => {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const txId = searchParams.get('tx_id');
  const [loading, setLoading] = useState(true);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async (dataToUse?: any) => {
    const data = dataToUse || receiptData;
    if (!data) return;
    setDownloading(true);
    try {
      await generateDonationReceipt({
        receiptNo: data.transaction_id || txId || 'TXN-EDRMS',
        date: new Date(data.paid_at || Date.now()).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        receivedFrom: data.donor_name || (data.is_anonymous ? 'Anonymous Donor' : 'Valued Donor'),
        contact: data.donor_contact || (data.is_anonymous ? 'Anonymous' : 'N/A'),
        donationAmount: Number(data.amount || 0),
        paymentMethod: data.payment_gateway || 'STRIPE',
        transactionId: data.transaction_id || txId || 'N/A',
        campaignTitle: data.campaign_title || 'Emergency Relief Fund',
        reliefOrg: data.relief_org || 'Emergency Disaster Response Management System',
      });
    } catch {
    } finally {
      setDownloading(false);
    }
  };

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        if (sessionId && txId) {
          const res = await publicApi.get(`/donations/payment/success?session_id=${sessionId}&tx_id=${txId}`);
          const payload = res.data?.data || res.data;
          setReceiptData(payload);

          toast.add({
            title: 'Thank you for your contribution to the mankind.',
            type: 'success',
            timeout: 10000,
            actionProps: {
              children: 'Download Receipt',
              onClick: () => handleDownload(payload),
            },
          });
        }
      } catch {
      } finally {
        setLoading(false);
      }
    };
    verifyPayment();
  }, [sessionId, txId]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4">
      <div className="size-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
        <CheckCircle2 className="size-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Thank You for Your Donation!
      </h1>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Your payment has been successfully processed through Stripe. Reference ID: <span className="font-mono font-semibold">{txId || 'N/A'}</span>.
      </p>

      {loading ? (
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="size-4 animate-spin" />
          <span>Verifying transaction...</span>
        </div>
      ) : (
        <div className="pt-2 flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
          <Button
            onClick={() => handleDownload()}
            disabled={downloading}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto"
          >
            {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            <span>Download Receipt</span>
          </Button>
          <Button
            variant="outline"
            render={<Link href="/donations" />}
            className="gap-2 w-full sm:w-auto"
          >
            <span>Return to Donations</span>
            <ArrowRight className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const PaymentSuccessPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Verifying donation...</div>}>
          <PaymentSuccessContent />
        </Suspense>
      </main>
    </div>
  );
};

export default PaymentSuccessPage;
