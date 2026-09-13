'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { HeartHandshake } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import OpportunityCard from '@/components/volunteers/opportunity-card';
import { OrganizationJoin, OrganizationOpportunity, VolunteerProfile } from '@/components/volunteers/types';

const getError = (error: unknown) => {
  const message = (error as AxiosError<{ message?: string | string[] }>).response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || 'Unable to load volunteer opportunities.';
};

const OpportunitiesPage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [opportunities, setOpportunities] = useState<OrganizationOpportunity[]>([]);
  const [joins, setJoins] = useState<OrganizationJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const profileResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
      const currentProfile: VolunteerProfile = profileResponse.data?.data || profileResponse.data;
      setProfile(currentProfile);

      const joinsResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_ORGANIZATION_JOINS);
      const joinData = joinsResponse.data?.data || joinsResponse.data || [];
      setJoins(Array.isArray(joinData) ? joinData : []);

      if (currentProfile.verification_status === 'verified') {
        const opportunityResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ORGANIZATION_REQUESTS);
        const opportunityData = opportunityResponse.data?.data || opportunityResponse.data || [];
        setOpportunities(Array.isArray(opportunityData) ? opportunityData : []);
      } else {
        setOpportunities([]);
      }
    } catch (error) {
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side API synchronization follows the existing project pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const joinOpportunity = async (id: string) => {
    setJoiningId(id);
    setMessage(null);
    try {
      await axiosSecure.post(ENDPOINTS.VOLUNTEERS.JOIN_ORGANIZATION_REQUEST(id));
      setMessage({ type: 'success', text: 'You joined the volunteer opportunity successfully.' });
      await loadData();
    } catch (error) {
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setJoiningId(null);
    }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;
  const joinedIds = new Set(joins.map((join) => join.organization_request_id));
  const verified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6"><h1 className="text-2xl font-bold tracking-tight">Volunteer Opportunities</h1><p className="mt-1 text-xs text-muted-foreground">Join open requests published by verified relief organizations.</p></div>
      {message && <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : ''}><AlertDescription>{message.text}</AlertDescription></Alert>}
      {!verified && <Alert><AlertDescription>Your profile must be verified before open organization opportunities can be viewed or joined.</AlertDescription></Alert>}

      {verified && (opportunities.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 text-center"><HeartHandshake className="size-9 text-muted-foreground/60" /><p className="mt-3 text-sm font-semibold">No open opportunities</p><p className="mt-1 text-xs text-muted-foreground">Check again when relief organizations publish new requests.</p></div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{opportunities.map((opportunity) => <OpportunityCard key={opportunity.id} opportunity={opportunity} joined={joinedIds.has(opportunity.id)} joining={joiningId === opportunity.id} onJoin={() => joinOpportunity(opportunity.id)} />)}</div>
      ))}

      <div className="space-y-3">
        <div><h2 className="text-base font-bold">My joined opportunities</h2><p className="text-[11px] text-muted-foreground">Organization requests you have already joined.</p></div>
        {joins.length === 0 ? <div className="rounded-xl border border-dashed border-border/70 p-8 text-center text-xs text-muted-foreground">You have not joined an organization opportunity yet.</div> : <div className="grid gap-3 lg:grid-cols-2">{joins.map((join) => <article key={join.id} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm"><div className="flex items-center justify-between gap-3"><h3 className="text-xs font-bold">{join.organization_request?.title || `Opportunity ${join.organization_request_id.slice(0, 8)}`}</h3><span className="text-[10px] font-bold uppercase text-emerald-600">Joined</span></div><p className="mt-2 text-[11px] text-muted-foreground">{join.organization_request?.location || 'Location unavailable'}{join.joined_at ? ` · ${new Date(join.joined_at).toLocaleDateString()}` : ''}</p></article>)}</div>}
      </div>
    </div>
  );
};

export default OpportunitiesPage;
