'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { CheckCircle2, FileCheck2, Pencil, ShieldCheck, UserRound } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MuiDrawer from '@/components/mui-drawer';
import VolunteerProfileForm from '@/components/volunteers/volunteer-profile-form';
import {
  formatVolunteerValue,
  VolunteerProfile,
} from '@/components/volunteers/types';

const getErrorMessage = (error: unknown) => {
  const message = (error as AxiosError<{ message?: string | string[] }>).response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || 'Unable to complete the request.';
};

const VolunteerProfilePage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [editing, setEditing] = useState(false);
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [applying, setApplying] = useState(false);

  const fetchProfile = async () => {
    setLoading(true);
    setPageError('');
    try {
      const response = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
      setProfile(response.data?.data || response.data);
    } catch (error) {
      const status = (error as AxiosError).response?.status;
      if (status === 404) {
        setProfile(null);
      } else {
        setPageError(getErrorMessage(error));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side API synchronization follows the existing project pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaved = async () => {
    setSuccessMessage(profile ? 'Volunteer profile updated successfully.' : 'Volunteer profile created successfully.');
    setEditing(false);
    await fetchProfile();
  };

  const handleVerification = async () => {
    if (!verificationFile && !profile?.nid_card_url) {
      setPageError('Select an NID image or PDF before applying for verification.');
      return;
    }

    setApplying(true);
    setPageError('');
    setSuccessMessage('');
    try {
      const formData = new FormData();
      if (verificationFile) formData.append('file', verificationFile);
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.APPLY_VERIFICATION, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setVerificationFile(null);
      setSuccessMessage('Verification application submitted successfully.');
      await fetchProfile();
    } catch (error) {
      setPageError(getErrorMessage(error));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <div className="h-64 rounded-2xl border border-border/60 bg-muted/30 animate-pulse" />;
  }

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Volunteer Profile</h1>
        <p className="mt-1 text-xs text-muted-foreground">
          Register your skills, manage availability, and submit your verification document.
        </p>
      </div>

      {pageError && (
        <Alert variant="destructive"><AlertDescription>{pageError}</AlertDescription></Alert>
      )}
      {successMessage && (
        <Alert className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
          <CheckCircle2 className="size-4" />
          <AlertDescription className="text-current">{successMessage}</AlertDescription>
        </Alert>
      )}

      {!profile ? (
        <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-start gap-3 border-b border-border/50 pb-4">
            <div className="flex size-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
              <UserRound className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold">Become a volunteer</h2>
              <p className="text-xs text-muted-foreground">Create your volunteer profile before joining field operations.</p>
            </div>
          </div>
          <VolunteerProfileForm profile={null} onSuccess={handleSaved} />
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-6">
            <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600">
                  <ShieldCheck className="size-6" />
                </div>
                <div>
                  <h2 className="text-base font-bold">{profile.user?.name || 'Volunteer account'}</h2>
                  <p className="text-xs text-muted-foreground">{profile.user?.email}</p>
                </div>
              </div>
              <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'} className="uppercase">
                {formatVolunteerValue(profile.verification_status)}
              </Badge>
            </div>

            <div className="grid gap-5 text-xs sm:grid-cols-2">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Skills</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => <Badge key={skill} variant="outline">{formatVolunteerValue(skill)}</Badge>)}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Current status</p>
                <p className="mt-2 font-semibold">{profile.available ? 'Available' : 'Unavailable'} · {profile.on_duty ? 'On duty' : 'Off duty'}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Why I joined</p>
                <p className="mt-1 leading-relaxed text-muted-foreground">{profile.why_join}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Duty coordinates</p>
                <p className="mt-1">{profile.current_latitude != null && profile.current_longitude != null ? `${profile.current_latitude}, ${profile.current_longitude}` : 'Not shared yet'}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">NID document</p>
                <p className="mt-1">{profile.nid_card_url ? 'Uploaded' : 'Not uploaded'}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => setEditing(true)} className="h-9 gap-2 px-4"><Pencil className="size-4" />Edit Profile</Button>
            </div>
          </div>

          {profile.verification_status !== 'verified' && profile.verification_status !== 'pending' && (
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
              <div>
                <h2 className="flex items-center gap-2 text-base font-bold"><FileCheck2 className="size-5 text-emerald-600" />Apply for verification</h2>
                <p className="mt-1 text-xs text-muted-foreground">Upload a JPG, PNG, or PDF copy of your NID. Verification is required for operational actions.</p>
              </div>
              <input
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={(event) => setVerificationFile(event.target.files?.[0] || null)}
                className="block w-full rounded-lg border border-border bg-background p-2 text-xs file:mr-3 file:rounded-md file:border-0 file:bg-emerald-500/10 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-emerald-700"
              />
              <Button onClick={handleVerification} disabled={applying} className="h-9 px-4">
                {applying ? 'Submitting...' : profile.verification_status === 'rejected' ? 'Reapply for Verification' : 'Apply for Verification'}
              </Button>
            </div>
          )}

          {profile.verification_status === 'pending' && (
            <Alert><AlertDescription>Your verification application is pending administrator review.</AlertDescription></Alert>
          )}
        </>
      )}

      <MuiDrawer open={editing} onClose={() => setEditing(false)} title="Edit Volunteer Profile" subtitle="Update skills and availability.">
        <div className="p-6">
          <VolunteerProfileForm profile={profile} onSuccess={handleSaved} onCancel={() => setEditing(false)} />
        </div>
      </MuiDrawer>
    </div>
  );
};

export default VolunteerProfilePage;
