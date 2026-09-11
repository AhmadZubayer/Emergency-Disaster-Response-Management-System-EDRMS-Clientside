'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { User } from 'lucide-react';
import useAuth from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import MuiDrawer from '@/components/mui-drawer';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';

interface MissingPersonDetailsDrawerProps {
  person: MissingPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (person: MissingPerson) => void;
  onRefresh: () => void;
}

const MissingPersonDetailsDrawer = ({
  person,
  open,
  onOpenChange,
  onEdit,
  onRefresh,
}: MissingPersonDetailsDrawerProps) => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [cachedPerson, setCachedPerson] = useState<MissingPerson | null>(person);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState('');

  useEffect(() => {
    if (person) {
      setCachedPerson(person);
    }
  }, [person]);

  const displayPerson = person || cachedPerson;
  if (!displayPerson) return null;

  const isOwner = !!(user && (user.id === displayPerson.reporter_id || user.role === 'ADMIN'));
  const isFound = displayPerson.status?.toUpperCase() === 'FOUND';

  const handleMarkAsFound = async () => {
    try {
      setActionLoading(true);
      setActionError('');
      await axiosSecure.patch(`/missing-persons/${displayPerson.id}/status`, {
        status: 'FOUND',
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
    if (!window.confirm('Are you sure you want to delete this report?')) return;
    try {
      setActionLoading(true);
      setActionError('');
      await axiosSecure.delete(`/missing-persons/${displayPerson.id}`);
      onRefresh();
      onOpenChange(false);
    } catch (err: any) {
      setActionError(err.response?.data?.message || 'Failed to delete report.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title="Report Details"
      subtitle="Detailed missing person report information"
      width={460}
    >
      <div className="flex-1 overflow-y-auto p-5 space-y-5">
        <div className="relative aspect-video w-full rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
          {displayPerson.photo_url ? (
            <img
              src={displayPerson.photo_url}
              alt={displayPerson.full_name}
              className="size-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User className="size-16 text-gray-400" />
          )}
          <div className="absolute top-3 right-3">
            <Badge
              variant={isFound ? 'default' : 'destructive'}
              className="text-[10px] px-2 py-0.5 font-bold uppercase shadow-sm"
            >
              {displayPerson.status}
            </Badge>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-bold tracking-tight text-gray-900">
            {displayPerson.full_name}
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-x-6 gap-y-4 pt-1">
          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              GENDER
            </span>
            <span className="text-sm font-bold text-gray-900 lowercase block">
              {displayPerson.gender}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              AGE
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {displayPerson.age} years old
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              LAST SEEN LOCATION
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {displayPerson.last_seen_location}
            </span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
              LAST SEEN DATE
            </span>
            <span className="text-sm font-bold text-gray-900 block">
              {displayPerson.last_seen_date}
            </span>
          </div>
        </div>

        <div className="space-y-1 pt-1">
          <span className="text-[10px] font-semibold tracking-wider text-gray-500 uppercase block">
            DESCRIPTION
          </span>
          <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">
            {displayPerson.description || 'No additional description provided.'}
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
            {!isFound && (
              <Button
                variant="outline"
                onClick={handleMarkAsFound}
                disabled={actionLoading}
                className="flex-1"
              >
                Mark as Found
              </Button>
            )}
            <Button
              variant="secondary"
              onClick={() => onEdit(displayPerson)}
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
            render={<a href={`tel:${displayPerson.contact_phone}`} />}
          >
            Contact Informer ({displayPerson.contact_phone})
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

export default MissingPersonDetailsDrawer;
