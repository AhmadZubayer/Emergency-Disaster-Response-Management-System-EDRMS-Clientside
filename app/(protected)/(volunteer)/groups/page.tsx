'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { UsersRound } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatVolunteerValue, GroupJoin } from '@/components/volunteers/types';

const GroupsPage = () => {
  const axiosSecure = useAxiosSecure();
  const [joins, setJoins] = useState<GroupJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJoins = async () => {
      try {
        const response = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_GROUP_JOINS);
        const data = response.data?.data || response.data || [];
        setJoins(Array.isArray(data) ? data : []);
      } catch (requestError) {
        const message = (requestError as AxiosError<{ message?: string | string[] }>).response?.data?.message;
        setError(Array.isArray(message) ? message.join(', ') : message || 'Unable to load group join requests.');
      } finally {
        setLoading(false);
      }
    };
    fetchJoins();
  }, [axiosSecure]);

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6"><h1 className="text-2xl font-bold tracking-tight">Group Joins</h1><p className="mt-1 text-xs text-muted-foreground">Track requests to help with rescue and missing-person operations.</p></div>
      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}
      <Alert><AlertDescription>The backend currently provides join submission and personal join-history APIs, but no dedicated API for listing available rescue or missing-person groups. This page therefore shows supported join history without inventing group records.</AlertDescription></Alert>
      {joins.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 text-center"><UsersRound className="size-9 text-muted-foreground/60" /><p className="mt-3 text-sm font-semibold">No group join requests</p><p className="mt-1 text-xs text-muted-foreground">Submitted rescue or missing-person group requests will appear here.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {joins.map((join) => {
            const href = join.target_type === 'rescue_request' ? `/rescue-requests/${join.target_id}` : `/missing-persons/${join.target_id}`;
            return <article key={join.id} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-3"><div className="flex items-center justify-between gap-3"><h2 className="text-sm font-bold">{formatVolunteerValue(join.target_type)}</h2><Badge variant={join.status === 'approved' ? 'default' : join.status === 'rejected' ? 'destructive' : 'secondary'}>{join.status}</Badge></div><p className="text-xs text-muted-foreground">{join.why_join}</p><p className="font-mono text-[10px] text-muted-foreground">Target: {join.target_id}</p><div className="flex items-center justify-between border-t border-border/50 pt-3"><span className="text-[10px] text-muted-foreground">{join.created_at ? new Date(join.created_at).toLocaleString() : ''}</span><Button render={<Link href={href} />} variant="outline" className="h-7">View related report</Button></div></article>;
          })}
        </div>
      )}
    </div>
  );
};

export default GroupsPage;
