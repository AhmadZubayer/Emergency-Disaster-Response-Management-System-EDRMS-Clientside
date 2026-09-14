'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Users,
  Target,
  Clock,
  FileText,
  ExternalLink,
  X,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/toast';
import MuiDrawer from '@/components/mui-drawer';
import MuiTabs from '@/components/mui-tabs';
import MuiModal from '@/components/mui-modal';
import ModernButton from '@/components/modernBtn';
import { axiosSecure } from '@/lib/api';
import {
  DonationCampaign,
  DonationApplication,
  DonationTransaction,
} from '@/components/donations/types';

interface CampaignProgressDrawerProps {
  open: boolean;
  onClose: () => void;
  campaign: DonationCampaign | null;
  onCampaignUpdated?: () => void;
}

const chartConfig = {
  amount: {
    label: 'Amount ($)',
    color: '#10b981',
  },
} satisfies ChartConfig;

const CampaignProgressDrawer = ({
  open,
  onClose,
  campaign,
  onCampaignUpdated,
}: CampaignProgressDrawerProps) => {

  const [transactions, setTransactions] = useState<DonationTransaction[]>([]);
  const [applications, setApplications] = useState<DonationApplication[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [selectedApplication, setSelectedApplication] =
    useState<DonationApplication | null>(null);
  const [aidAmount, setAidAmount] = useState('');
  const [aidAmountError, setAidAmountError] = useState('');
  const [submittingAid, setSubmittingAid] = useState(false);

  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';

  const loadData = useCallback(async () => {
    if (!campaign?.id) return;
    try {
      setLoadingData(true);
      const [txRes, appRes] = await Promise.all([
        axiosSecure.get(`/donations/campaigns/${campaign.id}/transactions`),
        axiosSecure.get(`/donations/campaigns/${campaign.id}/applications`),
      ]);
      const txData = txRes.data?.data || txRes.data || [];
      const appData = appRes.data?.data || appRes.data || [];
      setTransactions(Array.isArray(txData) ? txData : []);
      setApplications(Array.isArray(appData) ? appData : []);
    } catch {
      setTransactions([]);
      setApplications([]);
    } finally {
      setLoadingData(false);
    }
  }, [campaign?.id, axiosSecure]);

  useEffect(() => {
    if (open && campaign?.id) {
      loadData();
    }
  }, [open, campaign?.id, loadData]);

  const target = Number(campaign?.target_amount) || 0;
  const collected = Number(campaign?.raised_amount) || 0;
  const remaining = Math.max(0, target - collected);
  const donorsCount = campaign?.donors_count || 0;

  const totalApproved = applications.reduce((sum, app) => {
    if (String(app.status || '').toLowerCase() === 'approved') {
      return sum + (Number(app.approved_amount) || 0);
    }
    return sum;
  }, 0);

  const availableAmount = Math.max(0, collected - totalApproved);

  const chartData = [
    { metric: 'Raised', amount: collected, fill: '#10b981' },
    { metric: 'Remaining', amount: remaining, fill: '#64748b' },
    { metric: 'Goal Target', amount: target, fill: '#059669' },
  ];

  const handleOpenApplicationModal = (app: DonationApplication) => {
    setSelectedApplication(app);
    setAidAmount(app.approved_amount ? String(app.approved_amount) : '');
    setAidAmountError('');
  };

  const handleCloseApplicationModal = () => {
    setSelectedApplication(null);
    setAidAmount('');
    setAidAmountError('');
  };

  const handleSendDonation = async () => {
    if (!selectedApplication) return;
    const numAmount = Number(aidAmount);
    if (!aidAmount || isNaN(numAmount) || numAmount <= 0) {
      setAidAmountError('Please enter a valid donation amount greater than 0.');
      return;
    }

    setAidAmountError('');
    setSubmittingAid(true);

    try {
      await axiosSecure.patch(
        `/donations/applications/${selectedApplication.id}/review`,
        {
          status: 'approved',
          approved_amount: numAmount,
        }
      );

      toast.add({
        id: 'send-donation-success',
        title: `Donation of $${numAmount.toLocaleString()} successfully sent to ${selectedApplication.applicant_name}.`,
        type: 'success',
        timeout: 6000,
      });

      handleCloseApplicationModal();
      await loadData();
      onCampaignUpdated?.();
    } catch (err: any) {
      setAidAmountError(
        err?.response?.data?.message || 'Failed to process aid approval. Please try again.'
      );
    } finally {
      setSubmittingAid(false);
    }
  };

  const isImageFile = (url?: string | null) => {
    if (!url) return false;
    const cleanUrl = url.toLowerCase();
    return (
      cleanUrl.endsWith('.jpg') ||
      cleanUrl.endsWith('.jpeg') ||
      cleanUrl.endsWith('.png') ||
      cleanUrl.endsWith('.webp') ||
      cleanUrl.endsWith('.gif')
    );
  };

  const isAppApproved = (status?: string | null) => {
    return String(status || '').toLowerCase() === 'approved';
  };

  const isAppRejected = (status?: string | null) => {
    return String(status || '').toLowerCase() === 'rejected';
  };

  const tabItems = [
    {
      label: 'Donation Progress',
      content: (
        <div className="space-y-6 pb-6">
          <div className="p-4 rounded-lg border border-border bg-card space-y-3">
            <h3 className="text-sm font-medium text-foreground">
              Fundraising Overview & Goals
            </h3>
            <ChartContainer config={chartConfig} className="h-44 w-full">
              <BarChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  opacity={0.3}
                />
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
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Target Goal
              </span>
              <span className="text-base font-medium text-foreground mt-1 block">
                ${target.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Total Raised
              </span>
              <span className="text-base font-medium text-primary dark:text-primary mt-1 block">
                ${collected.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Remaining
              </span>
              <span className="text-base font-medium text-muted-foreground mt-1 block">
                ${remaining.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Total Donors
              </span>
              <span className="text-base font-medium text-foreground mt-1 block">
                {donorsCount}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-foreground">
                Donation Transaction History
              </h3>
              <span className="text-xs text-muted-foreground">
                Total Transactions: {transactions.length}
              </span>
            </div>

            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow >
                    <TableHead className="text-foreground">Participant</TableHead>
                    <TableHead className="text-foreground">Type</TableHead>
                    <TableHead className="text-foreground">Amount</TableHead>
                    <TableHead className="text-foreground">Date</TableHead>
                    <TableHead className="text-right text-foreground">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingData ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-28 text-center text-muted-foreground"
                      >
                        Loading transactions...
                      </TableCell>
                    </TableRow>
                  ) : transactions.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-28 text-center text-muted-foreground"
                      >
                        No donation transactions recorded for this campaign yet.
                      </TableCell>
                    </TableRow>
                  ) : (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} >
                        <TableCell>
                          <div className="font-medium text-foreground">
                            {tx.user_name}
                          </div>
                          {tx.user_email && (
                            <div className="text-xs text-muted-foreground">
                              {tx.user_email}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <span
                            className={`text-xs font-medium uppercase tracking-wider ${
                              String(tx.transaction_type).toUpperCase() === 'DONATE'
                                ? 'text-primary dark:text-primary'
                                : 'text-blue-600 dark:text-blue-400'
                            }`}
                          >
                            {tx.transaction_type}
                          </span>
                        </TableCell>
                        <TableCell className="text-foreground">
                          ${Number(tx.amount).toLocaleString()}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {tx.paid_at
                            ? new Date(tx.paid_at).toLocaleDateString('en-GB', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                              })
                            : 'N/A'}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className="text-xs font-medium uppercase text-primary dark:text-primary">
                            {tx.status}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ),
    },
    {
      label: 'Receive Applications',
      content: (
        <div className="space-y-4 pb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">
              Applications ({applications.length})
            </h3>
            <span className="text-xs text-muted-foreground">
              Pending review and disbursement
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Approved Amount
              </span>
              <span className="text-base font-medium text-primary dark:text-primary mt-1 block">
                ${totalApproved.toLocaleString()}
              </span>
            </div>
            <div className="p-3.5 rounded-lg border border-border bg-card">
              <span className="text-xs uppercase font-medium text-muted-foreground block">
                Available Amount
              </span>
              <span className="text-base font-medium text-foreground mt-1 block">
                ${availableAmount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow >
                  <TableHead className="text-foreground">Name</TableHead>
                  <TableHead className="text-foreground">Email</TableHead>
                  <TableHead className="text-foreground">Status</TableHead>
                  <TableHead className="text-right text-foreground">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingData ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-muted-foreground"
                    >
                      Loading applications...
                    </TableCell>
                  </TableRow>
                ) : applications.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No aid applications submitted for this campaign yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  applications.map((app) => (
                    <TableRow key={app.id} >
                      <TableCell className="text-foreground">
                        {app.applicant_name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {app.applicant_email || 'N/A'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`text-xs font-medium uppercase ${
                            isAppApproved(app.status)
                              ? 'text-primary dark:text-primary'
                              : isAppRejected(app.status)
                              ? 'text-destructive'
                              : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {app.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenApplicationModal(app)}

                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      ),
    },
  ];

  return (
    <>
      <MuiDrawer
        open={open}
        onClose={onClose}
        title={campaign?.title || 'Donation Campaign Details'}
        subtitle="Campaign Progress & Financial Aid Applications"
        width={720}
      >
        <div className="p-6">
          <MuiTabs tabs={tabItems} />
        </div>
      </MuiDrawer>

      <MuiModal
        open={!!selectedApplication}
        onClose={handleCloseApplicationModal}
        maxWidth="sm"
      >
        <div className="space-y-5">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <button
              type="button"
              onClick={handleCloseApplicationModal}
              className="size-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors -ml-1.5"
            >
              <X className="size-4" />
            </button>
            <h2 className="text-sm font-medium text-foreground">
              Donation Aid Application
            </h2>
            <div className="w-8" />
          </div>

          {selectedApplication && (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 bg-muted/30 p-3 rounded-lg border border-border">
                <div>
                  <span className="text-xs uppercase font-medium text-muted-foreground block">
                    Applicant Name
                  </span>
                  <span className="font-medium text-foreground block mt-0.5">
                    {selectedApplication.applicant_name}
                  </span>
                </div>
                <div>
                  <span className="text-xs uppercase font-medium text-muted-foreground block">
                    Email Address
                  </span>
                  <span className="font-medium text-foreground block mt-0.5">
                    {selectedApplication.applicant_email || 'N/A'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs uppercase font-medium text-muted-foreground block">
                  Payout Method & Details
                </span>
                <p className="mt-1 p-2.5 rounded-lg bg-muted/20 border border-border text-foreground font-mono text-xs">
                  {selectedApplication.payout_details}
                </p>
              </div>

              <div>
                <span className="text-xs uppercase font-medium text-muted-foreground block">
                  Situation & Loss Details
                </span>
                <p className="mt-1 p-3 rounded-lg bg-muted/20 border border-border text-muted-foreground leading-relaxed whitespace-pre-line">
                  {selectedApplication.reason}
                </p>
              </div>

              {selectedApplication.proof_document_url && (
                <div className="space-y-1.5">
                  <span className="text-xs uppercase font-medium text-muted-foreground block">
                    Attached Verification Documents
                  </span>
                  {isImageFile(selectedApplication.proof_document_url) ? (
                    <div className="border border-border rounded-lg overflow-hidden max-h-48 bg-muted/20 flex items-center justify-center">
                      <img
                        src={`${backendUrl}${selectedApplication.proof_document_url}`}
                        alt="Proof Document"
                        className="max-h-48 w-auto object-contain"
                      />
                    </div>
                  ) : null}
                  <a
                    href={`${backendUrl}${selectedApplication.proof_document_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary dark:text-primary hover:underline pt-1"
                  >
                    <FileText className="size-3.5" />
                    View / Download Full Document
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}

              {isAppApproved(selectedApplication.status) ? (
                <div className="p-3.5 rounded-lg bg-primary/10 dark:bg-primary/40 border border-primary dark:border-primary flex items-start gap-2.5">
                  <CheckCircle2 className="size-4 text-primary dark:text-primary shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium text-primary dark:text-primary block">
                      Aid Approved & Sent
                    </span>
                    <span className="text-xs text-primary dark:text-primary block mt-0.5">
                      Approved Amount: ${Number(selectedApplication.approved_amount || 0).toLocaleString()} USD
                    </span>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-2 border-t border-border">
                  <div className="space-y-1.5">
                    <Label htmlFor="aid-amount-input" >
                      Enter Amount ($ USD)
                    </Label>
                    <Input
                      id="aid-amount-input"
                      type="number"
                      min="1"
                      step="any"
                      placeholder="e.g. 250"
                      value={aidAmount}
                      onChange={(e) => {
                        setAidAmount(e.target.value);
                        setAidAmountError('');
                      }}

                    />
                    {aidAmountError && (
                      <p className="text-xs text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3 shrink-0" />
                        {aidAmountError}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 flex justify-center">
                    <ModernButton
                      onClick={handleSendDonation}
                      disabled={submittingAid}
                    >
                      {submittingAid ? 'Processing...' : 'Send Donation'}
                    </ModernButton>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </MuiModal>
    </>
  );
};

export default CampaignProgressDrawer;
