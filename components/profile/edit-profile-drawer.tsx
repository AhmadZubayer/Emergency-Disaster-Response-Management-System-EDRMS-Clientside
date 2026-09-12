'use client';

import React, { useState, useEffect } from 'react';
import { Upload, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import ModernButton from '@/components/modernBtn';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import { userProfileSchema } from '@/app/lib/validations/user-profile-schema';
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
  const axiosSecure = useAxiosSecure();

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
            <Label htmlFor="profile-name" className="text-xs font-semibold">
              Full Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="profile-name"
              placeholder="e.g. Ahmad Zubayer"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
            {errors.name && (
              <p className="text-[11px] text-red-500 font-medium">{errors.name}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-phone" className="text-xs font-semibold">
              Phone Number
            </Label>
            <Input
              id="profile-phone"
              type="tel"
              placeholder="e.g. +8801700000000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-10 text-xs rounded-xl"
            />
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Address Details
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="profile-house" className="text-xs font-semibold">
                House / Street Address
              </Label>
              <Input
                id="profile-house"
                placeholder="e.g. House 12, Road 4, Sector 7"
                value={house}
                onChange={(e) => setHouse(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-city" className="text-xs font-semibold">
                City / Area
              </Label>
              <Input
                id="profile-city"
                placeholder="e.g. Uttara"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-district" className="text-xs font-semibold">
                District / State
              </Label>
              <Input
                id="profile-district"
                placeholder="e.g. Dhaka"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>

            <div className="space-y-1.5 col-span-1 sm:col-span-2">
              <Label htmlFor="profile-country" className="text-xs font-semibold">
                Country
              </Label>
              <Input
                id="profile-country"
                placeholder="e.g. Bangladesh"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-1 border-t">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              GPS Coordinates
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
                <Loader2 className="size-3.5 animate-spin" />
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
              <Label htmlFor="profile-lat" className="text-xs font-semibold">
                Latitude
              </Label>
              <Input
                id="profile-lat"
                type="number"
                step="any"
                placeholder="e.g. 23.8103"
                value={gpsLat}
                onChange={(e) => setGpsLat(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
              {errors.gps_lat && (
                <p className="text-[11px] text-red-500 font-medium">{errors.gps_lat}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="profile-lng" className="text-xs font-semibold">
                Longitude
              </Label>
              <Input
                id="profile-lng"
                type="number"
                step="any"
                placeholder="e.g. 90.4125"
                value={gpsLng}
                onChange={(e) => setGpsLng(e.target.value)}
                className="h-10 text-xs rounded-xl"
              />
              {errors.gps_lng && (
                <p className="text-[11px] text-red-500 font-medium">{errors.gps_lng}</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-1 border-t">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
            Emergency & Medical Notes
          </span>

          <div className="space-y-1.5">
            <Label htmlFor="profile-emergency" className="text-xs font-semibold">
              Emergency Message
            </Label>
            <Textarea
              id="profile-emergency"
              rows={2}
              placeholder="e.g. In case of emergency, contact my brother at +8801800000000"
              value={emergencyMessage}
              onChange={(e) => setEmergencyMessage(e.target.value)}
              className="text-xs rounded-xl resize-none"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="profile-medical" className="text-xs font-semibold">
              Medical Information
            </Label>
            <Textarea
              id="profile-medical"
              rows={2}
              placeholder="e.g. Blood group A+, allergic to penicillin, diabetic"
              value={medicalInformation}
              onChange={(e) => setMedicalInformation(e.target.value)}
              className="text-xs rounded-xl resize-none"
            />
          </div>
        </div>

        <div className="space-y-1.5 pt-1 border-t">
          <Label className="text-xs font-semibold">Profile Photo</Label>
          <div className="flex items-center gap-4">
            <label
              htmlFor="user-profile-photo"
              className="flex items-center justify-center gap-2 px-4 py-2 text-xs font-medium border border-border/80 rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
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
