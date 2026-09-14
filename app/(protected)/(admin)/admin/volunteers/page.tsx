'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Phone,
  Briefcase,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';

interface VolunteerRecord {
  id: string;
  user_id: string;
  emergency_contact: string;
  skills: string[] | string;
  availability: boolean;
  why_join: string;
  verification_status: 'pending' | 'verified' | 'rejected' | string;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
}

export default function AdminVolunteersPage() {
  const axiosSecure = useAxiosSecure();
  const [volunteers, setVolunteers] = useState<VolunteerRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Review Modal State
  const [selectedVolunteer, setSelectedVolunteer] = useState<VolunteerRecord | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchVolunteers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await axiosSecure.get('/admin/volunteers', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setVolunteers(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setVolunteers(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch volunteers:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, statusFilter]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

  const handleVerify = async (volunteerId: string, status: 'verified' | 'rejected' | 'pending') => {
    setUpdating(true);
    try {
      await axiosSecure.patch(`/admin/volunteers/${volunteerId}/verify`, { status });
      setSuccessMsg(`Volunteer status updated to ${status.toUpperCase()}`);
      setSelectedVolunteer(null);
      fetchVolunteers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to verify volunteer:', error);
    } finally {
      setUpdating(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = status.toLowerCase();
    if (s === 'verified') {
      return (
        <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-300 gap-1">
          <CheckCircle2 className="size-3" />
          <span>Verified</span>
        </Badge>
      );
    }
    if (s === 'rejected') {
      return (
        <Badge variant="destructive" className="gap-1">
          <XCircle className="size-3" />
          <span>Rejected</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-300 gap-1">
        <Clock className="size-3" />
        <span>Pending</span>
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <UserCheck className="size-6 text-emerald-600" />
            <h1 className="text-2xl font-bold text-foreground">Volunteer Verifications</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review volunteer credentials, rescue skills, and verify accounts.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1 font-semibold">
          Total: {total} Volunteers
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
              <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs rounded-md border border-input bg-background px-3 font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="verified">Verified Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Volunteer</th>
                  <th className="p-3.5">Contact</th>
                  <th className="p-3.5">Skills</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      Loading volunteer records...
                    </td>
                  </tr>
                ) : volunteers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      No volunteers found.
                    </td>
                  </tr>
                ) : (
                  volunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-semibold text-foreground">
                        {vol.user?.name || 'Unnamed Volunteer'}
                        <div className="text-xs text-muted-foreground font-normal">{vol.user?.email}</div>
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1 font-mono">
                          <Phone className="size-3 text-muted-foreground" />
                          <span>{vol.emergency_contact || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-xs">
                        {Array.isArray(vol.skills)
                          ? vol.skills.join(', ')
                          : vol.skills || 'No skills listed'}
                      </td>
                      <td className="p-3.5">{getStatusBadge(vol.verification_status)}</td>
                      <td className="p-3.5 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs font-semibold"
                          onClick={() => setSelectedVolunteer(vol)}
                        >
                          <Eye className="size-3.5 text-emerald-600" />
                          <span>Review</span>
                        </Button>
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

      {/* Review Modal */}
      {selectedVolunteer && (
        <Dialog open={!!selectedVolunteer} onOpenChange={() => setSelectedVolunteer(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <UserCheck className="size-5 text-emerald-600" />
                <span>Volunteer Review</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div className="p-4 rounded-xl bg-muted/40 border border-border/40 space-y-2">
                <div className="font-bold text-base text-foreground">
                  {selectedVolunteer.user?.name || 'Unnamed Volunteer'}
                </div>
                <div className="text-xs text-muted-foreground">{selectedVolunteer.user?.email}</div>
                <div className="text-xs flex items-center gap-1.5 text-muted-foreground pt-1">
                  <Phone className="size-3.5 text-emerald-600" />
                  <span>Emergency Contact: <strong>{selectedVolunteer.emergency_contact || 'N/A'}</strong></span>
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                  Skills & Capabilities
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 text-xs font-medium text-foreground">
                  {Array.isArray(selectedVolunteer.skills)
                    ? selectedVolunteer.skills.join(', ')
                    : selectedVolunteer.skills || 'None'}
                </div>
              </div>

              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                  Statement / Why Join
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 text-xs text-muted-foreground italic">
                  "{selectedVolunteer.why_join || 'No statement provided.'}"
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleVerify(selectedVolunteer.id, 'rejected')}
                disabled={updating}
                className="gap-1"
              >
                <XCircle className="size-4" />
                <span>Reject</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedVolunteer(null)}>
                  Close
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleVerify(selectedVolunteer.id, 'verified')}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-500 gap-1"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Verify Volunteer</span>
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
