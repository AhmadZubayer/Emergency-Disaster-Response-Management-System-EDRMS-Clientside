'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import MuiSelect from '@/components/mui-select';
import ModernButton from '@/components/modernBtn';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { rescueRequestSchema } from '@/lib/validations/rescue-request-form-schema';
import { RescueRequest, UrgencyLevel } from './types';
import MuiDrawer from '@/components/mui-drawer';

interface AddRescueRequestDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editRequest?: RescueRequest | null;
}

const AddRescueRequestDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  editRequest,
}: AddRescueRequestDrawerProps) => {

  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [urgencyLevel, setUrgencyLevel] = useState<UrgencyLevel>('HIGH');
  const [peopleCount, setPeopleCount] = useState('1');
  const [contactPhone, setContactPhone] = useState('');
  const [medicalNotes, setMedicalNotes] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocationError, setIsLocationError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editRequest && open) {
      setAddress(editRequest.address || '');
      setLatitude(editRequest.latitude !== undefined ? String(editRequest.latitude) : '');
      setLongitude(editRequest.longitude !== undefined ? String(editRequest.longitude) : '');
      setUrgencyLevel(editRequest.urgency_level || 'HIGH');
      setPeopleCount(editRequest.people_count !== undefined ? String(editRequest.people_count) : '1');
      setContactPhone(editRequest.contact_phone || '');
      setMedicalNotes(editRequest.medical_notes || '');
      setDescription(editRequest.description || '');
      setPhotoFile(null);
      setPhotoPreview(editRequest.photo_url || null);
      setErrors({});
      setServerError('');
      setLocationMessage('');
      setIsLocationError(false);
    } else if (!editRequest && open) {
      resetForm();
    }
  }, [editRequest, open]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Unable to access GPS');
      setIsLocationError(true);
      return;
    }

    setDetectingLocation(true);
    setLocationMessage('Detecting location...');
    setIsLocationError(false);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude.toFixed(6));
        setLongitude(position.coords.longitude.toFixed(6));
        setLocationMessage('Location detected successfully.');
        setIsLocationError(false);
        setDetectingLocation(false);
      },
      () => {
        setLocationMessage('Unable to access GPS');
        setIsLocationError(true);
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setAddress('');
    setLatitude('');
    setLongitude('');
    setUrgencyLevel('HIGH');
    setPeopleCount('1');
    setContactPhone('');
    setMedicalNotes('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setServerError('');
    setLocationMessage('');
    setIsLocationError(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = rescueRequestSchema().safeParse({
      latitude,
      longitude,
      description,
      contactPhone,
      address,
      peopleCount,
      urgencyLevel,
      medicalNotes,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as string;
        fieldErrors[fieldName] = issue.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('description', description.trim());
      formData.append('contact_phone', contactPhone.trim());
      formData.append('urgency_level', urgencyLevel);
      formData.append('people_count', String(Number(peopleCount) || 1));
      if (address.trim()) formData.append('address', address.trim());
      if (medicalNotes.trim()) formData.append('medical_notes', medicalNotes.trim());
      if (photoFile) formData.append('file', photoFile);

      if (editRequest) {
        await axiosSecure.patch(`/rescue-requests/${editRequest.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.add({
          id: 'rescue-request-updated',
          title: 'Rescue request updated successfully.',
          type: 'success',
          timeout: 4000,
        });
      } else {
        await axiosSecure.post('/rescue-requests', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.add({
          id: 'rescue-request-created',
          title: 'Emergency rescue alert submitted successfully.',
          type: 'success',
          timeout: 4000,
        });
      }

      resetForm();
      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to save rescue request. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title={editRequest ? 'Edit Rescue Request' : 'Add Rescue Request'}
      subtitle="Fill out the details below to dispatch emergency rescue teams."
      width={620}
    >
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {serverError && (
          <div className="p-3 text-xs text-red-600 rounded-lg bg-red-50 border border-red-200">
            {serverError}
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Coordinates
          </span>
          <Button
            type="button"
            variant="default"
            size="sm"
            onClick={handleDetectLocation}
            disabled={detectingLocation}
            className="gap-1.5 h-8 text-xs font-semibold"
          >
            {detectingLocation ? (
              <Spinner className="size-3.5" />
            ) : (
              <MapPin className="size-3.5" />
            )}
            Detect Location
          </Button>
        </div>

        {locationMessage && (
          <p
            className={`text-[11px] font-medium ${
              isLocationError ? 'text-red-500' : 'text-emerald-600'
            }`}
          >
            {locationMessage}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="latitude" className="text-xs font-semibold">
              Latitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="latitude"
              type="number"
              step="any"
              placeholder="e.g. 23.8103"
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            {errors.latitude && (
              <p className="text-[11px] text-red-500 font-medium">{errors.latitude}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="longitude" className="text-xs font-semibold">
              Longitude <span className="text-red-500">*</span>
            </Label>
            <Input
              id="longitude"
              type="number"
              step="any"
              placeholder="e.g. 90.4125"
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            {errors.longitude && (
              <p className="text-[11px] text-red-500 font-medium">{errors.longitude}</p>
            )}
          </div>

          <div className="space-y-1.5 col-span-1 sm:col-span-2">
            <Label htmlFor="address" className="text-xs font-semibold">
              Address / Landmark
            </Label>
            <Input
              id="address"
              placeholder="e.g. House 12, Road 4, Sector 7, Uttara, Dhaka"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="urgency" className="text-xs font-semibold">
              Urgency Level <span className="text-red-500">*</span>
            </Label>
            <MuiSelect
              id="urgency"
              value={urgencyLevel}
              onChange={(val) => setUrgencyLevel(val as UrgencyLevel)}
              placeholder="Select urgency"
              options={[
                { label: 'LOW', value: 'LOW' },
                { label: 'MEDIUM', value: 'MEDIUM' },
                { label: 'HIGH', value: 'HIGH' },
                { label: 'CRITICAL', value: 'CRITICAL' },
              ]}
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="peopleCount" className="text-xs font-semibold">
              People Count <span className="text-red-500">*</span>
            </Label>
            <Input
              id="peopleCount"
              type="number"
              min="1"
              value={peopleCount}
              onChange={(e) => setPeopleCount(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            {errors.peopleCount && (
              <p className="text-[11px] text-red-500 font-medium">{errors.peopleCount}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="contactPhone" className="text-xs font-semibold">
              Contact Phone <span className="text-red-500">*</span>
            </Label>
            <Input
              id="contactPhone"
              type="tel"
              placeholder="e.g. +8801700000000"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            {errors.contactPhone && (
              <p className="text-[11px] text-red-500 font-medium">{errors.contactPhone}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="medicalNotes" className="text-xs font-semibold">
              Medical Notes (Optional)
            </Label>
            <Input
              id="medicalNotes"
              placeholder="e.g. 1 elderly person injured"
              value={medicalNotes}
              onChange={(e) => setMedicalNotes(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description" className="text-xs font-semibold">
            Situation Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            rows={3}
            placeholder="Describe the current emergency, water level, landmark, hazards..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="text-xs rounded-xl resize-none"
          />
          {errors.description && (
            <p className="text-[11px] text-red-500 font-medium">{errors.description}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-semibold">Photo (Optional)</Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="rescue-photo"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-border/80 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="size-4" />
              <span>Choose Photo</span>
              <input
                id="rescue-photo"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            {photoPreview && (
              <div className="relative size-14 rounded-lg overflow-hidden border border-border">
                <img src={photoPreview} alt="Preview" className="size-full object-cover" />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 flex justify-center">
          <ModernButton type="submit" disabled={loading}>
            {loading ? 'Processing...' : editRequest ? 'Update Rescue Request' : 'Add Rescue Request'}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default AddRescueRequestDrawer;
