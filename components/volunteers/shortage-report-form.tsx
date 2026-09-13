'use client';

import { useState } from 'react';
import { shortageReportSchema } from '@/app/lib/validations/volunteer-field-report-schema';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ReportSeverity } from './types';

interface ShortageReportFormProps {
  saving: boolean;
  onSubmit: (payload: {
    resource_name: string;
    quantity_needed: number;
    description: string;
    latitude: number;
    longitude: number;
    address?: string;
    severity: ReportSeverity;
  }) => Promise<boolean>;
}

const ShortageReportForm = ({ saving, onSubmit }: ShortageReportFormProps) => {
  const [resourceName, setResourceName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [address, setAddress] = useState('');
  const [severity, setSeverity] = useState<ReportSeverity>('high');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const payload = {
      resource_name: resourceName,
      quantity_needed: Number(quantity),
      description,
      latitude: Number(latitude),
      longitude: Number(longitude),
      address: address.trim() || undefined,
      severity,
    };
    const result = shortageReportSchema.safeParse(payload);
    if (!result.success || latitude === '' || longitude === '') {
      setError(result.error?.issues[0]?.message || 'Latitude and longitude are required');
      return;
    }
    setError('');
    if (await onSubmit(payload)) {
      setResourceName('');
      setQuantity('1');
      setDescription('');
      setAddress('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
      <div><h2 className="text-sm font-bold">Resource shortage report</h2><p className="text-[11px] text-muted-foreground">Request resources required at an affected location.</p></div>
      {error && <p className="text-[11px] text-destructive">{error}</p>}
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="resourceName">Resource *</Label><Input id="resourceName" value={resourceName} onChange={(event) => setResourceName(event.target.value)} required placeholder="Drinking water" /></div><div className="space-y-1.5"><Label htmlFor="quantity">Quantity needed *</Label><Input id="quantity" type="number" min={1} value={quantity} onChange={(event) => setQuantity(event.target.value)} required /></div></div>
      <div className="space-y-1.5"><Label htmlFor="shortageDescription">Description *</Label><Textarea id="shortageDescription" value={description} onChange={(event) => setDescription(event.target.value)} rows={3} required placeholder="Explain who needs the resource and why..." /></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="shortageLatitude">Latitude *</Label><Input id="shortageLatitude" type="number" step="any" value={latitude} onChange={(event) => setLatitude(event.target.value)} required /></div><div className="space-y-1.5"><Label htmlFor="shortageLongitude">Longitude *</Label><Input id="shortageLongitude" type="number" step="any" value={longitude} onChange={(event) => setLongitude(event.target.value)} required /></div></div>
      <div className="grid gap-3 sm:grid-cols-2"><div className="space-y-1.5"><Label htmlFor="shortageAddress">Address</Label><Input id="shortageAddress" value={address} onChange={(event) => setAddress(event.target.value)} placeholder="Camp or affected area" /></div><div className="space-y-1.5"><Label htmlFor="shortageSeverity">Severity</Label><select id="shortageSeverity" value={severity} onChange={(event) => setSeverity(event.target.value as ReportSeverity)} className="h-9 w-full rounded-md border border-border bg-background px-3 text-xs"><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option></select></div></div>
      <Button type="submit" disabled={saving} className="h-9 px-4">{saving ? 'Submitting...' : 'Submit Shortage Report'}</Button>
    </form>
  );
};

export default ShortageReportForm;
