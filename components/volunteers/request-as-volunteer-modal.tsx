'use client';

import React, { useState } from 'react';
import { Shield, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import MuiModal from '@/components/mui-modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface RequestAsVolunteerModalProps {
  open: boolean;
  onClose: () => void;
}

const AVAILABLE_SKILLS = [
  { id: 'first_aid', label: 'First Aid' },
  { id: 'search_and_rescue', label: 'Search and Rescue' },
  { id: 'flood_rescue', label: 'Flood Rescue' },
  { id: 'medical_assistance', label: 'Medical Assistance' },
  { id: 'food_distribution', label: 'Food Distribution' },
  { id: 'shelter_management', label: 'Shelter Management' },
  { id: 'logistics_transport', label: 'Logistics & Transport' },
  { id: 'psychosocial_support', label: 'Psychosocial Support' },
  { id: 'other', label: 'Other' },
];

export default function RequestAsVolunteerModal({
  open,
  onClose,
}: RequestAsVolunteerModalProps) {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [selectedSkills, setSelectedSkills] = useState<string[]>(['first_aid', 'food_distribution']);
  const [whyJoin, setWhyJoin] = useState('I want to support emergency disaster response efforts and help people in need.');
  const [available, setAvailable] = useState(true);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const toggleSkill = (skillId: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skillId)
        ? prev.filter((s) => s !== skillId)
        : [...prev, skillId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (selectedSkills.length === 0) {
      setError('Please select at least one skill.');
      return;
    }

    if (!whyJoin.trim()) {
      setError('Please provide a reason why you want to join.');
      return;
    }

    setLoading(true);

    try {
      await axiosSecure.post('/volunteers/register', {
        skills: selectedSkills,
        why_join: whyJoin.trim(),
        available: available,
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
      setError(Array.isArray(msg) ? msg.join(', ') : msg);
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
              <h3 className="text-lg font-bold text-foreground">Registration Successful!</h3>
              <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                Your volunteer application has been submitted successfully.
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
              <div className="flex items-start gap-2 p-2.5 rounded-lg bg-destructive/10 border border-destructive/30 text-xs text-destructive">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
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

            <div className="space-y-2">
              <Label className="text-xs font-semibold">Select Your Skills</Label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-border/70 rounded-xl bg-background/50">
                {AVAILABLE_SKILLS.map((skill) => (
                  <label
                    key={skill.id}
                    className="flex items-center gap-2 text-xs font-medium cursor-pointer p-1.5 rounded-lg hover:bg-muted/60 transition-colors"
                  >
                    <Checkbox
                      checked={selectedSkills.includes(skill.id)}
                      onCheckedChange={() => toggleSkill(skill.id)}
                    />
                    <span>{skill.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="why-join">Why do you want to join as a volunteer?</Label>
              <Textarea
                id="why-join"
                placeholder="Describe your motivation, experience, or availability..."
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
                required
                className="text-xs min-h-[70px]"
              />
            </div>

            <div className="flex items-center gap-2 pt-1">
              <Checkbox
                id="vol-available"
                checked={available}
                onCheckedChange={(c) => setAvailable(!!c)}
              />
              <Label htmlFor="vol-available" className="text-xs cursor-pointer">
                I am currently available for emergency dispatch.
              </Label>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/50">
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
