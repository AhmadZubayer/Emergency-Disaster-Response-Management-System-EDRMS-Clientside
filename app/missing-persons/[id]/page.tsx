'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  MapPin,
  Calendar,
  Phone,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  FileEdit,
  Trash2,
  Lock,
  ZoomIn,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
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
import { axiosSecure, publicApi } from '@/lib/api';
import useAuth from '@/hooks/use-auth';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import AddMissingPersonDrawer from '@/components/missing-persons/add-missing-person-drawer';

const MissingPersonDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();

  const id = params?.id as string;

  const [person, setPerson] = useState<MissingPerson | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  const fetchPerson = async () => {
    try {
      setLoading(true);
      const res = await publicApi.get(`/missing-persons/${id}`);
      const data = res.data?.data || res.data;
      setPerson(data);
    } catch {
      setPerson(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchPerson();
    }
  }, [id]);

  const isOwner = !!(
    user &&
    person &&
    (user.id === person.reporter_id || user.role === 'ADMIN')
  );

  const isFound = person?.status?.toUpperCase() === 'FOUND';

  const handleToggleFound = async () => {
    if (!person) return;
    try {
      setActionLoading(true);
      const newStatus = isFound ? 'MISSING' : 'FOUND';
      await axiosSecure.patch(`/missing-persons/${person.id}/status`, {
        status: newStatus,
      });
      toast.add({
        id: `person-status-${person.id}`,
        title: `Report status updated to ${newStatus}.`,
        type: 'success',
        timeout: 4000,
      });
      await fetchPerson();
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!person) return;
    if (!window.confirm('Are you sure you want to delete this missing person report?')) return;
    try {
      setActionLoading(true);
      await axiosSecure.delete(`/missing-persons/${person.id}`);
      toast.add({
        id: `person-delete-${person.id}`,
        title: 'Missing person report moved to trash.',
        type: 'success',
        timeout: 4000,
      });
      router.push('/missing-persons');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="w-full lg:w-[65vw] mx-auto space-y-8">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/" />}>Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbLink render={<Link href="/missing-persons" />}>
                  Missing Persons
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>
                  {person?.full_name || 'Report Details'}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>

          {loading ? (
            <div className="space-y-8">
              <div className="flex items-center gap-5 pb-6 border-b border-border/40">
                <Skeleton className="size-24 sm:size-28 rounded-lg shrink-0" />
                <div className="space-y-2 flex-1">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full col-span-2 rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                  <Skeleton className="h-12 w-full col-span-2 rounded-xl" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          ) : !person ? (
            <div className="py-16 text-center space-y-4">
              <AlertCircle className="size-12 text-muted-foreground/60 mx-auto" />
              <h2 className="text-xl font-bold text-foreground">
                Missing Person Report Not Found
              </h2>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                The report you are looking for does not exist or may have been removed.
              </p>
              <Button
                render={<Link href="/missing-persons" />}
                variant="outline"
              >
                <ArrowLeft className="size-4 mr-2" />
                Back to All Reports
              </Button>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-border/40">
                <div className="flex items-center gap-5">
                  <div
                    onClick={() => person.photo_url && setIsPhotoModalOpen(true)}
                    className={`relative group size-24 sm:size-28 rounded-lg bg-muted/40 border border-border/60 flex items-center justify-center overflow-hidden shrink-0 ${
                      person.photo_url ? 'cursor-pointer hover:border-emerald-500/60 transition-all shadow-sm' : ''
                    }`}
                  >
                    {person.photo_url ? (
                      <>
                        <img
                          src={person.photo_url}
                          alt={person.full_name}
                          className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
                          <ZoomIn className="size-6" />
                        </div>
                      </>
                    ) : (
                      <User className="size-10 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
                      {person.full_name}
                    </h1>
                    <div>
                      <Badge
                        variant={isFound ? 'default' : 'destructive'}
                        className="text-[11px] px-2.5 py-0.5 uppercase font-bold"
                      >
                        {person.status}
                      </Badge>
                    </div>
                  </div>
                </div>

                {isOwner && (
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
                    <Button
                      variant={isFound ? 'outline' : 'default'}
                      size="sm"
                      onClick={handleToggleFound}
                      disabled={actionLoading}
                      className="text-xs gap-1.5 font-semibold justify-start md:justify-center w-full md:w-40"
                    >
                      <CheckCircle2 className="size-3.5" />
                      {isFound ? 'Mark as Missing' : 'Mark as Found'}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditOpen(true)}
                      disabled={actionLoading}
                      className="text-xs gap-1.5 font-semibold justify-start md:justify-center w-full md:w-40"
                    >
                      <FileEdit className="size-3.5" />
                      Edit
                    </Button>

                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleDelete}
                      disabled={actionLoading}
                      className="text-xs gap-1.5 font-semibold justify-start md:justify-center w-full md:w-40"
                    >
                      <Trash2 className="size-3.5" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>

              <div>
                <h2 className="text-xl font-bold tracking-tight text-foreground mb-6">
                  Details
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-y-6 gap-x-8 text-sm">
                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Age & Gender
                    </span>
                    <span className="text-foreground font-semibold block">
                      {person.age} yrs • {person.gender || 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Last Seen Date
                    </span>
                    <span className="text-foreground font-semibold block">
                      {person.last_seen_date
                        ? new Date(person.last_seen_date).toLocaleDateString()
                        : 'Unknown'}
                    </span>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Last Seen Location
                    </span>
                    <span className="text-foreground font-semibold block">
                      {person.last_seen_location}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Report ID
                    </span>
                    <span className="text-foreground font-mono font-medium block text-xs">
                      #{person.id.slice(0, 10)}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Filed On
                    </span>
                    <span className="text-foreground font-medium block text-xs">
                      {person.created_at
                        ? new Date(person.created_at).toLocaleDateString()
                        : 'N/A'}
                    </span>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                      Emergency Contact
                    </span>
                    {user ? (
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="text-foreground font-semibold text-sm">
                          {person.contact_phone || 'No phone provided'}
                        </span>
                        {person.contact_phone && (
                          <Button
                            render={<a href={`tel:${person.contact_phone}`} />}
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs gap-1.5"
                          >
                            <Phone className="size-3" />
                            Call
                          </Button>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Lock className="size-3 text-muted-foreground shrink-0" />
                        <span>
                          <Link
                            href={`/sign-in?returnUrl=/missing-persons/${id}`}
                            className="font-semibold text-foreground underline hover:text-primary"
                          >
                            Sign in
                          </Link>{' '}
                          to view phone
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {person.description && (
                <div className="space-y-2 pt-2">
                  <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold block">
                    Description & Case Notes
                  </span>
                  <p className="text-sm leading-relaxed text-foreground/90 whitespace-pre-wrap">
                    {person.description}
                  </p>
                </div>
              )}

              <div className="pt-6 border-t border-border/50">
                <Button
                  render={<Link href="/missing-persons" />}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  <ArrowLeft className="size-3.5 mr-1" />
                  All Reports
                </Button>
              </div>
            </div>
          )}
        </div>
      </main>

      <MuiModal
        open={isPhotoModalOpen}
        onClose={() => setIsPhotoModalOpen(false)}
        title={person?.full_name}
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
        {person?.photo_url && (
          <div className="w-full flex items-center justify-center overflow-hidden rounded-xl bg-black/5">
            <img
              src={person.photo_url}
              alt={person.full_name}
              className="max-h-[75vh] w-auto object-contain rounded-xl"
            />
          </div>
        )}
      </MuiModal>

      <AddMissingPersonDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={() => {
          setIsEditOpen(false);
          fetchPerson();
        }}
        editPerson={person}
      />
    </div>
  );
};

export default MissingPersonDetailPage;
