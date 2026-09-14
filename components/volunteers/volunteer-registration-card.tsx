'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { AxiosError } from 'axios';
import { Users, CheckCircle2 } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { ENDPOINTS } from '@/lib/endpoints';
import { toast } from '@/components/ui/toast';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ModernButton from '@/components/modernBtn';
import { volunteerRegistrationSchema } from '@/lib/validations/volunteer-profile-schema';
import { VolunteerSkill, VOLUNTEER_SKILLS } from './types';

const VolunteerRegistrationCard = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [skills, setSkills] = useState<VolunteerSkill[]>([]);
  const [whyJoin, setWhyJoin] = useState('');
  const [available, setAvailable] = useState(true);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [saving, setSaving] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const toggleSkill = (skill: VolunteerSkill) => {
    setSkills((current) =>
      current.includes(skill)
        ? current.filter((item) => item !== skill)
        : [...current, skill]
    );
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!user) {
      router.push('/sign-in?returnUrl=/volunteer-registration-form');
      return;
    }

    const payload = { skills, why_join: whyJoin, available };
    const result = volunteerRegistrationSchema.safeParse(payload);

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
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.REGISTER, payload);
      toast.add({
        id: 'volunteer-registered-success',
        title: 'Joined volunteer network successfully!',
        type: 'success',
        timeout: 5000,
      });
      setSubmittedSuccess(true);
    } catch (error) {
      const response = (error as AxiosError<{ message?: string | string[] }>).response;
      const message = response?.data?.message;
      setServerError(
        Array.isArray(message)
          ? message.join(', ')
          : message || 'Failed to register as volunteer. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (submittedSuccess) {
    return (
      <Card className="w-full max-w-xl text-center space-y-6">
        <div className="size-16 rounded-lg bg-muted/60 border border-border flex items-center justify-center mx-auto text-foreground">
          <CheckCircle2 className="size-9" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-medium tracking-tight text-foreground">
            Volunteer Application Submitted
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for stepping forward to serve your community. Your volunteer profile has been registered and is now active.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto"
            onClick={() => router.push('/volunteer/profile')}
          >
            Go to Volunteer Profile
          </Button>
          <Button
            className="w-full sm:w-auto"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl my-6">
      <CardHeader className="text-center space-y-1.5">
        <div className="size-12 rounded-lg bg-muted/60 border border-border flex items-center justify-center mx-auto text-foreground mb-1">
          <Users className="size-6" />
        </div>
        <h1 className="text-2xl font-medium tracking-tight text-foreground">
          Apply as a Volunteer
        </h1>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Join our rapid emergency disaster response network and assist in life-saving rescue operations.
        </p>
      </CardHeader>

      <CardContent >
        <form onSubmit={handleSubmit} className="space-y-5">
          {serverError && (
            <Alert variant="destructive">
              <AlertDescription >{serverError}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label >
              Rescue & Support Skills <span className="text-destructive">*</span>
            </Label>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {VOLUNTEER_SKILLS.map((skill) => (
                <label
                  key={skill.value}
                  className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2.5 text-xs transition-colors ${
                    skills.includes(skill.value)
                      ? 'border-primary/50 bg-primary/10 text-primary dark:text-primary font-medium'
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
            {errors.skills && (
              <p className="text-xs text-destructive">{errors.skills}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="whyJoin" >
              Why do you want to join? <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="whyJoin"
              rows={4}
              value={whyJoin}
              onChange={(event) => setWhyJoin(event.target.value)}
              placeholder="Describe your motivation, physical capabilities, or relevant experience..."

            />
            {errors.why_join && (
              <p className="text-xs text-destructive">{errors.why_join}</p>
            )}
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 p-3.5">
            <div>
              <Label htmlFor="available" className="cursor-pointer">
                Available for immediate volunteer deployment
              </Label>
              <p className="mt-0.5 text-xs text-muted-foreground">
                You can update your availability status at any time from your profile.
              </p>
            </div>
            <Switch id="available" checked={available} onCheckedChange={setAvailable} />
          </div>

          <div className="flex flex-col items-center justify-center pt-3">
            <ModernButton
              text={saving ? 'Submitting Application...' : 'Apply As a volunteer'}
              type="submit"
              disabled={saving}
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default VolunteerRegistrationCard;
