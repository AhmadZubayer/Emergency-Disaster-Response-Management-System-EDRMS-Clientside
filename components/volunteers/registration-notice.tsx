import Link from 'next/link';
import { VolunteerProfile } from './types';

export default function RegistrationNotice({
  profile,
}: {
  profile: VolunteerProfile | null;
}) {
  if (profile?.verification_status === 'verified') return null;
  return (
    <div className="rounded-lg border border-border bg-card p-4 text-sm space-y-2">
      <p className="font-medium">
        {profile
          ? 'Volunteer verification required'
          : 'Complete your volunteer profile'}
      </p>
      <p className="text-xs text-muted-foreground">
        {profile
          ? 'You can browse groups now. Your volunteer profile must be verified before applying or submitting field reports.'
          : 'Your account has volunteer access. Register your skills and complete verification to apply to groups and submit field reports.'}
      </p>
      <Link
        href="/volunteer/profile"
        className="inline-block text-xs font-medium text-primary underline underline-offset-4"
      >
        {profile ? 'View verification status' : 'Set up volunteer profile'}
      </Link>
    </div>
  );
}
