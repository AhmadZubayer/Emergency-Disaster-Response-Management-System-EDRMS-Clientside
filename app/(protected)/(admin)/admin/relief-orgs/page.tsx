'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  CheckCircle2,
  XCircle,
  Clock,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Globe,
  Mail,
  Phone,
  FileText,
  ExternalLink,
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

interface ReliefOrgRecord {
  id: string;
  user_id: string;
  organization_name: string;
  registration_number: string;
  address: string;
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  description?: string;
  admin_verified: boolean;
  verification_doc?: string;
  created_at: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export default function AdminReliefOrgsPage() {
  const axiosSecure = useAxiosSecure();
  const [orgs, setOrgs] = useState<ReliefOrgRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  // Review Modal State
  const [selectedOrg, setSelectedOrg] = useState<ReliefOrgRecord | null>(null);
  const [updating, setUpdating] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchOrgs = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { page, limit: 10 };
      if (statusFilter !== 'all') {
        params.status = statusFilter;
      }
      const res = await axiosSecure.get('/admin/relief-orgs', { params });
      const responseData = res.data?.data || res.data;

      if (responseData?.data) {
        setOrgs(responseData.data);
        setTotalPages(responseData.meta?.totalPages || 1);
        setTotal(responseData.meta?.total || responseData.data.length);
      } else if (Array.isArray(responseData)) {
        setOrgs(responseData);
        setTotalPages(1);
        setTotal(responseData.length);
      }
    } catch (error) {
      console.error('Failed to fetch relief orgs:', error);
    } finally {
      setLoading(false);
    }
  }, [axiosSecure, page, statusFilter]);

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleVerifyToggle = async (orgId: string, status: boolean) => {
    setUpdating(true);
    try {
      await axiosSecure.patch(`/admin/relief-orgs/${orgId}/verify`, { status });
      setSuccessMsg(
        `Relief Organization ${status ? 'VERIFIED' : 'UNVERIFIED'} successfully`
      );
      setSelectedOrg(null);
      fetchOrgs();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (error) {
      console.error('Failed to verify relief organization:', error);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card border border-border/60 p-6 rounded-2xl shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="size-6 text-purple-600" />
            <h1 className="text-2xl font-bold text-foreground">Relief Organization Verifications</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Review organization registration numbers, legal documentation, and manage official verification.
          </p>
        </div>
        <Badge variant="secondary" className="self-start sm:self-auto text-xs px-3 py-1 font-semibold">
          Total: {total} Organizations
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
                <option value="all">All Organizations</option>
                <option value="pending">Pending Only</option>
                <option value="verified">Verified Only</option>
              </select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0 sm:p-6 pt-4">
          <div className="overflow-x-auto border-t sm:border border-border/40 sm:rounded-xl">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  <th className="p-3.5">Organization</th>
                  <th className="p-3.5">Reg Number</th>
                  <th className="p-3.5">Address</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      Loading organization records...
                    </td>
                  </tr>
                ) : orgs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-muted-foreground font-medium">
                      No relief organizations found.
                    </td>
                  </tr>
                ) : (
                  orgs.map((org) => (
                    <tr key={org.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5 font-semibold text-foreground">
                        {org.organization_name || 'Unnamed Org'}
                        <div className="text-xs text-muted-foreground font-normal">
                          Owner: {org.user?.name || org.user?.email || 'N/A'}
                        </div>
                      </td>
                      <td className="p-3.5 font-mono text-xs font-bold text-foreground">
                        {org.registration_number || 'N/A'}
                      </td>
                      <td className="p-3.5 text-xs text-muted-foreground max-w-[200px] truncate">
                        {org.address || 'N/A'}
                      </td>
                      <td className="p-3.5">
                        {org.admin_verified ? (
                          <Badge className="bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/20 border-emerald-300 gap-1">
                            <CheckCircle2 className="size-3" />
                            <span>Verified</span>
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-amber-500/15 text-amber-600 border-amber-300 gap-1">
                            <Clock className="size-3" />
                            <span>Pending</span>
                          </Badge>
                        )}
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 gap-1 text-xs font-semibold"
                          onClick={() => setSelectedOrg(org)}
                        >
                          <Eye className="size-3.5 text-purple-600" />
                          <span>Inspect</span>
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

      {/* Inspect Modal */}
      {selectedOrg && (
        <Dialog open={!!selectedOrg} onOpenChange={() => setSelectedOrg(null)}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Building2 className="size-5 text-purple-600" />
                <span>Organization Review</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-3 text-sm">
              <div className="p-4 rounded-xl bg-purple-500/5 border border-purple-200/50 space-y-2">
                <div className="font-bold text-base text-foreground">{selectedOrg.organization_name}</div>
                <div className="text-xs flex items-center gap-2 text-muted-foreground">
                  <span className="font-semibold text-foreground">Reg No:</span>
                  <span className="font-mono bg-background px-2 py-0.5 rounded border border-border/40 font-bold text-purple-700">
                    {selectedOrg.registration_number}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block">Email</span>
                  <div className="flex items-center gap-1 font-mono text-foreground truncate">
                    <Mail className="size-3 text-muted-foreground" />
                    <span>{selectedOrg.contact_email || 'N/A'}</span>
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-muted/40 border border-border/40 space-y-1">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block">Phone</span>
                  <div className="flex items-center gap-1 font-mono text-foreground">
                    <Phone className="size-3 text-muted-foreground" />
                    <span>{selectedOrg.contact_phone || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedOrg.website && (
                <div className="text-xs">
                  <span className="font-bold text-muted-foreground uppercase tracking-wider block mb-1">Website</span>
                  <a
                    href={selectedOrg.website.startsWith('http') ? selectedOrg.website : `https://${selectedOrg.website}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 hover:underline font-semibold"
                  >
                    <Globe className="size-3.5" />
                    <span>{selectedOrg.website}</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              )}

              <div>
                <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                  Address
                </span>
                <div className="p-3 rounded-lg bg-background border border-border/60 text-xs text-foreground">
                  {selectedOrg.address}
                </div>
              </div>

              {selectedOrg.description && (
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                    Description
                  </span>
                  <div className="p-3 rounded-lg bg-background border border-border/60 text-xs text-muted-foreground">
                    {selectedOrg.description}
                  </div>
                </div>
              )}

              {selectedOrg.verification_doc && (
                <div>
                  <span className="text-xs font-bold uppercase text-muted-foreground tracking-wider block mb-1">
                    Verification Attachment
                  </span>
                  <a
                    href={selectedOrg.verification_doc.startsWith('/') ? `/user-files${selectedOrg.verification_doc}` : selectedOrg.verification_doc}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 p-2.5 rounded-lg border border-purple-300/50 bg-purple-500/10 text-purple-700 font-semibold text-xs hover:bg-purple-500/20 transition-colors"
                  >
                    <FileText className="size-4" />
                    <span>View Verification Document</span>
                    <ExternalLink className="size-3.5 ml-auto" />
                  </a>
                </div>
              )}
            </div>

            <DialogFooter className="gap-2 sm:justify-between">
              {selectedOrg.admin_verified ? (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleVerifyToggle(selectedOrg.id, false)}
                  disabled={updating}
                  className="gap-1"
                >
                  <XCircle className="size-4" />
                  <span>Revoke Verification</span>
                </Button>
              ) : (
                <Button
                  size="sm"
                  onClick={() => handleVerifyToggle(selectedOrg.id, true)}
                  disabled={updating}
                  className="bg-emerald-600 hover:bg-emerald-500 gap-1"
                >
                  <CheckCircle2 className="size-4" />
                  <span>Approve & Verify Org</span>
                </Button>
              )}

              <Button variant="outline" size="sm" onClick={() => setSelectedOrg(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
