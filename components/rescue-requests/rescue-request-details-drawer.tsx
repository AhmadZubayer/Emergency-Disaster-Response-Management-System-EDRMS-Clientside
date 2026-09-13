'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { LifeBuoy } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import useAuth from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import MuiDrawer from '@/components/mui-drawer';
import { RescueRequest } from './types';

interface RescueRequestDetailsDrawerProps {
  request: RescueRequest | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (request: RescueRequest) => void;
  onRefresh: () => void;
}

const getStatusVariant = (status?: string) => {
  const s = status?.toUpperCase();
  if (s === 'RESCUED') return 'default';
  if (s === 'PENDING') return 'destructive';
  if (s === 'IN_PROGRESS' || s === 'DISPATCHED') return 'secondary';
  return 'outline';
};

const RescueRequestDetailsDrawer = ({
  request,
  open,
  onOpenChange,
  onEdit,
  onRefresh,
}: RescueRequestDetailsDrawerProps) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [cachedRequest, setCachedRequest] = useState<RescueRequest | null>(request);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (request) {
      setCachedRequest(request);
    }
  }, [request]);

  const displayRequest = request || cachedRequest;
  if (!displayRequest) return null;

  const isOwner = !!(
    user &&
    (user.id === displayRequest.user_id ||
      user.id === displayRequest.user?.id ||
      user.role === 'ADMIN')
  );
  const isRescued = displayRequest.status?.toUpperCase() === 'RESCUED';

  const handleMarkAsRescued = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await axiosSecure.patch(`/rescue-requests/${displayRequest.id}/status`, {
        status: 'RESCUED',
      });
      toast.add({
        id: 'rescue-request-rescued',
        title: 'Status updated to Rescued.',
        type: 'success',
        timeout: 4000,
      });
      onRefresh();
      onOpenChange(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to update status.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this rescue request?')) return;
    try {
      setActionLoading(true);
      setActionError('');
      await axiosSecure.delete(`/rescue-requests/${displayRequest.id}`);
      toast.add({
        id: 'rescue-request-deleted',
        title: 'Rescue request moved to trash.',
        type: 'success',
        timeout: 4000,
      });
      onRefresh();
      onOpenChange(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete request.');
    } finally {
      setActionLoading(false);
    }
  };

  const displayTitle =
    displayRequest.address && displayRequest.address.trim().length > 0
      ? displayRequest.address
      : `Rescue Request #${displayRequest.id.slice(0, 8)}`;

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title="Rescue Request Details"
      subtitle="Detailed emergency rescue operation information"
      width={460}
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="relative aspect-video w-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
          {displayRequest.photo_url ? (
            <img
              src={displayRequest.photo_url}
              alt={displayTitle}
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <LifeBuoy className="size-16 text-emerald-600/60" />
          )}
          <div className="absolute top-3 right-3">
            <Badge
              variant={getStatusVariant(displayRequest.status)}
              className="text-[10px] px-2 py-0.5 font-bold uppercase shadow-sm"
            >
              {displayRequest.status}
            </Badge>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {displayTitle}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              URGENCY LEVEL
            </span>
            <span className="text-sm font-bold text-gray-900 uppercase block">
              {displayRequest.urgency_level}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              PEOPLE COUNT
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {displayRequest.people_count} {displayRequest.people_count === 1 ? 'person' : 'people'}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              COORDINATES
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {Number(displayRequest.latitude).toFixed(4)}, {Number(displayRequest.longitude).toFixed(4)}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              REPORTED
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {displayRequest.created_at
                ? new Date(displayRequest.created_at).toLocaleDateString()
                : 'Recently'}
            </span>
          </div>

          {displayRequest.medical_notes && (
            <div className="col-span-2 space-y-0.5">
              <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
                MEDICAL NOTES
              </span>
              <span className="text-xs font-medium text-gray-800 block">
                {displayRequest.medical_notes}
              </span>
            </div>
          )}
        </div>

        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
            DESCRIPTION
          </span>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayRequest.description || 'No additional description provided.'}
          </p>
        </div>

        {actionError && (
          <div className="p-3 text-xs text-red-600 rounded-lg bg-red-50 border border-red-200 text-center">
            {actionError}
          </div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 bg-white shrink-0">
        {isOwner ? (
          <div className="flex items-center gap-2">
            {!isRescued && (
              <Button
                variant="outline"
                onClick={handleMarkAsRescued}
                disabled={actionLoading}
                className="flex-1"
              >
                Mark as Rescued
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => onEdit(displayRequest)}
              disabled={actionLoading}
              className="flex-1"
            >
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={actionLoading}
              className="flex-1"
            >
              Delete
            </Button>
          </div>
        ) : user ? (
          <Button
            className="w-full"
            render={<a href={`tel:${displayRequest.contact_phone}`} />}
          >
            Contact Informer ({displayRequest.contact_phone})
          </Button>
        ) : (
          <Button
            variant="outline"
            className="w-full"
            render={<Link href="/sign-in" />}
          >
            Sign in to contact informer
          </Button>
        )}
      </div>
    </MuiDrawer>
  );
};

export default RescueRequestDetailsDrawer;
