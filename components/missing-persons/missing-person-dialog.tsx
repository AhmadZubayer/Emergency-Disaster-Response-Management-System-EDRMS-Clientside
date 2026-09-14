'use client';

import React from 'react';
import Link from 'next/link';
import { MapPin, Calendar, User, Phone, Lock } from 'lucide-react';
import MuiModal from '@/components/mui-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';

export interface MissingPerson {
  id: string;
  reporter_id: string;
  full_name: string;
  age: number;
  gender: string;
  last_seen_location: string;
  last_seen_date: string;
  photo_url?: string;
  description: string;
  contact_phone: string;
  status: 'MISSING' | 'FOUND' | string;
  created_at?: string;
  updated_at?: string;
}

interface MissingPersonDialogProps {
  person: MissingPerson | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MissingPersonDialog = ({
  person,
  open,
  onOpenChange,
}: MissingPersonDialogProps) => {
  const { user } = useAuth();

  if (!person) return null;

  const isMissing = person.status?.toUpperCase() === 'MISSING';

  return (
    <MuiModal
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="relative aspect-video w-full bg-muted rounded-xl flex items-center justify-center overflow-hidden">
          {person.photo_url ? (
            <img
              src={person.photo_url}
              alt={person.full_name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <User className="size-16 text-muted-foreground/40" />
          )}
          <div className="absolute top-3 right-3">
            <Badge
              variant={isMissing ? 'destructive' : 'default'}
              className="uppercase"
            >
              {person.status}
            </Badge>
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <h3 className="text-lg font-bold text-foreground">{person.full_name}</h3>
            <p className="text-xs text-muted-foreground">
              {person.gender} • {person.age} years old
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-muted/40 border border-border text-xs">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Last Seen Location</span>
                <span className="font-medium text-foreground">{person.last_seen_location}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground shrink-0" />
              <div>
                <span className="text-xs text-muted-foreground block">Last Seen Date</span>
                <span className="font-medium text-foreground">{person.last_seen_date}</span>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-medium text-foreground">Description</span>
            <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap rounded-lg bg-muted/20 p-3 border border-border">
              {person.description || 'No additional description provided.'}
            </p>
          </div>

          <div className="pt-2 flex justify-center">
            {user ? (
              <Button
                className="w-full"
                render={<a href={`tel:${person.contact_phone}`} />}
              >
                <Phone className="size-4" />
                Contact Informer ({person.contact_phone})
              </Button>
            ) : (
              <Button
                variant="outline"
                className="w-full"
                render={<Link href={`/sign-in?returnUrl=/missing-persons/${person.id}`} />}
              >
                <Lock className="size-4" />
                Sign in to contact informer
              </Button>
            )}
          </div>
        </div>
      </div>
    </MuiModal>
  );
};

export default MissingPersonDialog;
