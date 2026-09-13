'use client';

import { useState } from 'react';
import { routeReportSchema } from '@/app/lib/validations/volunteer-field-report-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportSeverity } from './types';

interface RouteReportFormProps {
  saving: boolean;
  onSubmit: (payload: {
    report_type: 'blocked_route' | 'dangerous_route';
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    severity: ReportSeverity;
  }) => Promise<boolean>;
}

const RouteReportForm = ({ saving, onSubmit }: RouteReportFormProps) => {
  const [reportType, setReportType] = useState<'blocked_route' | 'dangerous_route'>('blocked_route');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      report_type: reportType,
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address.trim() || undefined,
      severity,
    };
    const result = routeReportSchema.safeParse(payload);
    if (!result.success || latitude === '' || longitude === '') {
      setError(result.error?.issues[0]?.message || 'Latitude and longitude are required');
      return;
    }
    setError('');
    if (await onSubmit(payload)) {
      setDescription('');
      setAddress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
      <div><h2 className="text-sm font-bold">Route condition report</h2><p className="text-[11px] text-muted-foreground">Report a blocked or dangerous route from the field.</p></div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="routeType">Route condition</Label><select id="routeType" value={reportType} onChange={(event) => setReportType(event.target.value as 'blocked_route' | 'dangerous_route')} className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"><option value="blocked_route">Blocked route</option><option value="dangerous_route">Dangerous route</option></select></div>
        <div className="space-y-1.5"><Label htmlFor="routeSeverity">Severity</Label><select id="routeSeverity" value={severity} onChange={(event) => setSeverity(event.target.value as ReportSeverity)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="routeDescription">Description *</Label><Textarea id="routeDescription" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} required placeholder="Explain the obstruction or danger..." /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="routeLatitude">Latitude *</Label><Input id="routeLatitude" type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="routeLongitude">Longitude *</Label><Input id="routeLongitude" type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></div></div>
      <div className="space-y-1.5"><Label htmlFor="routeAddress">Address</Label><Input id="routeAddress" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Nearby road, landmark, or area" /></div>
      <Button type="submit" disabled={saving} className="h-9 px-4">{saving ? 'Submitting...' : 'Submit Route Report'}</Button>
    </form>
  );
};

export default RouteReportForm;
