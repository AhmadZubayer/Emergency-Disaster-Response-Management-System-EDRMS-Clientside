'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { FileWarning } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import RouteReportForm from '@/components/volunteers/route-report-form';
import ShortageReportForm from '@/components/volunteers/shortage-report-form';
import { FieldReport, formatVolunteerValue, VolunteerProfile } from '@/components/volunteers/types';

const getError = (error: unknown) => {
  const message = (error as AxiosError<{ message?: string | string[] }>).response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || 'Unable to complete the request.';
};

const FieldReportsPage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const profileResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
      const currentProfile: VolunteerProfile = profileResponse.data?.data || profileResponse.data;
      setProfile(currentProfile);
      const response = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_FIELD_REPORTS);
      const data = response.data?.data || response.data || [];
      setReports(Array.isArray(data) ? data : []);
    } catch (error) {
      setReports([]);
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side API synchronization follows the existing project pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitReport = async (endpoint: string, payload: object) => {
    setSaving(true);
    setMessage(null);
    try {
      await axiosSecure.post(endpoint, payload);
      setMessage({ type: 'success', text: 'Field report submitted successfully.' });
      await loadReports();
      return true;
    } catch (error) {
      setMessage({ type: 'error', text: getError(error) });
      return false;
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;
  const verified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6"><h1 className="text-2xl font-bold tracking-tight">Field Reports</h1><p className="mt-1 text-xs text-muted-foreground">Report route hazards and urgent resource shortages from affected areas.</p></div>
      {message && <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : ''}><AlertDescription>{message.text}</AlertDescription></Alert>}
      {!verified && <Alert><AlertDescription>Verification is required before submitting a field report. Existing reports remain visible below.</AlertDescription></Alert>}
      {verified && <div className="grid items-start gap-4 xl:grid-cols-2"><RouteReportForm saving={saving} onSubmit={(payload) => submitReport(ENDPOINTS.VOLUNTEERS.REPORT_ROUTE, payload)} /><ShortageReportForm saving={saving} onSubmit={(payload) => submitReport(ENDPOINTS.VOLUNTEERS.REPORT_SHORTAGE, payload)} /></div>}

      <div className="space-y-3">
        <div><h2 className="text-base font-bold">My previous reports</h2><p className="text-[11px] text-muted-foreground">Most recent field submissions appear first.</p></div>
        {reports.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70"><FileWarning className="size-8 text-muted-foreground/60" /><p className="mt-2 text-xs text-muted-foreground">No field reports submitted yet.</p></div>
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {reports.map((report) => (
              <article key={report.id} className="rounded-xl border border-border/70 bg-card p-4 shadow-sm space-y-2">
                <div className="flex items-center justify-between gap-2"><h3 className="text-xs font-bold">{report.report_type === 'resource_shortage' ? report.resource_name : formatVolunteerValue(report.report_type)}</h3><Badge variant={report.severity === 'critical' ? 'destructive' : 'secondary'}>{report.severity}</Badge></div>
                <p className="text-xs leading-relaxed text-muted-foreground">{report.description}</p>
                <p className="text-[11px] text-muted-foreground">{report.address || `${report.latitude}, ${report.longitude}`}{report.quantity_needed ? ` · Quantity: ${report.quantity_needed}` : ''}</p>
                {report.created_at && <p className="text-[10px] text-muted-foreground">{new Date(report.created_at).toLocaleString()}</p>}
              </article>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldReportsPage;
