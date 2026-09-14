import { Clock3, MapPin, Phone, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { NearbyRescueRequest } from './types';

interface NearbyRescueCardProps {
  request: NearbyRescueRequest;
  busyAction?: 'accept' | 'reject' | null;
  onAccept: () => void;
  onReject: () => void;
}

const NearbyRescueCard = ({
  request,
  busyAction,
  onAccept,
  onReject,
}: NearbyRescueCardProps) => {
  return (
    <article className="rounded-lg border border-border bg-card p-4 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MapPin className="size-3.5" />
            {request.address || 'Location provided by coordinates'}
          </p>
          <p className="mt-2 text-sm font-medium leading-relaxed">{request.description}</p>
        </div>
        <Badge variant={request.urgency_level === 'CRITICAL' ? 'destructive' : 'secondary'}>
          {request.urgency_level}
        </Badge>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5"><Users className="size-3.5" />{request.people_count} people</span>
        <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{request.distance_km} km away</span>
        {request.contact_phone && <span className="flex items-center gap-1.5"><Phone className="size-3.5" />{request.contact_phone}</span>}
        {request.created_at && <span className="flex items-center gap-1.5"><Clock3 className="size-3.5" />{new Date(request.created_at).toLocaleString()}</span>}
      </div>

      {request.medical_notes && (
        <div className="rounded-lg bg-amber-500/10 p-2.5 text-xs text-amber-800 dark:text-amber-300">
          Medical notes: {request.medical_notes}
        </div>
      )}

      <div className="flex gap-2 border-t border-border pt-4">
        <Button onClick={onAccept} disabled={!!busyAction} className="flex-1">
          {busyAction === 'accept' ? 'Accepting...' : 'Accept Task'}
        </Button>
        <Button onClick={onReject} disabled={!!busyAction} variant="outline" className="flex-1">
          {busyAction === 'reject' ? 'Rejecting...' : 'Not Available'}
        </Button>
      </div>
    </article>
  );
};

export default NearbyRescueCard;
