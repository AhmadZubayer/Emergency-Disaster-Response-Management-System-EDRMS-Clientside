'use client';

import { useState } from 'react';
import { AxiosError } from 'axios';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import {
  volunteerProfileUpdateSchema,
  volunteerRegistrationSchema,
} from '@/app/lib/validations/volunteer-profile-schema';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  VolunteerProfile,
  VolunteerSkill,
  VOLUNTEER_SKILLS,
} from './types';

interface VolunteerProfileFormProps {
  profile?: VolunteerProfile | null;
  onSuccess: () => void;
  onCancel?: () => void;
}

const getErrorMessage = (error: unknown) => {
  const response = (error as AxiosError<{ message?: string | string[] }>).response;
  const message = response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || 'Unable to save the volunteer profile.';
};

const VolunteerProfileForm = ({
  profile,
  onSuccess,
  onCancel,
}: VolunteerProfileFormProps) => {
  const axiosSecure = useAxiosSecure();
  const [skills, setSkills] = useState<VolunteerSkill[]>(profile?.skills || []);
  const [whyJoin, setWhyJoin] = useState(profile?.why_join || '');
  const [available, setAvailable] = useState(profile?.available || false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);

  const toggleSkill = (skill: VolunteerSkill) => {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = profile
      ? { skills, available }
      : { skills, why_join: whyJoin, available };
    const result = profile
      ? volunteerProfileUpdateSchema.safeParse(payload)
      : volunteerRegistrationSchema.safeParse(payload);

    if (!result.success) {
      const nextErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = String(issue.path[0] || 'form');
        nextErrors[field] = issue.message;
      });
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setServerError('');
    setSaving(true);
    try {
      if (profile) {
        await axiosSecure.patch(ENDPOINTS.VOLUNTEERS.UPDATE_PROFILE, payload);
      } else {
        await axiosSecure.post(ENDPOINTS.VOLUNTEERS.REGISTER, payload);
      }
      onSuccess();
    } catch (error) {
      setServerError(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {serverError && (
        <Alert variant="destructive">
          <AlertDescription>{serverError}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label className="text-xs font-semibold">Rescue skills *</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VOLUNTEER_SKILLS.map((skill) => (
            <label
              key={skill.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                skills.includes(skill.value)
                  ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                  : 'border-border/70 bg-background text-muted-foreground hover:bg-muted/50'
              }`}
            >
              <input
                type="checkbox"
                checked={skills.includes(skill.value)}
                onChange={() => toggleSkill(skill.value)}
                className="size-3.5 accent-emerald-600"
              />
              {skill.label}
            </label>
          ))}
        </div>
        {errors.skills && <p className="text-[11px] text-destructive">{errors.skills}</p>}
      </div>

      {!profile && (
        <div className="space-y-1.5">
          <Label htmlFor="whyJoin" className="text-xs font-semibold">
            Why do you want to join? *
          </Label>
          <Textarea
            id="whyJoin"
            rows={4}
            value={whyJoin}
            onChange={(event) => setWhyJoin(event.target.value)}
            placeholder="Describe your motivation and relevant experience..."
            className="text-xs"
          />
          {errors.why_join && (
            <p className="text-[11px] text-destructive">{errors.why_join}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 p-3">
        <div>
          <Label htmlFor="available" className="cursor-pointer text-xs font-semibold">
            Available for volunteer work
          </Label>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            Required before viewing or accepting nearby rescue work.
          </p>
        </div>
        <Switch id="available" checked={available} onCheckedChange={setAvailable} />
      </div>

      <div className="flex items-center gap-2 border-t border-border/50 pt-4">
        <Button type="submit" disabled={saving} className="h-9 px-4 font-semibold">
          {saving ? 'Saving...' : profile ? 'Save Changes' : 'Register as Volunteer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="h-9 px-4">
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default VolunteerProfileForm;
