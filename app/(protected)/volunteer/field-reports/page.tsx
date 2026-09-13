'use client';

import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import RouteReportForm from '@/components/volunteers/route-report-form';
import ShortageReportForm from '@/components/volunteers/shortage-report-form';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';
import { ReportSeverity } from '@/components/volunteers/types';

const VolunteerFieldReportsPage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [savingFieldReport, setSavingFieldReport] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile')
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'field-reports-profile-error',
          title: 'Failed to load profile. Please try again.',
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

  const handleRouteReportSubmit = async (payload: { report_type: 'blocked_route' | 'dangerous_route'; description: string; latitude: number; longitude: number; address?: string; severity: ReportSeverity }) => {
    setSavingFieldReport(true);
    try {
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.REPORT_ROUTE, payload);
      toast.add({
        id: 'route-report-success',
        title: 'Route condition report submitted successfully.',
        type: 'success',
        timeout: 4000,
      });
      return true;
    } catch (err) {
      toast.add({
        id: 'route-report-err',
        title: getApiErrorMessage(err, 'Failed to submit route report.'),
        type: 'error',
        timeout: 5000,
      });
      return false;
    } finally {
      setSavingFieldReport(false);
    }
  };

  const handleShortageReportSubmit = async (payload: { resource_name: string; quantity_needed: number; description: string; latitude: number; longitude: number; address?: string; severity: ReportSeverity }) => {
    setSavingFieldReport(true);
    try {
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.REPORT_SHORTAGE, payload);
      toast.add({
        id: 'shortage-report-success',
        title: 'Resource shortage report submitted successfully.',
        type: 'success',
        timeout: 4000,
      });
      return true;
    } catch (err) {
      toast.add({
        id: 'shortage-report-err',
        title: getApiErrorMessage(err, 'Failed to submit shortage report.'),
        type: 'error',
        timeout: 5000,
      });
      return false;
    } finally {
      setSavingFieldReport(false);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="VOLUNTEER"
        tab="field-reports"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-base font-bold">Submit Field Intelligence</h3>
            <p className="text-xs text-muted-foreground">
              Broadcast real-time road accessibility conditions and critical resource shortages.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <RouteReportForm
                onSubmit={handleRouteReportSubmit}
                saving={savingFieldReport}
              />
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
              <ShortageReportForm
                onSubmit={handleShortageReportSubmit}
                saving={savingFieldReport}
              />
            </div>
          </div>
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

export default VolunteerFieldReportsPage;