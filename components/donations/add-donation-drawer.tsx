'use client';

import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, DollarSign, Upload, Image as ImageIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import ModernButton from '@/components/modernBtn';
import MuiDrawer from '@/components/mui-drawer';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { donationCampaignSchema } from '@/app/lib/validations/donation-campaign-schema';
import { DonationCampaign } from './types';
import { cn } from 'cn';

interface AddDonationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editCampaign?: DonationCampaign | null;
}

const AddDonationDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  editCampaign,
}: AddDonationDrawerProps) => {
  const axiosSecure = useAxiosSecure();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [targetAmount, setTargetAmount] = useState<number>(25000);
  const [startDate, setStartDate] = useState<Date | undefined>(new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
  );
  const [status, setStatus] = useState<DonationCampaign['status']>('active');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [isStartDateOpen, setIsStartDateOpen] = useState(false);
  const [isEndDateOpen, setIsEndDateOpen] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editCampaign && open) {
      setTitle(editCampaign.title || '');
      setDescription(editCampaign.description || '');
      setTargetAmount(Number(editCampaign.target_amount) || 25000);
      setStartDate(
        editCampaign.start_date ? new Date(editCampaign.start_date) : new Date()
      );
      setEndDate(
        editCampaign.end_date
          ? new Date(editCampaign.end_date)
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      );
      setStatus(editCampaign.status || 'active');
      setPhotoFile(null);
      setPhotoPreview(
        editCampaign.photo_url
          ? `${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000'}${editCampaign.photo_url}`
          : null
      );
      setErrors({});
      setServerError('');
    } else if (!editCampaign && open) {
      resetForm();
    }
  }, [editCampaign, open]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setTargetAmount(25000);
    setStartDate(new Date());
    setEndDate(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000));
    setStatus('active');
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setServerError('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
    }
  };

  const removePhoto = () => {
    setPhotoFile(null);
    setPhotoPreview(null);
  };

  const validate = () => {
    const schema = donationCampaignSchema();
    const result = schema.safeParse({
      title,
      description,
      targetAmount: Number(targetAmount),
      startDate: startDate ? startDate.toISOString() : '',
      endDate: endDate ? endDate.toISOString() : '',
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
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('target_amount', String(Number(targetAmount)));
      formData.append(
        'start_date',
        startDate ? startDate.toISOString() : new Date().toISOString()
      );
      formData.append(
        'end_date',
        endDate
          ? endDate.toISOString()
          : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      );
      formData.append('status', status);

      if (photoFile) {
        formData.append('file', photoFile);
      }

      if (editCampaign) {
        await axiosSecure.patch(`/donations/campaigns/${editCampaign.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await axiosSecure.post('/donations/campaigns', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Failed to save donation campaign. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title={editCampaign ? 'Edit Donation Campaign' : 'Create New Donation Campaign'}
      subtitle={
        editCampaign
          ? 'Update the fundraising goals and parameters for this relief fund.'
          : 'Launch an emergency relief donation campaign to gather funds for disaster victims.'
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
          <Label htmlFor="campaignTitle" className="text-xs font-semibold">
            Campaign Name / Title *
          </Label>
          <Input
            id="campaignTitle"
            placeholder="e.g. Cyclone Remal Emergency Relief Fund"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="text-xs"
          />
          {errors.title && (
            <p className="text-[11px] text-destructive">{errors.title}</p>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="targetAmount" className="text-xs font-semibold">
              Expected Target Amount ($ USD) *
            </Label>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded">
              ${Number(targetAmount).toLocaleString()}
            </span>
          </div>

          <Slider
            min={500}
            max={500000}
            step={500}
            value={[Number(targetAmount)]}
            onValueChange={(vals) => {
              if (Array.isArray(vals)) {
                setTargetAmount(vals[0]);
              } else if (typeof vals === 'number') {
                setTargetAmount(vals);
              }
            }}
            className="py-2"
          />

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              id="targetAmount"
              type="number"
              min={1}
              value={targetAmount}
              onChange={(e) => setTargetAmount(Number(e.target.value))}
              className="pl-9 text-xs"
            />
          </div>
          {errors.targetAmount && (
            <p className="text-[11px] text-destructive">{errors.targetAmount}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Add Photos (Campaign Banner / Photo)</Label>
          <div className="space-y-2">
            <label className="flex items-center justify-center gap-2 h-20 rounded-xl border border-dashed border-border/80 bg-background/50 hover:bg-muted/50 cursor-pointer p-4 transition-colors">
              <Upload className="size-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {photoFile ? photoFile.name : 'Click to upload campaign banner photo (JPG, PNG, WebP)'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {photoPreview && (
              <div className="relative w-full h-36 rounded-xl overflow-hidden border border-border/60 bg-muted/20">
                <img
                  src={photoPreview}
                  alt="Campaign Preview"
                  className="w-full h-full object-cover"
                />
                <Button
                  type="button"
                  size="icon-xs"
                  variant="destructive"
                  onClick={removePhoto}
                  className="absolute top-2 right-2 size-6 rounded-full shadow"
                >
                  <X className="size-3" />
                </Button>
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">Start Date *</Label>
            <Popover open={isStartDateOpen} onOpenChange={setIsStartDateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal text-xs h-9',
                      !startDate && 'text-muted-foreground'
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 size-3.5" />
                {startDate ? format(startDate, 'PPP') : <span>Pick date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => {
                    setStartDate(date);
                    setIsStartDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-semibold">End Date *</Label>
            <Popover open={isEndDateOpen} onOpenChange={setIsEndDateOpen}>
              <PopoverTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal text-xs h-9',
                      !endDate && 'text-muted-foreground'
                    )}
                  />
                }
              >
                <CalendarIcon className="mr-2 size-3.5" />
                {endDate ? format(endDate, 'PPP') : <span>Pick date</span>}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => {
                    setEndDate(date);
                    setIsEndDateOpen(false);
                  }}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {editCampaign && (
          <div className="space-y-1.5">
            <Label htmlFor="status" className="text-xs font-semibold">
              Campaign Status
            </Label>
            <Select
              value={status}
              onValueChange={(val: any) => setStatus(val)}
            >
              <SelectTrigger id="status" className="w-full text-xs">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active" className="text-xs">
                  Active
                </SelectItem>
                <SelectItem value="completed" className="text-xs">
                  Completed
                </SelectItem>
                <SelectItem value="closed" className="text-xs">
                  Closed
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold">
            Campaign Description & Purpose *
          </Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Explain how the funds will be utilized for relief food packages, medical aid, and shelter..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs"
          />
          {errors.description && (
            <p className="text-[11px] text-destructive">{errors.description}</p>
          )}
        </div>

        <div className="pt-4 border-t border-border/50 flex items-center justify-start">
          <ModernButton type="submit" disabled={loading}>
            {loading
              ? 'Processing...'
              : editCampaign
              ? 'Update Campaign'
              : 'Add Donation Campaign'}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default AddDonationDrawer;
