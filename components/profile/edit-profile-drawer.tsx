'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import ModernButton from '@/components/modernBtn';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { userProfileSchema } from '@/lib/validations/user-profile-schema';
import MuiDrawer from '@/components/mui-drawer';

export interface UserProfileData {
  id: string;
  name: string;
  phone?: string | null;
  photo_url?: string | null;
  address?: {
    house?: string | null;
    city?: string | null;
    district?: string | null;
    country?: string | null;
  } | null;
  gps_lat?: number | null;
  gps_lng?: number | null;
  is_safe?: boolean | null;
  emergency_message?: string | null;
  medical_information?: string | null;
  created_at?: string;
  updated_at?: string;
  auth?: {
    email?: string;
    role?: string;
  };
}

interface EditProfileDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  profile: UserProfileData | null;
}

const EditProfileDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  profile,
}: EditProfileDrawerProps) => {

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [house, setHouse] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [country, setCountry] = useState('Bangladesh');
  const [gpsLat, setGpsLat] = useState('');
  const [gpsLng, setGpsLng] = useState('');
  const [emergencyMessage, setEmergencyMessage] = useState('');
  const [medicalInformation, setMedicalInformation] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationMessage, setLocationMessage] = useState('');
  const [isLocationError, setIsLocationError] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (profile && open) {
      setName(profile.name || '');
      setPhone(profile.phone || '');
      setHouse(profile.address?.house || '');
      setCity(profile.address?.city || '');
      setDistrict(profile.address?.district || '');
      setCountry(profile.address?.country || 'Bangladesh');
      setGpsLat(profile.gps_lat !== undefined && profile.gps_lat !== null ? String(profile.gps_lat) : '');
      setGpsLng(profile.gps_lng !== undefined && profile.gps_lng !== null ? String(profile.gps_lng) : '');
      setEmergencyMessage(profile.emergency_message || '');
      setMedicalInformation(profile.medical_information || '');
      setPhotoFile(null);
      setPhotoPreview(profile.photo_url || null);
      setErrors({});
      setServerError('');
      setLocationMessage('');
      setIsLocationError(false);
    }
  }, [profile, open]);

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
        setGpsLat(position.coords.latitude.toFixed(6));
        setGpsLng(position.coords.longitude.toFixed(6));
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = userProfileSchema().safeParse({
      name,
      phone,
      house,
      city,
      district,
      country,
      gps_lat: gpsLat,
      gps_lng: gpsLng,
      emergency_message: emergencyMessage,
      medical_information: medicalInformation,
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
      formData.append('name', name.trim());
      formData.append('phone', phone.trim());
      if (house.trim()) formData.append('house', house.trim());
      if (city.trim()) formData.append('city', city.trim());
      if (district.trim()) formData.append('district', district.trim());
      if (country.trim()) formData.append('country', country.trim());
      if (gpsLat.trim()) formData.append('gps_lat', gpsLat.trim());
      if (gpsLng.trim()) formData.append('gps_lng', gpsLng.trim());
      if (emergencyMessage.trim()) formData.append('emergency_message', emergencyMessage.trim());
      if (medicalInformation.trim()) formData.append('medical_information', medicalInformation.trim());
      if (photoFile) formData.append('file', photoFile);

      await axiosSecure.patch('/users/update-profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      toast.add({
        id: 'profile-update-success',
        title: 'Profile updated successfully!',
        type: 'success',
        timeout: 4000,
      });

      onSuccess();
      onOpenChange(false);
    } catch (err: any) {
      setServerError(
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => onOpenChange(false)}
      title="Edit Profile"
      subtitle="Update your personal details, address, and emergency information."
      width={620}
    >
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
        {serverError && (
          <div className="p-3 text-xs text-red-600 rounded-lg bg-red-50 border border-red-200">
            {serverError}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name" >
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g. Ahmad Zubayer"
              value={name}
              onChange={(e) => setName(e.target.value)}

            />
            {errors.name && (
              <p className="text-xs text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" >
              Phone Number
            </Label>
            <Input
              id="profile-phone"
              type="tel"
              placeholder="e.g. +8801700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}

            />
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
            Address Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="profile-house" >
                House / Street Address
              </Label>
              <Input
                id="profile-house"
                placeholder="e.g. House 12, Road 4, Sector 7"
                value={house}
                onChange={(e) => setHouse(e.target.value)}

              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-city" >
                City / Area
              </Label>
              <Input
                id="profile-city"
                placeholder="e.g. Uttara"
                value={city}
                onChange={(e) => setCity(e.target.value)}

              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-district" >
                District / State
              </Label>
              <Input
                id="profile-district"
                placeholder="e.g. Dhaka"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}

              />
            </div>

            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="profile-country" >
                Country
              </Label>
              <Input
                id="profile-country"
                placeholder="e.g. Bangladesh"
                value={country}
                onChange={(e) => setCountry(e.target.value)}

              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              GPS Coordinates
            </span>
            <Button
              type="button"
              variant="default"
              size="sm"
              onClick={handleDetectLocation}
              disabled={detectingLocation}

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
              className={`text-xs font-medium ${
                isLocationError ? 'text-red-500' : 'text-primary'
              }`}
            >
              {locationMessage}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="profile-lat" >
                Latitude
              </Label>
              <Input
                id="profile-lat"
                type="number"
                step="any"
                placeholder="e.g. 23.8103"
                value={gpsLat}
                onChange={(e) => setGpsLat(e.target.value)}

              />
              {errors.gps_lat && (
                <p className="text-xs text-red-500 font-medium">{errors.gps_lat}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-lng" >
                Longitude
              </Label>
              <Input
                id="profile-lng"
                type="number"
                step="any"
                placeholder="e.g. 90.4125"
                value={gpsLng}
                onChange={(e) => setGpsLng(e.target.value)}

              />
              {errors.gps_lng && (
                <p className="text-xs text-red-500 font-medium">{errors.gps_lng}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1 border-t">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block">
            Emergency & Medical Notes
          </span>

          <div className="space-y-1.5">
            <Label htmlFor="profile-emergency" >
              Emergency Message
            </Label>
            <Textarea
              id="profile-emergency"
              rows={2}
              placeholder="e.g. In case of emergency, contact my brother at +8801800000000"
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              className="resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-medical" >
              Medical Information
            </Label>
            <Textarea
              id="profile-medical"
              rows={2}
              placeholder="e.g. Blood group A+, allergic to penicillin, diabetic"
              value={medicalInformation}
              onChange={(e) => setMedicalInformation(e.target.value)}
              className="resize-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t">
          <Label >Profile Photo</Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="user-profile-photo"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
            >
              <Upload className="size-4" />
              <span>Choose Photo</span>
              <input
                id="user-profile-photo"
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
            {loading ? 'Saving...' : 'Save Profile Changes'}
          </ModernButton>
        </div>
      </form>
    </MuiDrawer>
  );
};

export default EditProfileDrawer;
