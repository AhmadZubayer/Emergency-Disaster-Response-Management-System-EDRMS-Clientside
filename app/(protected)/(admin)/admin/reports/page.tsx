'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  FileSpreadsheet,
  Download,
  RefreshCw,
  CheckCircle2,
  Users,
  UserCheck,
  Building2,
  AlertTriangle,
  LifeBuoy,
  MessageSquare,
  FileJson,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface SystemReport {
  accounts: number;
  volunteers: number;
  reliefOrgs: number;
  disasters: number;
  rescueRequests: number;
  posts: number;
  generatedAt: string;
}

export default function AdminReportsPage() {
  const axiosSecure = useAxiosSecure();
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get('/admin/reports');
      setReport(res.data?.data || res.data);
    } catch (error) {
      console.error('Failed to fetch admin report:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const downloadJSON = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `edrms-system-report-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess('JSON report downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const downloadCSV = () => {
    if (!report) return;
    const csvContent =
      'Metric,Value\n' +
      `Total Accounts,${report.accounts}\n` +
      `Volunteers,${report.volunteers}\n` +
      `Relief Organizations,${report.reliefOrgs}\n` +
      `Disaster Alerts,${report.disasters}\n` +
      `Rescue Requests,${report.rescueRequests}\n` +
      `Community Posts,${report.posts}\n` +
      `Generated At,${new Date(report.generatedAt).toISOString()}\n`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `edrms-system-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
    setDownloadSuccess('CSV report downloaded successfully!');
    setTimeout(() => setDownloadSuccess(null), 4000);
  };

  const metrics = [
    { label: 'Registered Accounts', value: report?.accounts ?? 0, icon: Users, color: 'text-blue-600' },
    { label: 'Registered Volunteers', value: report?.volunteers ?? 0, icon: UserCheck, color: 'text-emerald-600' },
    { label: 'Relief Organizations', value: report?.reliefOrgs ?? 0, icon: Building2, color: 'text-purple-600' },
    { label: 'Disaster Alerts Reported', value: report?.disasters ?? 0, icon: AlertTriangle, color: 'text-amber-600' },
    { label: 'Rescue Emergency Calls', value: report?.rescueRequests ?? 0, icon: LifeBuoy, color: 'text-rose-600' },
    { label: 'Community Posts', value: report?.posts ?? 0, icon: MessageSquare, color: 'text-teal-600' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="size-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-foreground">System Summary Reports</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Generate and export operational disaster management analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchReport}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`size-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={downloadJSON}
            disabled={!report || loading}
            className="gap-1.5"
          >
            <FileJson className="size-3.5 text-blue-600" />
            <span>Export JSON</span>
          </Button>

          <Button
            size="sm"
            onClick={downloadCSV}
            disabled={!report || loading}
            className="bg-emerald-600 hover:bg-emerald-500 gap-1.5"
          >
            <Download className="size-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{downloadSuccess}</span>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-bold">Operation Metrics Breakdown</CardTitle>
            {report?.generatedAt && (
              <Badge variant="outline" className="text-xs font-mono">
                Generated: {new Date(report.generatedAt).toLocaleString()}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="p-4 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
                      {item.label}
                    </span>
                    <span className="text-2xl font-extrabold text-foreground">
                      {loading ? '...' : item.value}
                    </span>
                  </div>
                  <div className={`p-3 rounded-xl bg-background border border-border/40 ${item.color}`}>
                    {/* <Icon className="size-5" /> */}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
