'use client';

import { useEffect, useState } from 'react';
import { AxiosError } from 'axios';
import { ClipboardList } from 'lucide-react';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { ENDPOINTS } from '@/app/lib/endpoints';
import { Alert, AlertDescription } from '@/components/ui/alert';
import TaskCard from '@/components/volunteers/task-card';
import { VolunteerProfile, VolunteerTask } from '@/components/volunteers/types';

const getError = (error: unknown) => {
  const message = (error as AxiosError<{ message?: string | string[] }>).response?.data?.message;
  return Array.isArray(message) ? message.join(', ') : message || 'Unable to load volunteer tasks.';
};

const MyTasksPage = () => {
  const axiosSecure = useAxiosSecure();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [tasks, setTasks] = useState<VolunteerTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyTaskId, setBusyTaskId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const profileResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.ME);
      const currentProfile: VolunteerProfile = profileResponse.data?.data || profileResponse.data;
      setProfile(currentProfile);
      const taskResponse = await axiosSecure.get(ENDPOINTS.VOLUNTEERS.MY_TASKS);
      const data = taskResponse.data?.data || taskResponse.data || [];
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      setTasks([]);
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial client-side API synchronization follows the existing project pattern.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startTask = async (taskId: string, progressNote: string) => {
    setBusyTaskId(taskId);
    setMessage(null);
    try {
      await axiosSecure.patch(ENDPOINTS.VOLUNTEERS.UPDATE_TASK_PROGRESS(taskId), {
        status: 'in_progress',
        progress_note: progressNote.trim() || 'Rescue work started',
      });
      setMessage({ type: 'success', text: 'Task moved to in progress.' });
      await fetchTasks();
    } catch (error) {
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setBusyTaskId(null);
    }
  };

  const completeTask = async (taskId: string) => {
    setBusyTaskId(taskId);
    setMessage(null);
    try {
      await axiosSecure.patch(ENDPOINTS.VOLUNTEERS.COMPLETE_TASK(taskId));
      setMessage({ type: 'success', text: 'Rescue task completed successfully.' });
      await fetchTasks();
    } catch (error) {
      setMessage({ type: 'error', text: getError(error) });
    } finally {
      setBusyTaskId(null);
    }
  };

  if (loading) return <div className="h-64 rounded-2xl bg-muted/30 animate-pulse" />;

  const verified = profile?.verification_status === 'verified';

  return (
    <div className="space-y-6">
      <div className="border-b border-border/60 pb-6">
        <h1 className="text-2xl font-bold tracking-tight">My Rescue Tasks</h1>
        <p className="mt-1 text-xs text-muted-foreground">Track accepted assignments, begin field work, and mark completed rescues.</p>
      </div>
      {message && <Alert variant={message.type === 'error' ? 'destructive' : 'default'} className={message.type === 'success' ? 'border-emerald-500/30 bg-emerald-500/10' : ''}><AlertDescription>{message.text}</AlertDescription></Alert>}
      {profile && !verified && <Alert><AlertDescription>Your existing tasks are visible, but verification is required to update their progress.</AlertDescription></Alert>}
      {tasks.length === 0 ? (
        <div className="flex min-h-52 flex-col items-center justify-center rounded-2xl border border-dashed border-border/70 text-center">
          <ClipboardList className="size-9 text-muted-foreground/60" />
          <p className="mt-3 text-sm font-semibold">No assigned rescue tasks</p>
          <p className="mt-1 text-xs text-muted-foreground">Accepted nearby requests will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {tasks.map((task) => <TaskCard key={task.id} task={task} verified={verified} busy={busyTaskId === task.id} onStart={(note) => startTask(task.id, note)} onComplete={() => completeTask(task.id)} />)}
        </div>
      )}
    </div>
  );
};

export default MyTasksPage;
