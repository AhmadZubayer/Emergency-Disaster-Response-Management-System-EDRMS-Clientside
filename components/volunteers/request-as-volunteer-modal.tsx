'use client';

import React, { useState } from 'react';
import { UserCheck, Shield, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import MuiModal from '@/components/mui-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface RequestAsVolunteerModalProps {
  open: boolean;
  onClose: () => void;
}

export default function RequestAsVolunteerModal({
  open,
  onClose,
}: RequestAsVolunteerModalProps) {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('First Aid, Relief Distribution, Field Operations');
  const [location, setLocation] = useState('Dhaka, Bangladesh');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const skillsArray = skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await axiosSecure.post('/volunteers/register', {
        skills: skillsArray,
        location: location,
        phone: phone || user?.phone || '',
        status: 'pending',
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.response?.data?.error ||
        'Failed to submit volunteer application. Please try again.';
      setError(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiModal
      open={open}
      onClose={onClose}
      title="Request as Volunteer"
      maxWidth="sm"
    >
      <div className="space-y-4 py-1">
        {success ? (
          <div className="flex flex-col items-center text-center space-y-3 py-6">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-foreground">Request Submitted!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Your volunteer application has been submitted to the admin team for verification.
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs">
              <Shield className="size-5 shrink-0" />
              <span>
                Join our emergency response network to help impacted communities during natural disasters.
              </span>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="vol-name">Applicant Name</Label>
              <Input
                id="vol-name"
                value={user?.name || user?.email || ''}
                disabled
                className="bg-muted/50 text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vol-phone">Contact Phone Number</Label>
              <Input
                id="vol-phone"
                type="tel"
                placeholder="+8801700000000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vol-location">Preferred Operational District / Area</Label>
              <Input
                id="vol-location"
                placeholder="e.g. Feni, Sylhet, Chittagong"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
                className="text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="vol-skills">Special Skills (comma separated)</Label>
              <Input
                id="vol-skills"
                placeholder="First Aid, Boat Rescue, Logistics, Cooking"
                value={skills}
                onChange={(e) => setSkills(e.target.value)}
                className="text-xs"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={loading}
                className="gap-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {loading ? (
                  'Submitting...'
                ) : (
                  <>
                    <Send className="size-3.5" />
                    Submit Application
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </MuiModal>
  );
}
