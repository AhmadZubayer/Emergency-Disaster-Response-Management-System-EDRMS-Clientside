'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import MuiSelect from '@/components/mui-select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import ModernButton from '@/components/modernBtn';
import MuiDrawer from '@/components/mui-drawer';
import MuiModal from '@/components/mui-modal';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { disasterAlertSchema } from '@/lib/validations/disaster-alert-schema';
import { Disaster, DisasterTypeCategory } from './types';
import { cn } from 'cn';

interface AddDisasterDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editDisaster?: Disaster | null;
}

const DISASTER_TYPES: { value: DisasterTypeCategory; label: string }[] = [
  { value: 'cyclone', label: 'Cyclone' },
  { value: 'flood', label: 'Flood' },
  { value: 'flash_flood', label: 'Flash Flood' },
  { value: 'heavy_rain', label: 'Heavy Rain' },
  { value: 'drought', label: 'Drought' },
  { value: 'earthquake', label: 'Earthquake' },
  { value: 'landslide', label: 'Landslide / Bhumidhash' },
  { value: 'wildfire', label: 'Wildfire / Fire' },
  { value: 'tsunami', label: 'Tsunami' },
  { value: 'heatwave', label: 'Heatwave' },
  { value: 'cold_wave', label: 'Cold Wave' },
  { value: 'river_erosion', label: 'River Erosion' },
  { value: 'storm_surge', label: 'Storm Surge' },
  { value: 'tornado', label: 'Tornado' },
  { value: 'avalanche', label: 'Avalanche' },
];

const AddDisasterDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  editDisaster,
}: AddDisasterDrawerProps) => {

  const [disasterName, setDisasterName] = useState('');
  const [impactedLocation, setImpactedLocation] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState('12:00');
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [type, setType] = useState<DisasterTypeCategory>('flood');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (editDisaster && open) {
      setDisasterName(editDisaster.disaster_name || '');
      setImpactedLocation(editDisaster.impacted_location || '');
      if (editDisaster.impact_time) {
        const dt = new Date(editDisaster.impact_time);
        setSelectedDate(dt);
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        setSelectedTime(`${hours}:${minutes}`);
      } else {
        setSelectedDate(new Date());
        setSelectedTime('12:00');
      }
      setType(editDisaster.type || 'flood');
      setErrors({});
      setServerError('');
    } else if (!editDisaster && open) {
      resetForm();
    }
  }, [editDisaster, open]);

  const resetForm = () => {
    setDisasterName('');
    setImpactedLocation('');
    setSelectedDate(new Date());
    setSelectedTime('12:00');
    setType('flood');
    setErrors({});
    setServerError('');
  };

  const getCombinedIsoString = () => {
    if (!selectedDate) return '';
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const d = new Date(selectedDate);
    d.setHours(hours || 0, minutes || 0, 0, 0);
    return d.toISOString();
  };

  const validate = () => {
    const combinedIso = getCombinedIsoString();
    const schema = disasterAlertSchema();
    const result = schema.safeParse({
      disasterName,
      impactedLocation,
      impactTime: combinedIso,
      type,
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

  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsConfirmModalOpen(true);
  };

  const handleConfirmedSubmit = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    setServerError('');

    try {
      const payload = {
        disasterName,
        impactedLocation,
        impactTime: getCombinedIsoString(),
        type,
      };

      if (editDisaster) {
        await axiosSecure.patch(`/disaster/${editDisaster.id}`, payload);
        toast.add({
          id: 'disaster-alert-updated',
          title: 'Disaster alert updated successfully!',
          type: 'success',
          timeout: 4000,
        });
      } else {
        await axiosSecure.post('/disaster', payload);
        toast.add({
          id: 'disaster-alert-created',
          title: 'Disaster alert published successfully!',
          type: 'success',
          timeout: 4000,
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Failed to submit disaster alert. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <MuiDrawer
        open={open}
        onClose={() => onOpenChange(false)}
        title={editDisaster ? 'Edit Disaster Alert' : 'Publish New Disaster Alert'}
        subtitle={
          editDisaster
            ? 'Update the details for this emergency disaster alert.'
            : 'Issue an official emergency disaster warning to alert registered users.'
        }
        width={460}
      >
        <form onSubmit={handlePreSubmit} className="p-6 space-y-4">
          {serverError && (
            <div className="p-3 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
              {serverError}
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="disasterName" >
              Disaster Name *
            </Label>
            <Input
              id="disasterName"
              placeholder="e.g. Cyclone Remal 2026"
              value={disasterName}
              onChange={(e) => setDisasterName(e.target.value)}

            />
            {errors.disasterName && (
              <p className="text-xs text-destructive">{errors.disasterName}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="type" >
              Disaster Type *
            </Label>
            <MuiSelect
              id="type"
              value={type}
              onChange={(val) => setType(val as any)}
              placeholder="Select disaster category"
              options={DISASTER_TYPES.map((t) => ({
                label: t.label,
                value: t.value,
              }))}
            />
            {errors.type && (
              <p className="text-xs text-destructive">{errors.type}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="impactedLocation" >
              Impacted Location / Region *
            </Label>
            <Input
              id="impactedLocation"
              placeholder="e.g. Coastal Belt, Cox's Bazar & Chattogram"
              value={impactedLocation}
              onChange={(e) => setImpactedLocation(e.target.value)}

            />
            {errors.impactedLocation && (
              <p className="text-xs text-destructive">{errors.impactedLocation}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label >
              Expected Impact Date & Time *
            </Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger
                  render={
                    <Button
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left ',
                        !selectedDate && 'text-muted-foreground'
                      )}
                    />
                  }
                >
                  <CalendarIcon className="mr-2 size-3.5" />
                  {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => {
                      setSelectedDate(date);
                      setIsDatePickerOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
                <Input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}

                />
              </div>
            </div>
            {errors.impactTime && (
              <p className="text-xs text-destructive">{errors.impactTime}</p>
            )}
          </div>

          <div className="pt-4 border-t border-border flex items-center justify-start">
            <ModernButton
              type="submit"
              disabled={loading}
            >
              {loading
                ? 'Processing...'
                : editDisaster
                ? 'Update Disaster Alert'
                : 'Add Disaster Alert'}
            </ModernButton>
          </div>
        </form>
      </MuiDrawer>

      <MuiModal
        open={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        title="Confirm System-Wide Alert"
        maxWidth="xs"
        actions={
          <div className="flex items-center justify-end gap-2 w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsConfirmModalOpen(false)}

            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleConfirmedSubmit}
              disabled={loading}

            >
              Yes, Continue
            </Button>
          </div>
        }
      >
        <div className="flex items-start gap-3 py-1">
          <AlertTriangle className="size-5 text-muted-foreground shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed text-muted-foreground">
            {editDisaster
              ? 'This will update the disaster alert in the system. Do you want to continue?'
              : 'This will create a new system wide disaster warning and send alerts to all registered users. Do you want to continue?'}
          </p>
        </div>
      </MuiModal>
    </>
  );
};

export default AddDisasterDrawer;
