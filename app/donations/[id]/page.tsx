'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  HeartHandshake,
  ArrowLeft,
  AlertCircle,
  Calendar,
  DollarSign,
  Users,
  Send,
  X,
  Upload,
  FileText,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import MuiModal from '@/components/mui-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from '@/components/ui/toast';
import ModernButton from '@/components/modernBtn';
import { cn } from 'cn';
import { axiosSecure, publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import { DonationCampaign } from '@/components/donations/types';
import { makeDonationSchema } from '@/lib/validations/make-donation-schema';
import { applyAidSchema } from '@/lib/validations/apply-aid-schema';
import { generateDonationReceipt } from '@/utils/generate-donation-receipt';

const chartConfig = {
  amount: {
    label: 'Amount ($)',
    color: '#10b981',
  },
} satisfies ChartConfig;

const DonationDetailContent = () => {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id as string;
  const paymentStatus = searchParams?.get('payment');
  const sessionId = searchParams?.get('session_id');
  const txId = searchParams?.get('tx_id');

  const [campaign, setCampaign] = useState<DonationCampaign | null>(null);
  const [loading, setLoading] = useState(true);

  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false);
  const [isRequestAidModalOpen, setIsRequestAidModalOpen] = useState(false);

  const [donationAmount, setDonationAmount] = useState<number>(50);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [donationErrors, setDonationErrors] = useState<Record<string, string>>({});

  const [aidReason, setAidReason] = useState('');
  const [paymentMode, setPaymentMode] = useState<'bank' | 'mfs'>('bank');
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [accountPhoneNumber, setAccountPhoneNumber] = useState('');
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [aidErrors, setAidErrors] = useState<Record<string, string>>({});
  const [submittingAid, setSubmittingAid] = useState(false);
  const [aidServerMsg, setAidServerMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [submittingModal, setSubmittingModal] = useState(false);
  const [modalServerMsg, setModalServerMsg] = useState('');

  const handleProofFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedProofFile(file);
    }
  };

  const fetchCampaign = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get(`/donations/campaigns/${id}`);
      const data = res.data?.data || res.data;
      setCampaign(data);
    } catch {
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  };

  const hasVerifiedRef = React.useRef(false);

  useEffect(() => {
    if (paymentStatus === 'success' && (sessionId || txId) && !hasVerifiedRef.current) {
      hasVerifiedRef.current = true;
      const verifyAndToast = async () => {
        try {
          const res = await publicApi.get(`/donations/payment/success?session_id=${sessionId || ''}&tx_id=${txId || ''}`);
          const payload = res.data?.data || res.data;
          fetchCampaign();

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

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      setDonorName(user.name || '');
      setDonorEmail(user.email || '');
    }
  }, [user]);

  const target = Number(campaign?.target_amount) || 0;
  const collected = Number(campaign?.raised_amount) || 0;
  const remaining = Math.max(0, target - collected);
  const donorsCount = campaign?.donors_count || 0;
  const maxAllowedAmount = target > 0 ? target : 100000;

  const chartData = [
    { metric: 'Raised', amount: collected, fill: '#10b981' },
    { metric: 'Remaining', amount: remaining, fill: '#64748b' },
    { metric: 'Goal Target', amount: target, fill: '#059669' },
  ];

  const validateDonation = () => {
    const schema = makeDonationSchema(maxAllowedAmount, isAnonymous);
    const result = schema.safeParse({
      amount: Number(donationAmount),
      donorName: isAnonymous ? undefined : donorName,
      donorEmail: isAnonymous ? undefined : donorEmail,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errMap[issue.path[0] as string] = issue.message;
        }
      });
      setDonationErrors(errMap);
      return false;
    }
    setDonationErrors({});
    return true;
  };

  const handleMakeDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    if (!validateDonation()) return;

    setSubmittingModal(true);
    setModalServerMsg('');

    try {
      const payload = {
        amount: Number(donationAmount),
        donor_name: isAnonymous ? undefined : donorName.trim(),
        donor_email: isAnonymous ? undefined : donorEmail.trim(),
        is_anonymous: isAnonymous,
        payment_gateway: 'stripe',
      };

      const res = await publicApi.post(`/donations/campaigns/${campaign.id}/donate`, payload);
      const data = res.data?.data || res.data;

      if (data?.checkout_url) {
        window.location.href = data.checkout_url;
      } else {
        setModalServerMsg('Donation initiated successfully.');
      }
    } catch (err: any) {
      setModalServerMsg(
        err?.response?.data?.message || 'Failed to initiate donation. Please try again.'
      );
    } finally {
      setSubmittingModal(false);
    }
  };

  const validateAidForm = () => {
    const payload =
      paymentMode === 'bank'
        ? {
            paymentMode: 'bank' as const,
            reason: aidReason.trim(),
            bankName: bankName.trim(),
            branchName: branchName.trim(),
            bankAccountNo: bankAccountNo.trim(),
          }
        : {
            paymentMode: 'mfs' as const,
            reason: aidReason.trim(),
            accountPhoneNumber: accountPhoneNumber.trim(),
          };

    const result = applyAidSchema.safeParse(payload);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errMap[issue.path[0] as string] = issue.message;
        }
      });
      setAidErrors(errMap);
      return false;
    }
    setAidErrors({});
    return true;
  };

  const handleRequestAid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    if (!validateAidForm()) return;

    setSubmittingAid(true);
    setAidServerMsg(null);

    const payoutDetails =
      paymentMode === 'bank'
        ? `Bank: ${bankName.trim()}, Branch: ${branchName.trim()}, Account No: ${bankAccountNo.trim()}`
        : `MFS: ${accountPhoneNumber.trim()}`;

    try {
      const formData = new FormData();
      formData.append('reason', aidReason.trim());
      formData.append('payout_details', payoutDetails);
      if (selectedProofFile) {
        formData.append('file', selectedProofFile);
      }

      await axiosSecure.post(`/donations/campaigns/${campaign.id}/apply`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      setAidServerMsg({
        type: 'success',
        text: 'Your donation aid request has been submitted successfully!',
      });

      toast.add({
        id: 'aid-application-success-toast',
        title: 'Aid application submitted successfully.',
        type: 'success',
        timeout: 6000,
      });

      setTimeout(() => {
        setIsRequestAidModalOpen(false);
        setAidServerMsg(null);
        setAidReason('');
        setBankName('');
        setBranchName('');
        setBankAccountNo('');
        setAccountPhoneNumber('');
        setSelectedProofFile(null);
        setAidErrors({});
      }, 1200);
    } catch (err: any) {
      setAidServerMsg({
        type: 'error',
        text: err?.response?.data?.message || 'Failed to submit aid application. Please try again.',
      });
    } finally {
      setSubmittingAid(false);
    }
  };

  const photoFullUrl = campaign?.photo_url
    ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${campaign.photo_url}`
    : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/donations" />}>
                  Donations
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {campaign?.title || `Campaign #${id.slice(0, 8)}`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="space-y-2 border-b border-border/40 pb-5">
                  <Skeleton className="h-9 w-3/4" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
                <Skeleton className="h-56 w-full rounded-2xl" />
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
              </div>
              <div className="w-full space-y-5">
                <Skeleton className="h-80 w-full rounded-2xl" />
                <div className="flex gap-3">
                  <Skeleton className="h-11 w-36 rounded-full" />
                  <Skeleton className="h-11 w-44 rounded-full" />
                </div>
              </div>
            </div>
          ) : !campaign ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="size-12 text-muted-foreground/60 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                Donation Campaign Not Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The campaign you are looking for does not exist or may have been concluded.
              </p>
              <Button render={<Link href="/donations" />} variant="outline">
                <ArrowLeft className="size-4 mr-2" />
                Back to All Campaigns
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="space-y-1.5 border-b border-border/40 pb-5">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                    {campaign.title}
                  </h1>
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">
                    {campaign.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <h2 className="text-base font-bold tracking-tight text-foreground">
                    Description & Purpose
                  </h2>
                  <p className="text-xs leading-relaxed text-muted-foreground whitespace-pre-line">
                    {campaign.description}
                  </p>
                </div>

                <Card className="border border-border/60 shadow-sm overflow-hidden">
                  <CardHeader className="py-3 px-4 pb-1">
                    <CardTitle className="text-sm font-bold">
                      Fundraising Overview & Goals
                    </CardTitle>
                    <CardDescription className="text-[11px]">
                      Visual distribution of funds raised against total campaign target.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="py-2 px-4">
                    <ChartContainer config={chartConfig} className="h-48 w-full">
                      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                        <XAxis
                          dataKey="metric"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={6}
                          fontSize={11}
                        />
                        <YAxis
                          tickLine={false}
                          axisLine={false}
                          fontSize={11}
                          tickFormatter={(val) => `$${val}`}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="amount" radius={[6, 6, 0, 0]} fill="#10b981" />
                      </BarChart>
                    </ChartContainer>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/40">
                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Target Goal
                    </span>
                    <span className="text-base font-bold text-foreground block">
                      ${target.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Received Amount
                    </span>
                    <span className="text-base font-bold text-emerald-600 dark:text-emerald-400 block">
                      ${collected.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Total Donors
                    </span>
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Users className="size-3 text-muted-foreground" />
                      {donorsCount} Supporters
                    </span>
                  </div>

                  <div className="space-y-0.5">
                    <span className="text-[10px] uppercase font-semibold text-muted-foreground block">
                      Campaign Timeline
                    </span>
                    <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                      <Calendar className="size-3 text-muted-foreground shrink-0" />
                      {campaign.start_date ? new Date(campaign.start_date).toLocaleDateString() : 'N/A'} -{' '}
                      {campaign.end_date ? new Date(campaign.end_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-border/40">
                  <Button
                    render={<Link href="/donations" />}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <ArrowLeft className="size-3.5 mr-1" />
                    All Campaigns
                  </Button>
                </div>
              </div>

              <div className="w-full space-y-5">
                {photoFullUrl ? (
                  <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border border-border/60 shadow-sm bg-muted/20">
                    <img
                      src={photoFullUrl}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-full h-60 rounded-2xl border border-dashed border-border/70 flex items-center justify-center bg-muted/10">
                    <div className="text-center space-y-1.5">
                      <HeartHandshake className="size-10 text-emerald-600/70 mx-auto" />
                      <p className="text-xs text-muted-foreground font-medium">
                        Emergency Relief Donation Fund
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                  <div className="w-fit" onClick={() => setIsDonateModalOpen(true)}>
                    <ModernButton>Make Donation</ModernButton>
                  </div>

                  <div
                    className="w-fit"
                    onClick={() => {
                      if (!user) {
                        router.push(`/sign-in?returnUrl=/donations/${id}`);
                      } else {
                        setIsRequestAidModalOpen(true);
                      }
                    }}
                  >
                    <ModernButton>Request for donation</ModernButton>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <MuiModal
        open={isDonateModalOpen}
        onClose={() => setIsDonateModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsDonateModalOpen(false)}
              className="size-7 rounded-full text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </Button>
            <span>Make a Donation</span>
          </div>
        }
        maxWidth="sm"
      >
        <form onSubmit={handleMakeDonation} className="space-y-4 py-1">
          {modalServerMsg && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {modalServerMsg}
            </div>
          )}

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold">Select Donation Amount</Label>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ${Number(donationAmount).toLocaleString()} USD
              </span>
            </div>

            <Slider
              value={[Number(donationAmount)]}
              min={1}
              max={maxAllowedAmount}
              step={1}
              onValueChange={(val) => {
                const nextVal = Array.isArray(val) ? val[0] : val;
                setDonationAmount(nextVal);
              }}
              className="py-2"
            />

            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
              <Input
                id="donationCustomAmount"
                type="number"
                min={1}
                max={maxAllowedAmount}
                value={donationAmount}
                onChange={(e) => setDonationAmount(Number(e.target.value))}
                className="pl-9 text-xs"
              />
            </div>
            {donationErrors.amount && (
              <p className="text-[11px] text-destructive">{donationErrors.amount}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="donorName" className="text-xs font-semibold">
              Your Name {isAnonymous ? '(Optional)' : '*'}
            </Label>
            <Input
              id="donorName"
              placeholder="e.g. John Doe"
              value={donorName}
              disabled={isAnonymous}
              onChange={(e) => setDonorName(e.target.value)}
              className="text-xs"
            />
            {donationErrors.donorName && (
              <p className="text-[11px] text-destructive">{donationErrors.donorName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="donorEmail" className="text-xs font-semibold">
              Your Email {isAnonymous ? '(Optional)' : '*'}
            </Label>
            <Input
              id="donorEmail"
              type="email"
              placeholder="e.g. john@example.com"
              value={donorEmail}
              disabled={isAnonymous}
              onChange={(e) => setDonorEmail(e.target.value)}
              className="text-xs"
            />
            {donationErrors.donorEmail && (
              <p className="text-[11px] text-destructive">{donationErrors.donorEmail}</p>
            )}
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20">
            <div className="space-y-0.5">
              <Label htmlFor="anonymousToggle" className="text-xs font-semibold cursor-pointer">
                Make anonymous donation
              </Label>
              <p className="text-[11px] text-muted-foreground">
                Your identity will not be displayed publicly in donor lists.
              </p>
            </div>
            <Switch
              id="anonymousToggle"
              checked={isAnonymous}
              onCheckedChange={(checked) => setIsAnonymous(checked)}
            />
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-start">
            <ModernButton type="submit" disabled={submittingModal}>
              {submittingModal ? 'Redirecting to Stripe...' : 'Proceed'}
            </ModernButton>
          </div>
        </form>
      </MuiModal>

      <MuiModal
        open={isRequestAidModalOpen}
        onClose={() => setIsRequestAidModalOpen(false)}
        title={
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              onClick={() => setIsRequestAidModalOpen(false)}
              className="size-7 rounded-full text-muted-foreground hover:text-foreground shrink-0"
            >
              <X className="size-4" />
            </Button>
            <span>Apply for Donation</span>
          </div>
        }
        maxWidth="sm"
      >
        <form onSubmit={handleRequestAid} className="space-y-4 py-1">
          {aidServerMsg && (
            <div
              className={cn(
                'p-3 text-xs rounded-md border',
                aidServerMsg.type === 'success'
                  ? 'text-emerald-600 bg-emerald-500/10 border-emerald-500/20'
                  : 'text-destructive bg-destructive/10 border-destructive/20'
              )}
            >
              {aidServerMsg.text}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="applicantEmail" className="text-xs font-semibold">
              User Email
            </Label>
            <Input
              id="applicantEmail"
              value={user?.email || ''}
              disabled
              readOnly
              className="text-xs bg-muted text-muted-foreground cursor-not-allowed"
            />
            <p className="text-xs text-muted-foreground">
              You will be contacted via your profile email address.
            </p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="aidReason" className="text-xs font-semibold">
              Briefly Enter your situation and loss details
            </Label>
            <Textarea
              id="aidReason"
              rows={3}
              placeholder="Provide details of damages, emergency requirements, and family situation..."
              value={aidReason}
              onChange={(e) => setAidReason(e.target.value)}
              className="text-xs"
            />
            {aidErrors.reason && (
              <p className="text-[11px] text-destructive">{aidErrors.reason}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold block">Payment Mode</Label>
            <RadioGroup
              value={paymentMode}
              onValueChange={(val) => {
                setPaymentMode(val as 'bank' | 'mfs');
                setAidErrors({});
              }}
              className="flex items-center gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="bank" id="radio-bank" />
                <Label htmlFor="radio-bank" className="text-xs font-medium cursor-pointer">
                  Bank
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="mfs" id="radio-mfs" />
                <Label htmlFor="radio-mfs" className="text-xs font-medium cursor-pointer">
                  MFS
                </Label>
              </div>
            </RadioGroup>
          </div>

          {paymentMode === 'bank' ? (
            <div className="space-y-3 pt-1 border-t border-border/40">
              <div className="space-y-1.5">
                <Label htmlFor="bankName" className="text-xs font-semibold">
                  Bank Name
                </Label>
                <Input
                  id="bankName"
                  placeholder="e.g. Dutch-Bangla Bank, BRAC Bank"
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="text-xs"
                />
                {aidErrors.bankName && (
                  <p className="text-[11px] text-destructive">{aidErrors.bankName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="branchName" className="text-xs font-semibold">
                  Branch
                </Label>
                <Input
                  id="branchName"
                  placeholder="e.g. Bashundhara Branch"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  className="text-xs"
                />
                {aidErrors.branchName && (
                  <p className="text-[11px] text-destructive">{aidErrors.branchName}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="bankAccountNo" className="text-xs font-semibold">
                  Bank Account No
                </Label>
                <Input
                  id="bankAccountNo"
                  placeholder="e.g. 115.120.45892"
                  value={bankAccountNo}
                  onChange={(e) => setBankAccountNo(e.target.value)}
                  className="text-xs"
                />
                {aidErrors.bankAccountNo && (
                  <p className="text-[11px] text-destructive">{aidErrors.bankAccountNo}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 pt-1 border-t border-border/40">
              <div className="space-y-1.5">
                <Label htmlFor="accountPhoneNumber" className="text-xs font-semibold">
                  Account Phone Number
                </Label>
                <Input
                  id="accountPhoneNumber"
                  placeholder="e.g. 01700000000"
                  value={accountPhoneNumber}
                  onChange={(e) => setAccountPhoneNumber(e.target.value)}
                  className="text-xs"
                />
                {aidErrors.accountPhoneNumber && (
                  <p className="text-[11px] text-destructive">{aidErrors.accountPhoneNumber}</p>
                )}
              </div>
            </div>
          )}

          <div className="space-y-1.5 pt-1 border-t border-border/40">
            <Label className="text-xs font-semibold block">Attach Proof Document / Photos (Optional)</Label>
            <div className="border border-dashed border-border/70 rounded-lg p-3 text-center bg-muted/10 flex flex-col items-center justify-center gap-2">
              {selectedProofFile ? (
                <div className="flex items-center justify-between w-full p-2 bg-card rounded-md border text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <FileText className="size-4 text-muted-foreground shrink-0" />
                    <span className="truncate max-w-[200px] font-medium">{selectedProofFile.name}</span>
                    <span className="text-[10px] text-muted-foreground">
                      ({(selectedProofFile.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => setSelectedProofFile(null)}
                    className="size-6 text-muted-foreground hover:text-destructive"
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer flex flex-col items-center gap-1.5 w-full py-1">
                  <Upload className="size-4 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Click to upload document or photo</span>
                  <span className="text-[10px] text-muted-foreground">PDF, JPG, PNG, DOC (Max 10MB)</span>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleProofFileChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="pt-3 border-t border-border/50 flex items-center justify-start">
            <ModernButton type="submit" disabled={submittingAid}>
              {submittingAid ? 'Submitting...' : 'Apply'}
            </ModernButton>
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

const DonationDetailPage = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col bg-background">
          <Navbar />
          <div className="max-w-7xl w-full mx-auto px-4 py-8 space-y-6">
            <Skeleton className="h-8 w-1/3" />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Skeleton className="h-96 rounded-2xl" />
              <Skeleton className="h-96 rounded-2xl" />
            </div>
          </div>
        </div>
      }
    >
      <DonationDetailContent />
    </Suspense>
  );
};

export default DonationDetailPage;
