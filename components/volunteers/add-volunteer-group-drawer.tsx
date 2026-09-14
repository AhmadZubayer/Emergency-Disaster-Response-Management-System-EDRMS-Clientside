'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import MuiSelect from '@/components/mui-select';
import ModernButton from '@/components/modernBtn';
import MuiDrawer from '@/components/mui-drawer';
import { toast } from '@/components/ui/toast';
import { axiosSecure, publicApi } from '@/lib/api';
import { volunteerGroupSchema } from '@/lib/validations/volunteer-group-schema';
import { VolunteerGroup } from './types';
import { Disaster } from '@/components/disaster/types';
import { getApiErrorMessage } from '@/utils/api-error';

interface AddVolunteerGroupDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editGroup?: VolunteerGroup | null;
}

const AddVolunteerGroupDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  editGroup,
}: AddVolunteerGroupDrawerProps) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [neededVolunteers, setNeededVolunteers] = useState<number>(5);
  const [requiredSkills, setRequiredSkills] = useState('');
  const [disasterName, setDisasterName] = useState<string>('none');
  const [acceptingRequests, setAcceptingRequests] = useState(true);

  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDisasters = async () => {
    try {
      const res = await publicApi.get('/disaster');
      const data = res.data?.data || res.data || [];
      setDisasters(Array.isArray(data) ? data : []);
    } catch {
      setDisasters([]);
    }
  };

  useEffect(() => {
    if (open) {
      fetchDisasters();
    }
  }, [open]);

  useEffect(() => {
    if (editGroup && open) {
      setTitle(editGroup.title || '');
      setDescription(editGroup.description || '');
      setLocation(editGroup.location || '');
      setNeededVolunteers(editGroup.needed_volunteers || 5);
      setRequiredSkills(
        Array.isArray(editGroup.required_skills)
          ? editGroup.required_skills.join(', ')
          : '',
      );
      setDisasterName(editGroup.disaster_name || 'none');
      setAcceptingRequests(editGroup.status === 'open');
      setErrors({});
      setServerError('');
    } else if (!editGroup && open) {
      resetForm();
    }
  }, [editGroup, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setLocation('');
    setNeededVolunteers(5);
    setRequiredSkills('');
    setDisasterName('none');
    setAcceptingRequests(true);
    setErrors({});
    setServerError('');
  };

  const validate = () => {
    const schema = volunteerGroupSchema();
    const result = schema.safeParse({
      title,
      description,
      location,
      neededVolunteers: Number(neededVolunteers),
      disasterName: disasterName === 'none' ? undefined : disasterName,
      acceptingRequests,
    });

    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errMap[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(errMap);
      return false;
    }
    setErrors({});
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setServerError('');

    try {
      const skillsArray = requiredSkills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload = {
        title,
        description,
        location,
        needed_volunteers: Number(neededVolunteers),
        required_skills: skillsArray,
        disaster_name: disasterName === 'none' ? null : disasterName,
        status: acceptingRequests ? 'open' : 'closed',
      };

      if (editGroup) {
        await axiosSecure.patch(
          `/volunteers/organization-requests/${editGroup.id}`,
          payload,
        );
        toast.add({
          id: 'volunteer-group-updated',
          title: 'Volunteer group updated successfully!',
          type: 'success',
          timeout: 4000,
        });
      } else {
        await axiosSecure.post('/volunteers/organization-requests', payload);
        toast.add({
          id: 'volunteer-group-created',
          title: 'Volunteer group created successfully!',
          type: 'success',
          timeout: 4000,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err) {
      setServerError(
        getApiErrorMessage(
          err,
          'Failed to save volunteer group. Please try again.',
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title={editGroup ? 'Edit Volunteer Group' : 'Create New Volunteer Group'}
      subtitle={
        editGroup
          ? 'Update the group deployment parameters and volunteer quotas.'
          : 'Establish a new volunteer relief unit for emergency deployment.'
      }
      width={460}
    >
      <form onSubmit={handleSubmit} className="p-6 space-y-4">
        {serverError && (
          <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="title">Group Title / Number *</Label>
          <Input
            id="title"
            placeholder="e.g. Rapid Rescue Unit Alpha"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          {errors.title && (
            <p className="text-xs text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="disaster">Assigned Disaster Alert</Label>
          <MuiSelect
            id="disaster"
            value={disasterName}
            onChange={(val) => setDisasterName(val || 'none')}
            placeholder="Select assigned disaster"
            options={[
              { label: 'None / General Deployment', value: 'none' },
              ...disasters.map((d) => ({
                label: `${d.disaster_name} (${d.type})`,
                value: d.disaster_name,
              })),
            ]}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Deployment Location *</Label>
          <Input
            id="location"
            placeholder="e.g. Cox's Bazar Sadar Zone"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
          {errors.location && (
            <p className="text-xs text-destructive">{errors.location}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="neededVolunteers">
            Number of Volunteers Required *
          </Label>
          <Input
            id="neededVolunteers"
            type="number"
            min={1}
            value={neededVolunteers}
            onChange={(e) => setNeededVolunteers(Number(e.target.value))}
          />
          {errors.neededVolunteers && (
            <p className="text-xs text-destructive">
              {errors.neededVolunteers}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="requiredSkills">
            Required Skills (comma separated)
          </Label>
          <Input
            id="requiredSkills"
            placeholder="e.g. First Aid, Boat Navigation, Medical Support"
            value={requiredSkills}
            onChange={(e) => setRequiredSkills(e.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Mission Description *</Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Provide duty requirements, rendezvous points, and specific instructions..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          {errors.description && (
            <p className="text-xs text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/20">
          <div className="space-y-0.5">
            <Label htmlFor="acceptToggle" className="cursor-pointer">
              Accept Volunteer Requests
            </Label>
            <p className="text-xs text-muted-foreground">
              {acceptingRequests
                ? 'Volunteers can submit join requests to this unit.'
                : 'Unit is locked. No new volunteer join requests are accepted.'}
            </p>
          </div>
          <Switch
            id="acceptToggle"
            checked={acceptingRequests}
            onCheckedChange={(checked) => setAcceptingRequests(checked)}
          />
        </div>

        <div className="pt-4 border-t border-border flex items-center justify-start">
          <ModernButton type="submit" disabled={loading}>
            {loading
              ? 'Processing...'
              : editGroup
                ? 'Update Volunteer Group'
                : 'Create Volunteer Group'}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default AddVolunteerGroupDrawer;
