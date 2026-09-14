import React, { useState, useEffect } from 'react';
import { Upload, Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from 'cn';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import MuiSelect from '@/components/mui-select';
import ModernButton from '@/components/modernBtn';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { missingPersonSchema } from '@/lib/validations/missing-person-form-schema';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import MuiDrawer from '@/components/mui-drawer';

interface AddMissingPersonDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editPerson?: MissingPerson | null;
}

const AddMissingPersonDrawer = ({
  open,
  onOpenChange,
  onSuccess,
  editPerson,
}: AddMissingPersonDrawerProps) => {

  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('male');
  const [lastSeenLocation, setLastSeenLocation] = useState('');
  const [lastSeenDate, setLastSeenDate] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [description, setDescription] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editPerson && open) {
      setFullName(editPerson.full_name || '');
      setAge(editPerson.age !== undefined ? String(editPerson.age) : '');
      setGender(editPerson.gender || 'male');
      setLastSeenLocation(editPerson.last_seen_location || '');
      setLastSeenDate(editPerson.last_seen_date || '');
      setContactPhone(editPerson.contact_phone || '');
      setDescription(editPerson.description || '');
      setPhotoFile(null);
      setPhotoPreview(editPerson.photo_url || null);
      setErrors({});
      setServerError('');
    } else if (!editPerson && open) {
      resetForm();
    }
  }, [editPerson, open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const resetForm = () => {
    setFullName('');
    setAge('');
    setGender('male');
    setLastSeenLocation('');
    setLastSeenDate('');
    setContactPhone('');
    setDescription('');
    setPhotoFile(null);
    setPhotoPreview(null);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    const result = missingPersonSchema().safeParse({
      fullName,
      age,
      gender,
      lastSeenLocation,
      lastSeenDate,
      contactPhone: contactPhone || undefined,
      description,
    });

    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string;
        if (field) {
          fieldErrors[field] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('full_name', fullName.trim());
      formData.append('age', String(Number(age)));
      formData.append('gender', gender);
      formData.append('last_seen_location', lastSeenLocation.trim());
      formData.append('last_seen_date', lastSeenDate);
      formData.append('description', description.trim());
      if (contactPhone.trim()) {
        formData.append('contact_phone', contactPhone.trim());
      }
      if (photoFile) {
        formData.append('file', photoFile);
      }

      if (editPerson) {
        await axiosSecure.patch(`/missing-persons/${editPerson.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.add({
          id: 'missing-person-updated',
          title: 'Missing person report updated successfully.',
          type: 'success',
          timeout: 4000,
        });
      } else {
        await axiosSecure.post('/missing-persons', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.add({
          id: 'missing-person-created',
          title: 'Missing person reported successfully.',
          type: 'success',
          timeout: 4000,
        });
      }

      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        err.response?.data?.error ||
        (editPerson ? 'Failed to update report.' : 'Failed to report missing person.');
      setServerError(Array.isArray(message) ? message[0] : message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MuiDrawer
      open={open}
      onClose={() => {
        resetForm();
        onOpenChange(false);
      }}
      title={editPerson ? 'Edit Missing Person Report' : 'Report a Missing Person'}
      subtitle={
        editPerson
          ? 'Update the details below for this missing person report.'
          : 'Fill in the details below to publish an active missing person report.'
      }
      width={680}
    >
      <div className="flex-1 overflow-y-auto p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {serverError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-600 text-center font-medium">
              {serverError}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="e.g. John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}

              />
              {errors.fullName && (
                <p className="text-xs text-destructive">{errors.fullName}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="age">Age</Label>
              <Input
                id="age"
                type="number"
                min="0"
                placeholder="e.g. 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}

              />
              {errors.age && (
                <p className="text-xs text-destructive">{errors.age}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="gender">Gender</Label>
              <MuiSelect
                id="gender"
                value={gender}
                onChange={(val) => setGender(val)}
                placeholder="Select gender"
                options={[
                  { label: 'Male', value: 'male' },
                  { label: 'Female', value: 'female' },
                  { label: 'Other', value: 'other' },
                ]}
              />
              {errors.gender && (
                <p className="text-xs text-destructive">{errors.gender}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastSeenLocation">Last Seen Location / Area</Label>
              <Input
                id="lastSeenLocation"
                placeholder="e.g. City, District, Street"
                value={lastSeenLocation}
                onChange={(e) => setLastSeenLocation(e.target.value)}

              />
              {errors.lastSeenLocation && (
                <p className="text-xs text-destructive">{errors.lastSeenLocation}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="lastSeenDate">Last Seen Date</Label>
              <Popover>
                <PopoverTrigger
                  render={
                    <Button
                      id="lastSeenDate"
                      type="button"
                      variant="outline"
                      className={cn(
                        'w-full justify-start text-left ',
                        !lastSeenDate && 'text-muted-foreground'
                      )}
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {lastSeenDate ? format(new Date(lastSeenDate), 'PPP') : 'Pick a date'}
                    </Button>
                  }
                />
                <PopoverContent className="w-auto p-0 z-[9999]" align="start">
                  <Calendar
                    mode="single"
                    selected={lastSeenDate ? new Date(lastSeenDate) : undefined}
                    onSelect={(date) => {
                      if (date) {
                        setLastSeenDate(format(date, 'yyyy-MM-dd'));
                      }
                    }}
                  />
                </PopoverContent>
              </Popover>
              {errors.lastSeenDate && (
                <p className="text-xs text-destructive">{errors.lastSeenDate}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone">Contact Phone (Optional)</Label>
              <Input
                id="contactPhone"
                type="tel"
                placeholder="e.g. +8801800000000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}

              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Detailed Description</Label>
            <textarea
              id="description"
              rows={3}
              placeholder="Mention clothes, physical identifiers, medical conditions, or any helpful info..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs placeholder:text-muted-foreground focus-visible:border-ring focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/30"
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="photo">Photo Upload</Label>
            <div className="flex items-center gap-4">
              <label className="flex flex-1 items-center justify-center gap-2 h-20 rounded-lg border border-dashed border-border bg-background hover:bg-muted/50 cursor-pointer p-4 transition-colors">
                <Upload className="size-5 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {photoFile ? photoFile.name : 'Click to select photo (JPG, PNG, WebP)'}
                </span>
                <input
                  id="photo"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              {photoPreview && (
                <div className="size-20 rounded-lg overflow-hidden border border-border shrink-0 bg-muted">
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="size-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="pt-4 flex justify-center">
            <ModernButton type="submit" disabled={loading}>
              {loading ? 'Submitting...' : editPerson ? 'Update Missing Person' : 'Add Missing Person'}
            </ModernButton>
          </div>
        </form>
      </div>
    </MuiDrawer>
  );
};

export default AddMissingPersonDrawer;
