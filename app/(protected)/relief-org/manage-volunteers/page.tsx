'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MuiDrawer from '@/components/mui-drawer';
import { toast } from '@/components/ui/toast';
import useAuth from '@/hooks/use-auth';
import { axiosSecure } from '@/lib/api';
import {
  VolunteerGroup,
  OrganizationJoin,
  formatVolunteerValue,
} from '@/components/volunteers/types';
import AddVolunteerGroupDrawer from '@/components/volunteers/add-volunteer-group-drawer';
import OperationsDashboard, {
  LoadError,
} from '@/components/volunteers/operations-dashboard';
import { getApiErrorMessage } from '@/utils/api-error';

export default function ReliefOrgManageVolunteersPage() {
  const { user } = useAuth();
  const [groups, setGroups] = useState<VolunteerGroup[]>([]);
  const [applications, setApplications] = useState<OrganizationJoin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [groupDrawer, setGroupDrawer] = useState(false);
  const [editingGroup, setEditingGroup] = useState<VolunteerGroup | null>(null);
  const [selected, setSelected] = useState<OrganizationJoin | null>(null);
  const [reviewing, setReviewing] = useState(false);
  const [groupFilter, setGroupFilter] = useState('all');

  const load = useCallback(() => {
    return Promise.all([
      axiosSecure.get('/volunteers/organization-requests/my-created'),
      axiosSecure.get('/volunteers/organization-applications'),
    ])
      .then(([groups, applications]) => {
        setError('');
        setGroups(groups.data?.data ?? groups.data);
        setApplications(applications.data?.data ?? applications.data);
      })
      .catch((error: unknown) => {
        setError(
          getApiErrorMessage(
            error,
            'Unable to load volunteer groups and applications.',
          ),
        );
      })
      .finally(() => setLoading(false));
  }, []);
  useEffect(() => {
    if (user) void load();
  }, [user, load]);

  const review = async (status: 'approved' | 'rejected') => {
    if (!selected) return;
    setReviewing(true);
    try {
      await axiosSecure.patch(
        `/volunteers/organization-applications/${selected.id}`,
        { status },
      );
      toast.add({
        id: 'application-reviewed',
        title:
          status === 'approved'
            ? 'Volunteer added to the group.'
            : 'Application declined.',
        type: 'success',
      });
      setSelected(null);
      await load();
    } catch (error) {
      toast.add({
        id: 'application-review-error',
        title: getApiErrorMessage(error, 'Unable to review this application.'),
        type: 'error',
      });
    } finally {
      setReviewing(false);
    }
  };
  const filtered = applications.filter(
    (a) => groupFilter === 'all' || a.organization_request_id === groupFilter,
  );
  const volunteer = selected?.volunteer;

  return (
    <OperationsDashboard role="RELIEF_ORG" tab="manage-volunteers">
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-base font-semibold">Volunteer Groups</h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Create groups and review the volunteers who apply to join.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={load}
              disabled={loading}
              aria-label="Refresh groups"
            >
              <RefreshCw className="size-4" />
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setEditingGroup(null);
                setGroupDrawer(true);
              }}
            >
              <Plus className="size-4" />
              Create Group
            </Button>
          </div>
        </div>
        {loading ? (
          <p role="status" className="text-sm text-muted-foreground">
            Loading groups and applications...
          </p>
        ) : error ? (
          <LoadError message={error} retry={load} />
        ) : (
          <>
            <div className="rounded-lg border border-border bg-card overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Group</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Members</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {groups.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="h-24 text-center text-muted-foreground"
                      >
                        No groups yet. Create a group to start receiving
                        applications.
                      </TableCell>
                    </TableRow>
                  ) : (
                    groups.map((group) => (
                      <TableRow key={group.id}>
                        <TableCell>
                          <span className="font-medium">{group.title}</span>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {group.disaster_name || 'General deployment'}
                          </p>
                        </TableCell>
                        <TableCell>{group.location}</TableCell>
                        <TableCell>
                          {group.joined_volunteers ?? 0} /{' '}
                          {group.needed_volunteers}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {group.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingGroup(group);
                              setGroupDrawer(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            <section className="space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">
                    Volunteer Applications
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Select a volunteer to review their profile and add them to
                    the group.
                  </p>
                </div>
                <select
                  aria-label="Filter applications by group"
                  value={groupFilter}
                  onChange={(event) => setGroupFilter(event.target.value)}
                  className="max-w-full rounded-md border border-border bg-card px-3 py-2 text-xs"
                >
                  <option value="all">All groups</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="rounded-lg border border-border bg-card overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Volunteer</TableHead>
                      <TableHead>Group</TableHead>
                      <TableHead>Applied</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.length === 0 ? (
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="h-24 text-center text-muted-foreground"
                        >
                          No applications yet.
                        </TableCell>
                      </TableRow>
                    ) : (
                      filtered.map((application) => (
                        <TableRow
                          key={application.id}
                          className="cursor-pointer"
                          onClick={() => setSelected(application)}
                        >
                          <TableCell>
                            <button
                              type="button"
                              className="font-medium text-primary underline-offset-4 hover:underline"
                              onClick={(event) => {
                                event.stopPropagation();
                                setSelected(application);
                              }}
                            >
                              {application.volunteer?.user?.name ||
                                'Volunteer profile unavailable'}
                            </button>
                          </TableCell>
                          <TableCell>
                            {application.organization_request?.title ||
                              'Group unavailable'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {application.joined_at
                              ? new Date(
                                  application.joined_at,
                                ).toLocaleDateString()
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                application.status === 'approved'
                                  ? 'default'
                                  : 'outline'
                              }
                            >
                              {application.status === 'approved'
                                ? 'Added'
                                : formatVolunteerValue(application.status)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </section>
          </>
        )}
      </div>
      <AddVolunteerGroupDrawer
        open={groupDrawer}
        onOpenChange={setGroupDrawer}
        onSuccess={load}
        editGroup={editingGroup}
      />
      <MuiDrawer
        open={!!selected}
        onClose={() => {
          if (!reviewing) setSelected(null);
        }}
        title="Volunteer Profile"
        subtitle={selected?.organization_request?.title}
      >
        {selected && (
          <div className="p-6 space-y-6 text-sm">
            {volunteer ? (
              <>
                <div>
                  <h3 className="text-lg font-semibold">
                    {volunteer.user?.name || 'Volunteer'}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {volunteer.user?.phone || 'No contact number provided'}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-5">
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Verification
                    </dt>
                    <dd className="mt-1 capitalize">
                      {formatVolunteerValue(volunteer.verification_status)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">
                      Availability
                    </dt>
                    <dd className="mt-1">
                      {volunteer.available ? 'Available' : 'Unavailable'}
                    </dd>
                  </div>
                </dl>
                <div>
                  <h4 className="text-xs text-muted-foreground">Skills</h4>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {volunteer.skills.map((skill) => (
                      <Badge key={skill} variant="outline">
                        {formatVolunteerValue(skill)}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="text-xs text-muted-foreground">
                    Why I volunteer
                  </h4>
                  <p className="mt-2 whitespace-pre-wrap break-words leading-relaxed">
                    {volunteer.why_join}
                  </p>
                </div>
              </>
            ) : (
              <p>This volunteer profile is no longer available.</p>
            )}
            <div className="border-t border-border pt-5">
              <p className="mb-4 text-xs text-muted-foreground">
                Application: {formatVolunteerValue(selected.status)}
              </p>
              {selected.status === 'pending' && (
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => review('approved')}
                    disabled={
                      reviewing || volunteer?.verification_status !== 'verified'
                    }
                  >
                    {reviewing ? 'Saving...' : 'Add to group'}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => review('rejected')}
                    disabled={reviewing}
                  >
                    Decline
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}
      </MuiDrawer>
    </OperationsDashboard>
  );
}
