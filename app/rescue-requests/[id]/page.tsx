'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  MapPin,
  Users,
  Phone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Trash2,
  Clock,
  HeartPulse,
  Lock,
  ExternalLink,
  LifeBuoy,
  ZoomIn,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import MuiModal from '@/components/mui-modal';
import LeafletMap from '@/components/leaflet-map';
import { publicApi } from '@/app/lib/public-api';
import useAuth from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { RescueRequest } from '@/components/rescue-requests/types';
import AddRescueRequestDrawer from '@/components/rescue-requests/add-rescue-request-drawer';

const getUrgencyVariant = (urgency?: string) => {
  const u = urgency?.toUpperCase();
  if (u === 'CRITICAL') return 'destructive';
  if (u === 'HIGH') return 'default';
  return 'secondary';
};

const getStatusVariant = (status?: string) => {
  const s = status?.toUpperCase();
  if (s === 'RESCUED') return 'default';
  if (s === 'PENDING') return 'destructive';
  return 'secondary';
};

const RescueRequestDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();

  const id = params?.id as string;

  const [request, setRequest] = useState<RescueRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fetchRequest = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get(`/rescue-requests/${id}`);
      const data = res.data?.data || res.data;
      setRequest(data);
    } catch {
      setRequest(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchRequest();
    }
  }, [id]);

  const isOwner = !!(
    user &&
    request &&
    (user.id === request.user_id ||
      user.id === request.user?.id ||
      user.role === 'ADMIN')
  );

  const isRescued = request?.status?.toUpperCase() === 'RESCUED';

  const handleToggleRescued = async () => {
    if (!request) return;
    try {
      setActionLoading(true);
      const newStatus = isRescued ? 'PENDING' : 'RESCUED';
      await axiosSecure.patch(`/rescue-requests/${request.id}/status`, {
        status: newStatus,
      });
      await fetchRequest();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!request) return;
    if (!window.confirm('Are you sure you want to delete this rescue request?')) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(`/rescue-requests/${request.id}`);
      router.push('/rescue-requests');
    } finally {
      setActionLoading(false);
    }
  };

  const googleMapsUrl =
    request?.latitude && request?.longitude
      ? `https://www.google.com/maps?q=${request.latitude},${request.longitude}`
      : null;

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
                <BreadcrumbLink render={<Link href="/rescue-requests" />}>
                  Rescue Requests
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {request?.address || `Request #${id.slice(0, 8)}`}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {loading ? (
            <div className="space-y-6 animate-pulse">
              <div className="h-32 rounded-lg bg-muted/40" />
              <div className="space-y-3">
                <div className="h-8 w-1/3 bg-muted/40 rounded" />
                <div className="h-4 w-1/2 bg-muted/30 rounded" />
                <div className="h-24 w-full bg-muted/20 rounded" />
              </div>
            </div>
          ) : !request ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="size-12 text-muted-foreground/60 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                Rescue Request Not Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The rescue request you are looking for does not exist or may have been resolved.
              </p>
              <Button
                render={<Link href="/rescue-requests" />}
                variant="outline"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to Rescue Requests
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-5 border-b border-border/40">
                  <div className="flex items-center gap-4">
                    <div
                      onClick={() => request.photo_url && setIsPhotoModalOpen(true)}
                      className={`relative group size-20 sm:size-24 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center overflow-hidden shrink-0 ${
                        request.photo_url ? 'cursor-pointer hover:border-emerald-500 transition-all shadow-sm' : ''
                      }`}
                    >
                      {request.photo_url ? (
                        <>
                          <img
                            src={request.photo_url}
                            alt="Rescue Scene"
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                            <ZoomIn className="size-5" />
                          </div>
                        </>
                      ) : (
                        <LifeBuoy className="size-8 text-emerald-600" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                        {request.address || `Emergency Alert #${request.id.slice(0, 8)}`}
                      </h1>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={getStatusVariant(request.status)}
                          className="text-[10px] px-2 py-0.5 uppercase font-bold"
                        >
                          {request.status}
                        </Badge>
                        <Badge
                          variant={getUrgencyVariant(request.urgency_level)}
                          className="text-[10px] px-2 py-0.5 uppercase font-bold"
                        >
                          {request.urgency_level}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {isOwner && (
                    <div className="flex sm:flex-col items-center sm:items-end gap-1.5 shrink-0">
                      <Button
                        variant={isRescued ? 'outline' : 'default'}
                        size="sm"
                        onClick={handleToggleRescued}
                        disabled={actionLoading}
                        className="h-8 text-xs gap-1 font-semibold w-full sm:w-32"
                      >
                        <CheckCircle2 className="size-3" />
                        {isRescued ? 'Mark Pending' : 'Mark Rescued'}
                      </Button>

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
                        onClick={handleDelete}
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
                        People Count
                      </span>
                      <span className="text-foreground font-semibold block">
                        {request.people_count} {request.people_count === 1 ? 'Person' : 'People'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Urgency Level
                      </span>
                      <span className="text-foreground font-semibold block">
                        {request.urgency_level || 'Normal'}
                      </span>
                    </div>

                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Location / Address
                      </span>
                      <span className="text-foreground font-semibold block">
                        {request.address || 'Address not provided'}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Status
                      </span>
                      <span className="text-foreground font-semibold block">
                        {request.status}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Reported At
                      </span>
                      <span className="text-foreground font-medium block text-xs">
                        {request.created_at
                          ? new Date(request.created_at).toLocaleDateString()
                          : 'N/A'}
                      </span>
                    </div>

                    <div className="space-y-0.5 col-span-2">
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                        Emergency Contact
                      </span>
                      {user ? (
                        <div className="flex flex-wrap items-center gap-2 pt-0.5">
                          <span className="text-foreground font-semibold text-sm">
                            {request.contact_phone || 'No phone provided'}
                          </span>
                          {request.contact_phone && (
                            <Button
                              render={<a href={`tel:${request.contact_phone}`} />}
                              size="sm"
                              variant="outline"
                              className="h-6 text-xs px-2 gap-1"
                            >
                              <Phone className="size-3" />
                              Call
                            </Button>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground pt-0.5">
                          <Lock className="size-3 text-amber-500 shrink-0" />
                          <span>
                            <Link
                              href={`/sign-in?redirect=/rescue-requests/${id}`}
                              className="font-semibold text-emerald-600 underline"
                            >
                              Sign in
                            </Link>{' '}
                            to view phone
                          </span>
                        </div>
                      )}
                    </div>

                    {request.latitude && request.longitude && (
                      <div className="space-y-0.5 col-span-2">
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                          GPS Coordinates
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-semibold text-foreground">
                            {Number(request.latitude).toFixed(5)}, {Number(request.longitude).toFixed(5)}
                          </span>
                          {googleMapsUrl && (
                            <a
                              href={googleMapsUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:underline"
                            >
                              <ExternalLink className="size-3" />
                              Google Maps
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {request.description && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Situation & Description
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {request.description}
                    </p>
                  </div>
                )}

                {request.medical_notes && (
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Medical Notes
                    </span>
                    <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                      {request.medical_notes}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-border/50">
                  <Button
                    render={<Link href="/rescue-requests" />}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    <ArrowLeft className="size-3.5 mr-1" />
                    All Rescue Requests
                  </Button>
                </div>
              </div>

              <div className="w-full">
                <Card className="overflow-hidden p-0 border border-border/60">
                  {request.latitude && request.longitude ? (
                    <div className="h-[460px] w-full">
                      <LeafletMap
                        latitude={Number(request.latitude)}
                        longitude={Number(request.longitude)}
                        popupText={request.address || 'Rescue Scene Location'}
                      />
                    </div>
                  ) : (
                    <div className="h-[360px] flex flex-col items-center justify-center text-center p-6 text-muted-foreground space-y-2">
                      <MapPin className="size-10 text-muted-foreground/40" />
                      <p className="text-sm font-medium">No GPS coordinates provided for this rescue request.</p>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          )}
        </div>
      </main>

      <MuiModal
        open={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title="Rescue Scene Photo"
        maxWidth="md"
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsPhotoModalOpen(false)}
            className="rounded-xl text-xs"
          >
            Close
          </Button>
        }
      >
        {request?.photo_url && (
          <div className="w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/5">
            <img
              src={request.photo_url}
              alt="Rescue Scene"
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        )}
      </MuiModal>

      <AddRescueRequestDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => {
          setIsEditOpen(false);
          fetchRequest();
        }}
        editRequest={request}
      />
    </div>
  );
};

export default RescueRequestDetailPage;
