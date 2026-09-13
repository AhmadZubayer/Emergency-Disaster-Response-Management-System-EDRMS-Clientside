'use client';

import { useState } from 'react';
import { MapPin, Users } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { formatVolunteerValue, VolunteerTask } from './types';

interface TaskCardProps {
  task: VolunteerTask;
  verified: boolean;
  busy: boolean;
  onStart: (note: string) => void;
  onComplete: () => void;
}

const TaskCard = ({ task, verified, busy, onStart, onComplete }: TaskCardProps) => {
  const [note, setNote] = useState(task.progress_note || '');
  const request = task.rescue_request;

  return (
    <article className="rounded-2xl border border-border/70 bg-card p-5 shadow-sm space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold">{request?.address || `Rescue task ${task.id.slice(0, 8)}`}</h2>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{request?.description || 'No rescue description available.'}</p>
        </div>
        <Badge variant={task.status === 'completed' ? 'default' : 'secondary'}>{formatVolunteerValue(task.status)}</Badge>
      </div>

      {request && (
        <div className="flex flex-wrap gap-4 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-1.5"><Users className="size-3.5" />{request.people_count} people</span>
          <span className="flex items-center gap-1.5"><MapPin className="size-3.5" />{request.latitude}, {request.longitude}</span>
          <Badge variant={request.urgency_level === 'CRITICAL' ? 'destructive' : 'outline'}>{request.urgency_level}</Badge>
        </div>
      )}

      {task.status === 'accepted' && verified && (
        <div className="space-y-2 border-t border-border/50 pt-4">
          <Label htmlFor={`note-${task.id}`}>Progress note</Label>
          <Textarea id={`note-${task.id}`} rows={2} value={note} onChange={(event) => setNote(event.target.value)} placeholder="Example: Travelling to the affected area" className="text-xs" />
          <Button onClick={() => onStart(note)} disabled={busy} className="h-8">{busy ? 'Updating...' : 'Start Rescue Work'}</Button>
        </div>
      )}

      {task.status === 'in_progress' && verified && (
        <div className="flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <p className="text-[11px] text-muted-foreground">{task.progress_note || 'Rescue work is in progress.'}</p>
          <Button onClick={onComplete} disabled={busy} className="h-8 shrink-0">{busy ? 'Completing...' : 'Complete Task'}</Button>
        </div>
      )}

      {task.status === 'completed' && (
        <p className="border-t border-border/50 pt-4 text-[11px] text-emerald-600">Completed {task.completed_at ? new Date(task.completed_at).toLocaleString() : ''}</p>
      )}
    </article>
  );
};

export default TaskCard;
