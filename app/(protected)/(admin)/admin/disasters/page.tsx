'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Filter,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ShieldAlert,
  MapPin,
  Calendar,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface DisasterRecord {
  id: string;
  disaster_name: string;
  disaster_type: string;
  impacted_location: string;
  impact_time: string;
  severity_level?: string;
  is_verified: boolean;
  created_at: string;
}

export default function AdminDisastersPage() {
  const axiosSecure = useAxiosSecure();
  const [disasters, setDisasters] = useState<DisasterRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [verifiedFilter, setVerifiedFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchDisasters = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (verifiedFilter !== 'all') {
        params.verified = verifiedFilter === 'verified' ? 'true' : 'false';
      }
      const res = await axiosSecure.get('/admin/disasters', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setDisasters(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setDisasters(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch disasters:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, verifiedFilter]);

  useEffect(() => {
    fetchDisasters();
  }, [fetchDisasters]);

  const handleVerifyToggle = async (disasterId: string, currentVerified: boolean) => {
    const nextStatus = !currentVerified;
    try {
      await axiosSecure.patch(`/admin/disasters/${disasterId}/verify`, {
        verified: nextStatus,
      });
      setSuccessMsg(
        `Disaster alert ${nextStatus ? 'VERIFIED' : 'UNVERIFIED'} successfully`
      );
      fetchDisasters();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to verify disaster:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-6 text-amber-600" />
            <h1 className="text-2xl font-bold text-foreground">Disaster Alert Verification</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review emergency disaster reports and broadcast official verified alerts.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1 font-semibold">
          Total: {total} Disasters
        </Badge>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-sm font-semibold">
          <CheckCircle2 className="size-5 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      <Card className="border-border/60">
        <CardHeader className="p-4 sm:p-6 pb-2">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Filter className="size-4 text-muted-foreground" />
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Verification:</span>
              <select
                value={verifiedFilter}
                onChange={(e) => {
                  setVerifiedFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs rounded-md border border-input bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Alerts</option>
                <option value="verified">Verified Alerts</option>
                <option value="unverified">Unverified Alerts</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Disaster Name</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Impact Time</th>
                  <th className="p-3.5">Verification</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                      Loading disaster reports...
                    </td>
                  </tr>
                ) : disasters.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                      No disaster reports found.
                    </td>
                  </tr>
                ) : (
                  disasters.map((disaster) => (
                    <tr key={disaster.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold text-foreground">
                        {disaster.disaster_name}
                      </td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="uppercase text-[10px] font-bold">
                          {disaster.disaster_type}
                        </Badge>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-rose-500 shrink-0" />
                          <span>{disaster.impacted_location}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {new Date(disaster.impact_time || disaster.created_at).toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="p-3.5">
                        {disaster.is_verified ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 gap-1 font-bold">
                            <ShieldCheck className="size-3.5" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-300 gap-1 font-bold">
                            <ShieldAlert className="size-3.5" />
                            <span>Unverified</span>
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right">
                        {disaster.is_verified ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1 text-xs font-semibold border-amber-500/40 text-amber-600 hover:bg-amber-500/10"
                            onClick={() => handleVerifyToggle(disaster.id, true)}
                          >
                            <XCircle className="size-3.5" />
                            <span>Unverify</span>
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="h-8 gap-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500"
                            onClick={() => handleVerifyToggle(disaster.id, false)}
                          >
                            <ShieldCheck className="size-3.5" />
                            <span>Verify Alert</span>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between p-4 border-t border-border/40 mt-4">
            <span className="text-xs text-muted-foreground font-medium">
              Page {page} of {totalPages} ({total} Total)
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <ChevronLeft className="size-3.5" />
                <span>Prev</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                className="h-8 text-xs font-semibold gap-1"
              >
                <span>Next</span>
                <ChevronRight className="size-3.5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
