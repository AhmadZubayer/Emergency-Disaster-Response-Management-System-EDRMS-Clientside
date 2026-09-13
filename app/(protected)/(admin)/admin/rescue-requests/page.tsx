'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  LifeBuoy,
  Filter,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Phone,
  Eye,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
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

interface RescueRecord {
  id: string;
  requester_name?: string;
  contact_phone?: string;
  location: string;
  latitude?: number;
  longitude?: number;
  urgency_level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | string;
  number_of_people?: number;
  details?: string;
  created_at: string;
}

export default function AdminRescueRequestsPage() {
  const axiosSecure = useAxiosSecure();
  const [requests, setRequests] = useState<RescueRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);
  const [selectedRequest, setSelectedRequest] = useState<RescueRecord | null>(null);

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await axiosSecure.get('/admin/rescue-requests', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setRequests(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setRequests(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch rescue requests:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, statusFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const getUrgencyBadge = (urgency: string) => {
    const u = urgency?.toUpperCase();
    if (u === 'CRITICAL' || u === 'HIGH') {
      return (
        <Badge variant="destructive" className="font-bold text-[10px] uppercase gap-1">
          <AlertTriangle className="size-3" />
          <span>{u}</span>
        </Badge>
      );
    }
    return (
      <Badge variant="secondary" className="font-bold text-[10px] uppercase">
        {u || 'MEDIUM'}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const s = status?.toUpperCase();
    switch (s) {
      case 'COMPLETED':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border-emerald-300 gap-1 font-semibold">
            <CheckCircle2 className="size-3" />
            <span>Completed</span>
          </Badge>
        );
      case 'IN_PROGRESS':
        return (
          <Badge variant="secondary" className="bg-blue-500/15 text-blue-600 border-blue-300 gap-1 font-semibold">
            <Clock className="size-3" />
            <span>In Progress</span>
          </Badge>
        );
      case 'CANCELLED':
        return (
          <Badge variant="outline" className="text-muted-foreground gap-1">
            <XCircle className="size-3" />
            <span>Cancelled</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-300 gap-1 font-semibold">
            <Clock className="size-3" />
            <span>Pending</span>
          </Badge>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <LifeBuoy className="size-6 text-rose-600" />
            <h1 className="text-2xl font-bold text-foreground">Rescue Requests Monitor</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Real-time emergency rescue requests tracking and dispatch overview.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1 font-semibold">
          Total: {total} Calls
        </Badge>
      </div>

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
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Requester</th>
                  <th className="p-3.5">Urgency</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                      Loading rescue calls...
                    </td>
                  </tr>
                ) : requests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-muted-foreground font-medium">
                      No rescue requests found.
                    </td>
                  </tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-bold text-foreground">
                        {req.requester_name || 'Anonymous'}
                        <div className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                          <Phone className="size-3" />
                          <span>{req.contact_phone || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="p-3.5">{getUrgencyBadge(req.urgency_level)}</td>
                      <td className="p-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3.5 text-rose-500 shrink-0" />
                          <span>{req.location}</span>
                        </div>
                      </td>
                      <td className="p-3.5">{getStatusBadge(req.status)}</td>
                      <td className="p-3.5 text-xs text-muted-foreground">
                        {new Date(req.created_at).toLocaleString()}
                      </td>
                      <td className="p-3.5 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs font-semibold"
                          onClick={() => setSelectedRequest(req)}
                        >
                          <Eye className="size-3.5 text-rose-600" />
                          <span>View</span>
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

      {/* Detail Modal */}
      {selectedRequest && (
        <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <LifeBuoy className="size-5 text-rose-600" />
                <span>Emergency Rescue Details</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div className="p-4 rounded-xl bg-rose-500/5 border border-rose-200/50 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-base text-foreground">
                    {selectedRequest.requester_name || 'Anonymous Requester'}
                  </div>
                  {getUrgencyBadge(selectedRequest.urgency_level)}
                </div>
                <div className="text-xs text-muted-foreground flex items-center gap-1.5 font-mono">
                  <Phone className="size-3.5 text-rose-600" />
                  <span>Contact: {selectedRequest.contact_phone || 'N/A'}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block">
                  Location Address
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 text-xs font-semibold flex items-start gap-2">
                  <MapPin className="size-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{selectedRequest.location}</span>
                </div>
              </div>

              {selectedRequest.number_of_people && (
                <div className="text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">
                    People Needing Assistance
                  </span>
                  <div className="p-2.5 rounded-lg bg-muted/40 font-bold text-foreground">
                    {selectedRequest.number_of_people} Person(s)
                  </div>
                </div>
              )}

              {selectedRequest.details && (
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                    Emergency Description
                  </span>
                  <div className="p-3 rounded-lg bg-background border border-border/60 text-xs text-muted-foreground">
                    {selectedRequest.details}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" size="sm" onClick={() => setSelectedRequest(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
