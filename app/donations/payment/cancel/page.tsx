'use client';

import React, { useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, ArrowLeft } from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { publicApi } from '@/lib/api';

const PaymentCancelContent = () => {
  const searchParams = useSearchParams();
  const txId = searchParams.get('tx_id');

  useEffect(() => {
    if (txId) {
      publicApi.get(`/donations/payment/cancel?tx_id=${txId}`).catch(() => {});
    }
  }, [txId]);

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto my-16 bg-card border border-border/60 rounded-2xl shadow-sm space-y-4">
      <div className="size-16 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive">
        <AlertCircle className="size-8" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">
        Donation Cancelled
      </h1>
      <p className="text-xs text-muted-foreground leading-relaxed">
        The payment session was cancelled. No charges were made to your account.
      </p>
      <div className="pt-2">
        <Button render={<Link href="/donations" />} variant="outline" className="gap-2">
          <ArrowLeft className="size-4" />
          <span>Back to All Campaigns</span>
        </Button>
      </div>
    </div>
  );
};

const PaymentCancelPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Suspense fallback={<div className="p-12 text-center text-xs text-muted-foreground">Loading...</div>}>
          <PaymentCancelContent />
        </Suspense>
      </main>
    </div>
  );
};

export default PaymentCancelPage;
