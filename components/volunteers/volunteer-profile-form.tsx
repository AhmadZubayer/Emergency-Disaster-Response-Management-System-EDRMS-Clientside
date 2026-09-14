'use client';

import { useState } from 'react';
import { AxiosError } from 'axios';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from '@/components/ui/toast';
import {
  volunteerProfileUpdateSchema,
  volunteerRegistrationSchema,
} from '@/lib/validations/volunteer-profile-schema';
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
        toast.add({
          id: 'volunteer-profile-updated',
          title: 'Volunteer profile updated successfully!',
          type: 'success',
          timeout: 4000,
        });
      } else {
        await axiosSecure.post(ENDPOINTS.VOLUNTEERS.REGISTER, payload);
        toast.add({
          id: 'volunteer-registered',
          title: 'Joined volunteer network successfully!',
          type: 'success',
          timeout: 5000,
        });
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
        <Label >Rescue skills *</Label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {VOLUNTEER_SKILLS.map((skill) => (
            <label
              key={skill.value}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                skills.includes(skill.value)
                  ? 'border-primary/50 bg-primary/10 text-primary dark:text-primary'
                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
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
        {errors.skills && <p className="text-xs text-destructive">{errors.skills}</p>}
      </div>

      {!profile && (
        <div className="space-y-1.5">
          <Label htmlFor="whyJoin" >
            Why do you want to join? *
          </Label>
          <Textarea
            id="whyJoin"
            rows={4}
            value={whyJoin}
            onChange={(event) => setWhyJoin(event.target.value)}
            placeholder="Describe your motivation and relevant experience..."

          />
          {errors.why_join && (
            <p className="text-xs text-destructive">{errors.why_join}</p>
          )}
        </div>
      )}

      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3">
        <div>
          <Label htmlFor="available" className="cursor-pointer">
            Available for volunteer work
          </Label>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Required before viewing or accepting nearby rescue work.
          </p>
        </div>
        <Switch id="available" checked={available} onCheckedChange={setAvailable} />
      </div>

      <div className="flex items-center gap-2 border-t border-border pt-4">
        <Button type="submit" disabled={saving} >
          {saving ? 'Saving...' : profile ? 'Save Changes' : 'Register as Volunteer'}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} >
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
};

export default VolunteerProfileForm;
