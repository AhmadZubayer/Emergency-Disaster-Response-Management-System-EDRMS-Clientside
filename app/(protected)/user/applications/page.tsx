'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
interface UserApplication {
  id: string;
  campaign_id: string;
  campaign_title: string | null;
  applicant_id: string;
  applicant_name: string | null;
  applicant_phone: string | null;
  reason: string;
  payout_details: string;
  proof_document_url?: string | null;
  status: string;
  approved_amount?: number | null;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
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
const UserApplicationsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myApplications, setMyApplications] = useState<UserApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, applicationsResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/donations/my-applications')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'applications-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (applicationsResult.status === 'fulfilled') {
        const data = applicationsResult.value.data?.data || applicationsResult.value.data;
        setMyApplications(Array.isArray(data) ? data : []);
      } else {
        toast.add({
          id: 'applications-applications-error',
          title: 'Failed to load applications. Please try again.',
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
        tab="applications"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold">Your Financial Aid Applications</h3>
            <p className="text-xs text-muted-foreground">
              Status of emergency relief funds requested for rehabilitation.
            </p>
          </div>

          {myApplications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/80 p-8 text-center bg-card/40 space-y-3">
              <FileText className="size-8 text-muted-foreground/60 mx-auto" />
              <p className="text-xs text-muted-foreground">
                No financial aid applications submitted.
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-border/70 overflow-hidden bg-card shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Payout Details</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {myApplications.map((a) => (
                    <TableRow key={a.id}>
                      <TableCell className="font-semibold text-xs">{a.campaign_title || 'Relief Campaign'}</TableCell>
                      <TableCell className="text-xs max-w-xs truncate">{a.reason}</TableCell>
                      <TableCell className="text-xs font-mono">{a.payout_details}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-[10px] uppercase font-bold">
                          {a.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-xs">{formatTrashDate(a.created_at)}</TableCell>
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

export default UserApplicationsPage;