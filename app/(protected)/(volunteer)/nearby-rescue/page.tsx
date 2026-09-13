'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { LocateFixed, MapPinned } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import NearbyRescueCard from '@/components/volunteers/nearby-rescue-card';
import { NearbyRescueRequest, VolunteerProfile } from '@/components/volunteers/types';

const errorMessage = (error: unknown) => {
  const value = (error as AxiosError<{ message?: string | string[] }>).response?.data?.message;
  return Array.isArray(value) ? value.join(', ') : value || 'Unable to complete the request.';
};

const NearbyRescuePage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [requests, setRequests] = useState<NearbyRescueRequest[]>([]);
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [onDuty, setOnDuty] = useState(false);
  const [radius, setRadius] = useState('25');
  const [loading, setLoading] = useState(true);
  const [savingLocation, setSavingLocation] = useState(false);
  const [busyRequest, setBusyRequest] = useState<{ id: string; action: 'accept' | 'reject' } | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchNearby = async (searchRadius = radius) => {
    try {
      const response = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.NEARBY_RESCUE_REQUESTS, {
        params: { radius: Number(searchRadius) },
      });
      const data = response.data?.data || response.data || [];
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      setRequests([]);
      setMessage({ type: 'error', text: errorMessage(error) });
    }
  };

  const loadPage = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const response = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
      const volunteer: VolunteerProfile = response.data?.data || response.data;
      setProfile(volunteer);
      setLatitude(volunteer.current_latitude == null ? '' : String(volunteer.current_latitude));
      setLongitude(volunteer.current_longitude == null ? '' : String(volunteer.current_longitude));
      setOnDuty(volunteer.on_duty);
      if (volunteer.verification_status === 'verified' && volunteer.available && volunteer.current_latitude != null && volunteer.current_longitude != null) {
        await fetchNearby();
      }
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side API synchronization follows the existing project pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ type: 'error', text: 'Geolocation is not supported by this browser.' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(String(position.coords.latitude));
        setLongitude(String(position.coords.longitude));
        setMessage({ type: 'success', text: 'Current coordinates detected.' });
      },
      () => setMessage({ type: 'error', text: 'Unable to read your current location.' })
    );
  };

  const updateLocation = async (event: React.FormEvent) => {
    event.preventDefault();
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180) {
      setMessage({ type: 'error', text: 'Enter valid latitude and longitude values.' });
      return;
    }
    setSavingLocation(true);
    setMessage(null);
    try {
      await axiosSecure.patch(ENDPOINTS.VOLUNTEERS.UPDATE_LOCATION, {
        latitude: lat,
        longitude: lng,
        on_duty: onDuty,
      });
      setMessage({ type: 'success', text: 'Duty location updated successfully.' });
      await fetchNearby();
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    } finally {
      setSavingLocation(false);
    }
  };

  const handleTask = async (requestId: string, action: 'accept' | 'reject') => {
    setBusyRequest({ id: requestId, action });
    setMessage(null);
    try {
      const endpoint = action === 'accept'
        ? ENDPOINTS.VOLUNTEERS.ACCEPT_TASK(requestId)
        : ENDPOINTS.VOLUNTEERS.REJECT_TASK(requestId);
      await axiosSecure.post(endpoint);
      setMessage({ type: 'success', text: action === 'accept' ? 'Rescue task accepted.' : 'Request removed from your nearby list.' });
      await fetchNearby();
    } catch (error) {
      setMessage({ type: 'error', text: errorMessage(error) });
    } finally {
      setBusyRequest(null);
    }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;

  const operational = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">Nearby Rescue Requests</h1>
        <p className="mt-1 text-xs text-muted-foreground">Share your duty position and respond to unassigned emergencies near you.</p>
      </div>

      {message && <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : ''}><AlertDescription>{message.text}</AlertDescription></Alert>}

      {!profile ? (
        <Alert><AlertDescription>Create your volunteer profile before using rescue operations.</AlertDescription></Alert>
      ) : !operational ? (
        <Alert><AlertDescription>Your volunteer profile must be verified before you can share a duty location or view nearby requests.</AlertDescription></Alert>
      ) : !profile.available ? (
        <Alert><AlertDescription>Set your profile availability to “Available” before viewing nearby rescue requests.</AlertDescription></Alert>
      ) : (
        <>
          <form onSubmit={updateLocation} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div><h2 className="text-sm font-bold">Duty location</h2><p className="text-[11px] text-muted-foreground">Coordinates are used only to calculate nearby requests.</p></div>
              <Button type="button" variant="outline" onClick={useCurrentLocation} className="h-8 gap-1.5"><LocateFixed className="size-3.5" />Detect</Button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5"><Label htmlFor="latitude">Latitude</Label><Input id="latitude" type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></div>
              <div className="space-y-1.5"><Label htmlFor="longitude">Longitude</Label><Input id="longitude" type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></div>
              <div className="space-y-1.5"><Label htmlFor="radius">Radius (km)</Label><Input id="radius" type="number" min={1} max={200} value={radius} onChange={(event) => setRadius(event.target.value)} required /></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs font-semibold"><Switch checked={onDuty} onCheckedChange={setOnDuty} />On duty</label>
              <div className="flex gap-2"><Button type="submit" disabled={savingLocation} className="h-8">{savingLocation ? 'Updating...' : 'Update Location & Search'}</Button><Button type="button" variant="outline" onClick={() => fetchNearby()} className="h-8">Refresh Results</Button></div>
            </div>
          </form>

          {requests.length === 0 ? (
            <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 text-center">
              <MapPinned className="size-9 text-muted-foreground/60" />
              <p className="mt-3 text-sm font-semibold">No nearby rescue requests found</p>
              <p className="mt-1 text-xs text-muted-foreground">Try increasing the radius or refresh later.</p>
            </div>
          ) : (
            <div className="grid gap-4 lg:grid-cols-2">
              {requests.map((request) => (
                <NearbyRescueCard key={request.id} request={request} busyAction={busyRequest?.id === request.id ? busyRequest.action : null} onAccept={() => handleTask(request.id, 'accept')} onReject={() => handleTask(request.id, 'reject')} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default NearbyRescuePage;
