'use client';

import { useEffect, useState, useCallback } from 'react';
import { FileCheck2, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Spinner } from '@/components/ui/spinner';
import MuiDrawer from '@/components/mui-drawer';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import VolunteerProfileForm from '@/components/volunteers/volunteer-profile-form';
import { VolunteerProfile } from '@/components/volunteers/types';
import DashboardFrame from '@/components/profile/dashboard-frame';
import { getApiErrorMessage } from '@/utils/api-error';

const VolunteerProfilePage = () => {
  const { user } = useAuth();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);
  const [volunteerProfile, setVolunteerProfile] = useState<VolunteerProfile | null>(null);
  const [volunteerEditing, setVolunteerEditing] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [applyingVerification, setApplyingVerification] = useState(false);

  const fetchPageData = useCallback(async () => {
    try {
      const [profileResult, volunteerResult] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME)
      ]);
      if (profileResult.status === 'fulfilled') {
        const data = profileResult.value.data?.data || profileResult.value.data;
        setProfile(data);
      } else {
        toast.add({
          id: 'volunteer-profile-profile-error',
          title: 'Failed to load profile. Please try again.',
          type: 'error'
        });
      }
      if (volunteerResult.status === 'fulfilled') {
        const data = volunteerResult.value.data?.data || volunteerResult.value.data;
        setVolunteerProfile(data);
      } else {
        toast.add({
          id: 'volunteer-profile-volunteer-error',
          title: 'Failed to load volunteer profile. Please try again.',
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

  const handleVerification = async () => {
    if (!verificationFile && !volunteerProfile?.nid_card_url) {
      toast.add({
        id: 'verification-err',
        title: 'Please select an NID document file before submitting.',
        type: 'error',
        timeout: 5000,
      });
      return;
    }
    setApplyingVerification(true);
    try {
      const formData = new FormData();
      if (verificationFile) formData.append('file', verificationFile);
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.APPLY_VERIFICATION, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerificationFile(null);
      toast.add({
        id: 'verification-success',
        title: 'Verification credentials submitted for review.',
        type: 'success',
        timeout: 5000,
      });
      await fetchPageData();
    } catch (err) {
      toast.add({
        id: 'verification-fail',
        title: getApiErrorMessage(err, 'Failed to submit verification document.'),
        type: 'error',
        timeout: 5000,
      });
    } finally {
      setApplyingVerification(false);
    }
  };

  return (
    <>
      <DashboardFrame
        profile={profile}
        role="VOLUNTEER"
        tab="volunteer-profile"
        loading={loading}
        togglingSafety={togglingSafety}
        onEdit={() => setIsEditOpen(true)}
        onToggleSafety={handleToggleSafety}
      >
        <div className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-4 space-y-6">
            <div className="border-b border-border pb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-foreground">Volunteer Operational Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Rescue skills, motivation, and field readiness settings.
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setVolunteerEditing(true)}

              >
                <Pencil className="size-3.5" />
                Edit Profile
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Availability Status
                </span>
                <div>
                  {volunteerProfile?.available ? (
                    <Badge variant="outline" >
                      Available for Deployment
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Unavailable</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Verification Credential
                </span>
                <div>
                  <Badge
                    variant={
                      volunteerProfile?.verification_status === 'verified'
                        ? 'default'
                        : volunteerProfile?.verification_status === 'pending'
                          ? 'outline'
                          : 'secondary'
                    }
                    className="uppercase"
                  >
                    {volunteerProfile?.verification_status || 'not_applied'}
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Active Operational Skills
                </span>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {volunteerProfile?.skills?.length ? (
                    volunteerProfile.skills.map((s) => (
                      <Badge key={s} variant="outline" className="capitalize">
                        {s.replaceAll('_', ' ')}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground italic">No specialized skills selected.</span>
                  )}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground block">
                  Motivation Statement
                </span>
                <div className="bg-muted/20 p-3 rounded-lg border border-border text-xs leading-relaxed">
                  {volunteerProfile?.why_join || 'No statement provided.'}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-foreground">Identity Verification (NID)</h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Upload your National ID or government passport to receive official volunteer verification badge.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 pt-2">
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setVerificationFile(e.target.files?.[0] || null)}
                className="text-xs text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-muted file:text-foreground hover:file:bg-muted/80 cursor-pointer"
              />
              <Button
                onClick={handleVerification}
                disabled={applyingVerification || (!verificationFile && !volunteerProfile?.nid_card_url)}
                size="sm"
                className="shrink-0"
              >
                {applyingVerification ? (
                  <Spinner className="size-3.5" />
                ) : (
                  <FileCheck2 className="size-3.5" />
                )}
                Submit for Verification
              </Button>
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
      <MuiDrawer
        open={volunteerEditing}
        onClose={() => setVolunteerEditing(false)}
        title="Edit Volunteer Profile"
        subtitle="Update your emergency rescue skills and availability."
      >
        <div className="p-6">
          <VolunteerProfileForm
            profile={volunteerProfile}
            onSuccess={() => {
              setVolunteerEditing(false);
              fetchPageData();
            }}
            onCancel={() => setVolunteerEditing(false)}
          />
        </div>
      </MuiDrawer>
    </>
  );
};

export default VolunteerProfilePage;
