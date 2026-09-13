'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { ClipboardList, FileWarning, HeartHandshake, ShieldCheck, UsersRound } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FieldReport, formatVolunteerValue, GroupJoin, OrganizationJoin, VolunteerProfile, VolunteerTask } from '@/components/volunteers/types';

interface Summary {
  activeTasks: number;
  completedTasks: number;
  reports: number;
  opportunities: number;
  groupJoins: number;
}

const VolunteerDashboardPage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [summary, setSummary] = useState<Summary>({ activeTasks: 0, completedTasks: 0, reports: 0, opportunities: 0, groupJoins: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const profileResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
        const currentProfile: VolunteerProfile = profileResponse.data?.data || profileResponse.data;
        setProfile(currentProfile);

        const [tasksResponse, reportsResponse, opportunitiesResponse, groupsResponse] = await Promise.all([
          axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_TASKS),
          axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_FIELD_REPORTS),
          axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_ORGANIZATION_JOINS),
          axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_GROUP_JOINS),
        ]);
        const tasks = (tasksResponse.data?.data || tasksResponse.data || []) as VolunteerTask[];
        const reports = (reportsResponse.data?.data || reportsResponse.data || []) as FieldReport[];
        const opportunities = (opportunitiesResponse.data?.data || opportunitiesResponse.data || []) as OrganizationJoin[];
        const groups = (groupsResponse.data?.data || groupsResponse.data || []) as GroupJoin[];
        setSummary({
          activeTasks: tasks.filter((task) => task.status !== 'completed').length,
          completedTasks: tasks.filter((task) => task.status === 'completed').length,
          reports: reports.length,
          opportunities: opportunities.length,
          groupJoins: groups.length,
        });
      } catch (requestError) {
        const message = (requestError as AxiosError<{ message?: string | string[] }>).response?.data?.message;
        setError(Array.isArray(message) ? message.join(', ') : message || 'Unable to load volunteer summary.');
      } finally {
        setLoading(false);
      }
    };
    loadSummary();
  }, [axiosSecure]);

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;

  const cards = [
    { label: 'Active tasks', value: summary.activeTasks, icon: ClipboardList, href: '/my-tasks' },
    { label: 'Completed tasks', value: summary.completedTasks, icon: ShieldCheck, href: '/my-tasks' },
    { label: 'Field reports', value: summary.reports, icon: FileWarning, href: '/field-reports' },
    { label: 'Opportunities joined', value: summary.opportunities, icon: HeartHandshake, href: '/opportunities' },
    { label: 'Group requests', value: summary.groupJoins, icon: UsersRound, href: '/groups' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 border-b border-border/60 pb-6 sm:flex-row sm:items-end">
        <div><h1 className="text-2xl font-bold tracking-tight">Volunteer Dashboard</h1><p className="mt-1 text-xs text-muted-foreground">A quick summary of your Volunteer Operations activity.</p></div>
        {profile && <Badge variant={profile.verification_status === 'verified' ? 'default' : 'secondary'}>{formatVolunteerValue(profile.verification_status)}</Badge>}
      </div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      {!profile ? (
        <div className="rounded-2xl border border-border/70 bg-card p-6"><h2 className="text-base font-bold">Volunteer profile required</h2><p className="mt-1 text-xs text-muted-foreground">Register before accessing operational features.</p><Button render={<Link href="/volunteer-profile" />} className="mt-4 h-8">Create Profile</Button></div>
      ) : (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{cards.map((card) => { const Icon = card.icon; return <Link key={card.label} href={card.href} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm transition-colors hover:bg-muted/30"><div className="flex items-center justify-between"><div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600"><Icon className="size-4.5" /></div><span className="text-2xl font-black">{card.value}</span></div><p className="mt-4 text-xs font-semibold text-muted-foreground">{card.label}</p></Link>; })}</div>
          {profile.verification_status !== 'verified' && <Alert><AlertDescription>Complete volunteer verification to use nearby rescue, task mutations, field-report submission, and open opportunities.</AlertDescription></Alert>}
          <div className="flex flex-wrap gap-2"><Button render={<Link href="/nearby-rescue" />} className="h-8">Find Nearby Rescues</Button><Button render={<Link href="/volunteer-profile" />} variant="outline" className="h-8">Manage Profile</Button></div>
        </>
      )}
    </div>
  );
};

export default VolunteerDashboardPage;
