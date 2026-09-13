'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Trash2,
  ShieldCheck,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import MuiModal from '@/components/mui-modal';
import { toast } from '@/components/ui/toast';
import LeafletMap from '@/components/leaflet-map';
import { axiosSecure, publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import { Disaster } from '@/components/disaster/types';
import AddDisasterDrawer from '@/components/disaster/add-disaster-drawer';

const DisasterDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id as string;

  const [disaster, setDisaster] = useState<Disaster | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const [confirmSafeModal, setConfirmSafeModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [togglingUserSafety, setTogglingUserSafety] = useState(false);

  const fetchDisaster = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get(`/disaster/${id}`);
      const data = res.data?.data || res.data;
      setDisaster(data);
    } catch {
      setDisaster(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    if (!user) return;
    try {
      const res = await axiosSecure.get('/users/profile');
      const data = res.data?.data || res.data;
      setUserProfile(data);
    } catch {
      setUserProfile(null);
    }
  };

  useEffect(() => {
    if (id) {
      fetchDisaster();
    }
  }, [id]);

  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  const isReliefOrgOrAdmin = !!(
    user && (user.role === 'RELIEF_ORG' || user.role === 'ADMIN')
  );

  const handleToggleUserSafety = async () => {
    try {
      setTogglingUserSafety(true);
      await axiosSecure.patch('/users/is-safe');
      await fetchUserProfile();
    } finally {
      setTogglingUserSafety(false);
    }
  };

  const handleMarkDisasterSafe = async () => {
    if (!disaster) return;
    try {
      setActionLoading(true);
      await axiosSecure.patch(`/disaster/${disaster.id}/mark-safe`);
      toast.add({
        id: `disaster-safe-${disaster.id}`,
        title: `Disaster alert "${disaster.disaster_name}" marked as safe.`,
        type: 'success',
        timeout: 4000,
      });
      setConfirmSafeModal(false);
      await fetchDisaster();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteDisaster = async () => {
    if (!disaster) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(`/disaster/${disaster.id}`);
      toast.add({
        id: `disaster-delete-${disaster.id}`,
        title: `Disaster alert "${disaster.disaster_name}" deleted.`,
        type: 'success',
        timeout: 4000,
      });
      setConfirmDeleteModal(false);
      router.push('/disaster');
    } finally {
      setActionLoading(false);
    }
  };

  const fallbackLat = 23.8103;
  const fallbackLng = 90.4125;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full space-y-6">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/disaster" />}>
                  Disasters
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {disaster?.disaster_name || `Alert #${id.slice(0, 8)}`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="pb-5 border-b border-border/40 space-y-2">
                  <Skeleton className="h-8 w-2/3" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
                <div className="space-y-4">
                  <Skeleton className="h-6 w-32" />
                  <div className="grid grid-cols-2 gap-4">
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full col-span-2 rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="h-8 w-1/3 bg-muted/40 rounded" />
                <div className="h-4 w-1/2 bg-muted/30 rounded" />
                <div className="h-24 w-full bg-muted/20 rounded" />
                <Skeleton className="h-14 w-full rounded-xl" />
                <Skeleton className="h-[460px] w-full rounded-2xl" />
              </div>
            </div>
          ) : !disaster ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="size-12 text-muted-foreground/60 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                Disaster Alert Not Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The disaster alert you are looking for does not exist or may have been removed.
              </p>
              <Button
                render={<Link href="/disaster" />}
                variant="outline"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to All Disasters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border/40">
                  <div className="space-y-1.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                      {disaster.disaster_name}
                    </h1>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant={disaster.is_verified ? 'default' : 'destructive'}
                        className="text-[10px] px-2 py-0.5 uppercase font-bold"
                      >
                        {disaster.is_verified ? 'Safe' : 'Active Warning'}
                      </Badge>
                      <Badge
                        variant="secondary"
                        className="text-[10px] px-2 py-0.5 uppercase font-bold"
                      >
                        {disaster.type}
                      </Badge>
                    </div>
                  </div>

                  {isReliefOrgOrAdmin && (
                    <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0">
                      {!disaster.is_verified && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => setConfirmSafeModal(true)}
                          disabled={actionLoading}
                          className="h-8 text-xs gap-1 font-semibold w-full sm:w-32"
                        >
                          <ShieldCheck className="size-3" />
                          Mark Safe
                        </Button>
                      )}

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditOpen(true)}
                        disabled={actionLoading}
                        className="h-8 text-xs gap-1 font-semibold w-full sm:w-32"
                      >
                        <FileEdit className="size-3" />
                        Edit
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setConfirmDeleteModal(true)}
                        disabled={actionLoading}
                        className="h-8 text-xs gap-1 font-semibold w-full sm:w-32"
                      >
                        <Trash2 className="size-3" />
                        Delete
                      </Button>
                    </div>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold tracking-tight text-foreground mb-4">
                    Details
                  </h2>

                  <div className="grid grid-cols-2 gap-y-4 gap-x-6 text-sm">
                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Disaster Type
                      </span>
                      <span className="text-foreground font-semibold block uppercase">
                        {disaster.type}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Current Status
                      </span>
                      <span className="text-foreground font-semibold block">
                        {disaster.is_verified ? 'Safe / Resolved' : 'Active Emergency'}
                      </span>
                    </div>

                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Impacted Region / Location
                      </span>
                      <span className="text-foreground font-semibold block">
                        {disaster.impacted_location}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Impact Time
                      </span>
                      <span className="text-foreground font-medium block text-xs">
                        {disaster.impact_time
                          ? new Date(disaster.impact_time).toLocaleString()
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Reported On
                      </span>
                      <span className="text-foreground font-medium block text-xs">
                        {disaster.created_at
                          ? new Date(disaster.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <Button
                    render={<Link href="/disaster" />}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <ArrowLeft className="size-3.5 mr-1" />
                    All Disasters
                  </Button>
                </div>
              </div>

              <div className="w-full space-y-3">
                {user && (
                  <div className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-card">
                    <div>
                      <p className="text-xs font-semibold text-foreground">
                        Your Safety Status
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        {userProfile?.is_safe
                          ? 'You are currently marked as safe.'
                          : 'Mark yourself safe to notify emergency responders.'}
                      </p>
                    </div>

                    <Button
                      variant={userProfile?.is_safe ? 'default' : 'outline'}
                      size="sm"
                      onClick={handleToggleUserSafety}
                      disabled={togglingUserSafety}
                      className="text-xs gap-1.5 font-semibold shrink-0"
                    >
                      {userProfile?.is_safe ? (
                        <>
                          <CheckCircle2 className="size-3.5 text-white" />
                          Marked Safe
                        </>
                      ) : (
                        <>
                          <ShieldCheck className="size-3.5" />
                          I am safe
                        </>
                      )}
                    </Button>
                  </div>
                )}

                <Card className="overflow-hidden p-0 border border-border/60">
                  <CardContent className="p-0">
                    <div className="h-[460px] w-full">
                      <LeafletMap
                        latitude={fallbackLat}
                        longitude={fallbackLng}
                        popupText={disaster.impacted_location || disaster.disaster_name}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <AddDisasterDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={fetchDisaster}
        editDisaster={disaster}
      />

      <MuiModal
        open={confirmSafeModal}
        onClose={() => setConfirmSafeModal(false)}
        title="Mark Disaster Alert as Safe"
        maxWidth="xs"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmSafeModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={handleMarkDisasterSafe}
              disabled={actionLoading}
              className="text-xs font-semibold"
            >
              {actionLoading ? 'Updating...' : 'Yes, Mark Safe'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-1">
          <ShieldCheck className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to mark <strong>{disaster?.disaster_name}</strong> as safe?
          </p>
        </div>
      </MuiModal>

      <MuiModal
        open={confirmDeleteModal}
        onClose={() => setConfirmDeleteModal(false)}
        title="Delete Disaster Alert"
        maxWidth="xs"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setConfirmDeleteModal(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDisaster}
              disabled={actionLoading}
              className="text-xs font-semibold"
            >
              {actionLoading ? 'Deleting...' : 'Yes, Delete'}
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-1">
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            Are you sure you want to delete <strong>{disaster?.disaster_name}</strong>?
          </p>
        </div>
      </MuiModal>
    </div>
  );
};

export default DisasterDetailPage;
