'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Users,
  UserCheck,
  Building2,
  AlertTriangle,
  LifeBuoy,
  MessageSquare,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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

export default function AdminOverviewPage() {
  const axiosSecure = useAxiosSecure();
  const [report, setReport] = useState<SystemReport | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await axiosSecure.get('/admin/reports');
      setReport(res.data?.data || res.data);
    } catch (error) {
      console.error('Failed to fetch admin report:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const statCards = [
    {
      title: 'Total Accounts',
      value: report?.accounts ?? 0,
      icon: Users,
      href: '/admin/accounts',
      color: 'text-blue-600 bg-blue-500/10 border-blue-200',
    },
    {
      title: 'Volunteers',
      value: report?.volunteers ?? 0,
      icon: UserCheck,
      href: '/admin/volunteers',
      color: 'text-emerald-600 bg-emerald-500/10 border-emerald-200',
    },
    {
      title: 'Relief Organizations',
      value: report?.reliefOrgs ?? 0,
      icon: Building2,
      href: '/admin/relief-orgs',
      color: 'text-purple-600 bg-purple-500/10 border-purple-200',
    },
    {
      title: 'Disaster Alerts',
      value: report?.disasters ?? 0,
      icon: AlertTriangle,
      href: '/admin/disasters',
      color: 'text-amber-600 bg-amber-500/10 border-amber-200',
    },
    {
      title: 'Rescue Requests',
      value: report?.rescueRequests ?? 0,
      icon: LifeBuoy,
      href: '/admin/rescue-requests',
      color: 'text-rose-600 bg-rose-500/10 border-rose-200',
    },
    {
      title: 'Community Posts',
      value: report?.posts ?? 0,
      icon: MessageSquare,
      href: '/admin/community-posts',
      color: 'text-teal-600 bg-teal-500/10 border-teal-200',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="size-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time management summary and disaster response controls.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={fetchReport}
          disabled={loading}
          className="gap-2 shrink-0 self-start sm:self-auto"
        >
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="relative overflow-hidden border-border/60 hover:shadow-md transition-all">
              <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="size-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-extrabold tracking-tight text-foreground">
                  {loading ? '...' : card.value}
                </div>
                <div className="mt-4 flex items-center justify-between text-xs pt-2 border-t border-border/40">
                  <span className="text-muted-foreground font-medium">Manage records</span>
                  <Link
                    href={card.href}
                    className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 font-bold transition-colors"
                  >
                    <span>View All</span>
                    <ArrowRight className="size-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <UserCheck className="size-5 text-emerald-600" />
              <span>Pending Verifications</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Volunteer Applications</p>
                <p className="text-xs text-muted-foreground">Review skills and verify pending field volunteers.</p>
              </div>
              <Button render={<Link href="/admin/volunteers" />} size="sm" variant="outline">
                Review
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Relief Organization Verification</p>
                <p className="text-xs text-muted-foreground font-medium">Inspect official registration docs & approve organizations.</p>
              </div>
              <Button render={<Link href="/admin/relief-orgs" />} size="sm" variant="outline">
                Inspect
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="size-5 text-amber-600" />
              <span>Emergency Response Operations</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Disaster Alerts</p>
                <p className="text-xs text-muted-foreground font-medium">Verify public disaster reports and broadcast warnings.</p>
              </div>
              <Button render={<Link href="/admin/disasters" />} size="sm" variant="outline">
                Manage
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-xl bg-muted/40 border border-border/40">
              <div className="space-y-0.5">
                <p className="text-sm font-semibold text-foreground">Rescue Requests Monitor</p>
                <p className="text-xs text-muted-foreground font-medium">Track high-urgency rescue calls and dispatch status.</p>
              </div>
              <Button render={<Link href="/admin/rescue-requests" />} size="sm" variant="outline">
                Monitor
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
