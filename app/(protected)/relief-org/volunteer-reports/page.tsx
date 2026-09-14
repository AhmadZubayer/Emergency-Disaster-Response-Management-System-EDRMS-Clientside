'use client';

import { useCallback, useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import { getApiErrorMessage } from '@/utils/api-error';
import OperationsDashboard, {
  LoadError,
} from '@/components/volunteers/operations-dashboard';
import {
  FieldReport,
  formatVolunteerValue,
} from '@/components/volunteers/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import MuiDrawer from '@/components/mui-drawer';

export default function VolunteerReportsPage() {
  const { user } = useAuth();
  const [reports, setReports] = useState<FieldReport[]>([]);
  const [selected, setSelected] = useState<FieldReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const load = useCallback(() => {
    return axiosSecure
      .get('/volunteers/field-reports')
      .then((response) => {
        setError('');
        setReports(response.data?.data ?? response.data);
      })
      .catch((error: unknown) => {
        setError(
          getApiErrorMessage(error, 'Unable to load volunteer reports.'),
        );
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);
  const visible = reports.filter(
    (report) => filter === 'all' || report.report_type === filter,
  );

  return (
    <OperationsDashboard role="RELIEF_ORG" tab="volunteer-reports">
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold">Volunteer Reports</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Road conditions and resource shortages reported by field
              volunteers.
            </p>
          </div>
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="size-4" />
            Refresh
          </Button>
        </div>
        <select
          aria-label="Filter reports by type"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-xs"
        >
          <option value="all">All reports</option>
          <option value="blocked_route">Blocked routes</option>
          <option value="dangerous_route">Dangerous routes</option>
          <option value="resource_shortage">Resource shortages</option>
        </select>
        {loading ? (
          <p role="status" className="py-8 text-sm text-muted-foreground">
            Loading reports...
          </p>
        ) : error ? (
          <LoadError message={error} retry={load} />
        ) : (
          <div className="rounded-lg border border-border bg-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Report</TableHead>
                  <TableHead>Volunteer</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead>Submitted</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="h-28 text-center text-muted-foreground"
                    >
                      No volunteer reports to show.
                    </TableCell>
                  </TableRow>
                ) : (
                  visible.map((report) => (
                    <TableRow
                      key={report.id}
                      className="cursor-pointer"
                      onClick={() => setSelected(report)}
                    >
                      <TableCell>
                        <button
                          type="button"
                          className="font-medium text-primary hover:underline underline-offset-4"
                          onClick={(event) => {
                            event.stopPropagation();
                            setSelected(report);
                          }}
                        >
                          {formatVolunteerValue(report.report_type)}
                        </button>
                      </TableCell>
                      <TableCell>
                        {report.volunteer?.user?.name || 'Volunteer'}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">
                        {report.address ||
                          `${report.latitude}, ${report.longitude}`}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            report.severity === 'critical' ||
                            report.severity === 'high'
                              ? 'destructive'
                              : 'outline'
                          }
                          className="capitalize"
                        >
                          {report.severity}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {report.created_at
                          ? new Date(report.created_at).toLocaleString()
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
      <MuiDrawer
        open={!!selected}
        onClose={() => setSelected(null)}
        title={
          selected
            ? formatVolunteerValue(selected.report_type)
            : 'Report Details'
        }
      >
        {selected && (
          <div className="p-6 space-y-6 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="font-medium">
                {selected.volunteer?.user?.name || 'Volunteer'}
              </span>
              <Badge variant="outline" className="capitalize">
                {selected.severity}
              </Badge>
            </div>
            <p className="whitespace-pre-wrap break-words leading-relaxed">
              {selected.description}
            </p>
            <dl className="space-y-5">
              <div>
                <dt className="text-xs text-muted-foreground">Location</dt>
                <dd className="mt-1 break-words">
                  {selected.address || 'Address not provided'}
                </dd>
                <dd className="mt-1 text-xs text-muted-foreground">
                  {selected.latitude}, {selected.longitude}
                </dd>
              </div>
              {selected.report_type === 'resource_shortage' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Resource</dt>
                    <dd className="mt-1 break-words">
                      {selected.resource_name || '—'}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Quantity needed
                    </dt>
                    <dd className="mt-1">{selected.quantity_needed ?? '—'}</dd>
                  </div>
                </div>
              )}
              <div>
                <dt className="text-xs text-muted-foreground">Submitted</dt>
                <dd className="mt-1">
                  {selected.created_at
                    ? new Date(selected.created_at).toLocaleString()
                    : '—'}
                </dd>
              </div>
            </dl>
          </div>
        )}
      </MuiDrawer>
    </OperationsDashboard>
  );
}
