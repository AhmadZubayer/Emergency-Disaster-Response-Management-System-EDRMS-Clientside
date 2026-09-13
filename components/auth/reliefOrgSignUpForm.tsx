'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Building2,
  FileText,
  Upload,
  X,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Globe,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ModernButton from '@/components/modernBtn';
import MuiSelect from '@/components/mui-select';
import { toast } from '@/components/ui/toast';
import { axiosSecure } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { reliefOrgSchema } from '@/lib/validations/relief-org-schema';

const ORGANIZATION_TYPES = [
  'NGO (Non-Governmental Organization)',
  'Non-Profit Organization',
  'Government Relief Agency',
  'Volunteer Response Coalition',
  'International Humanitarian Agency',
  'Community Disaster Relief Fund',
  'Other',
];

const ReliefOrgSignUpForm = () => {
  const router = useRouter();
  const { user } = useAuth();

  const [orgName, setOrgName] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [orgType, setOrgType] = useState('NGO (Non-Governmental Organization)');
  const [address, setAddress] = useState('');
  const [contactEmail, setContactEmail] = useState(user?.email || '');
  const [contactPhone, setContactPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [description, setDescription] = useState('');

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...newFiles]);
      if (errors.verification_docs) {
        setErrors((prev) => {
          const next = { ...prev };
          delete next.verification_docs;
          return next;
        });
      }
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setServerError('');

    if (!user) {
      setServerError('You must be logged in to apply as a relief organization. Please sign in first.');
      return;
    }

    const payload = {
      organization_name: orgName,
      registration_number: regNumber,
      organization_type: orgType,
      address,
      contact_email: contactEmail,
      contact_phone: contactPhone,
      website: website || undefined,
      description: description || undefined,
    };

    const result = reliefOrgSchema.safeParse(payload);
    if (!result.success) {
      const errMap: Record<string, string> = {};
      result.error.issues.forEach((issue) => {
        if (issue.path[0]) {
          errMap[issue.path[0] as string] = issue.message;
        }
      });
      setErrors(errMap);
      return;
    }

    if (selectedFiles.length === 0) {
      setErrors((prev) => ({
        ...prev,
        verification_docs: 'At least one official verification document is required (PDF, PNG, JPG).',
      }));
      return;
    }

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append('organization_name', orgName.trim());
      formData.append('registration_number', regNumber.trim());
      formData.append('organization_type', orgType.trim());
      formData.append('address', address.trim());
      if (contactEmail.trim()) formData.append('contact_email', contactEmail.trim());
      if (contactPhone.trim()) formData.append('contact_phone', contactPhone.trim());
      if (website.trim()) formData.append('website', website.trim());
      if (description.trim()) formData.append('description', description.trim());

      selectedFiles.forEach((file) => {
        formData.append('verification_docs', file);
      });

      await axiosSecure.post('/relief-org/sign-up-as-relief-org', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.add({
        id: 'relief-org-applied-success',
        title: 'Application submitted successfully!',
        type: 'success',
        timeout: 5000,
      });

      setSubmittedSuccess(true);
    } catch (err: any) {
      setServerError(
        err?.response?.data?.message || 'Failed to submit application. Please verify your details and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (submittedSuccess) {
    return (
      <Card className="w-full max-w-xl shadow-2xl border-border/80 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-2xl p-6 text-center space-y-6">
        <div className="size-16 rounded-2xl bg-muted/60 border border-border/60 flex items-center justify-center mx-auto text-foreground">
          <CheckCircle2 className="size-9" />
        </div>
        <div className="space-y-2">
          <Badge variant="outline" className="text-foreground bg-muted border-border/60 uppercase font-bold text-[10px] tracking-wider px-2.5 py-0.5">
            Application Received
          </Badge>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Application Under Review
          </h2>
          <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
            Thank you for applying to register <span className="font-semibold text-foreground">{orgName}</span> as an official Relief Organization. Our administrative team will review your verification credentials and notify you once approved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="outline"
            className="w-full sm:w-auto rounded-xl text-xs font-semibold px-6"
            onClick={() => router.push('/relief-org/profile')}
          >
            Go to Profile
          </Button>
          <Button
            className="w-full sm:w-auto rounded-xl text-xs font-semibold px-6"
            onClick={() => router.push('/')}
          >
            Return to Home
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl shadow-2xl border-border/80 bg-white/95 dark:bg-card/95 backdrop-blur-md rounded-2xl p-2 sm:p-4 my-6">
      <CardHeader className="text-center pb-4 space-y-1.5">
        <div className="size-12 rounded-xl bg-muted/60 border border-border/60 flex items-center justify-center mx-auto text-foreground mb-1">
          <Building2 className="size-6" />
        </div>
        <CardTitle className="text-2xl font-bold tracking-tight text-foreground">
          Relief Organization Registration
        </CardTitle>
        <CardDescription className="text-xs text-muted-foreground max-w-md mx-auto">
          Partner with our emergency disaster response platform. Submit your registration credentials for verification.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {serverError && (
          <Alert variant="destructive" className="py-2.5 px-3.5 text-xs rounded-xl">
            <AlertCircle className="size-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgName" className="text-xs font-semibold flex items-center gap-1">
                Organization Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="orgName"
                placeholder="e.g. Red Crescent Bangladesh"
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                className="h-10 text-xs bg-background/60"
              />
              {errors.organization_name && (
                <p className="text-[11px] text-destructive">{errors.organization_name}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="regNumber" className="text-xs font-semibold flex items-center gap-1">
                Govt. Registration / License No. <span className="text-destructive">*</span>
              </Label>
              <Input
                id="regNumber"
                placeholder="e.g. NGO-REG-2026-8821"
                value={regNumber}
                onChange={(e) => setRegNumber(e.target.value)}
                className="h-10 text-xs bg-background/60 font-mono"
              />
              {errors.registration_number && (
                <p className="text-[11px] text-destructive">{errors.registration_number}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="orgType" className="text-xs font-semibold flex items-center gap-1">
                Organization Type <span className="text-destructive">*</span>
              </Label>
              <MuiSelect
                id="orgType"
                value={orgType}
                onChange={(val) => setOrgType(val)}
                placeholder="Select organization type"
                options={ORGANIZATION_TYPES.map((t) => ({
                  label: t,
                  value: t,
                }))}
              />
              {errors.organization_type && (
                <p className="text-[11px] text-destructive">{errors.organization_type}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website" className="text-xs font-semibold flex items-center gap-1 text-muted-foreground">
                <Globe className="size-3.5 text-muted-foreground" />
                Website URL (Optional)
              </Label>
              <Input
                id="website"
                placeholder="https://yourorganization.org"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="h-10 text-xs bg-background/60"
              />
              {errors.website && (
                <p className="text-[11px] text-destructive">{errors.website}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="contactEmail" className="text-xs font-semibold flex items-center gap-1">
                <Mail className="size-3.5 text-muted-foreground" />
                Contact Email
              </Label>
              <Input
                id="contactEmail"
                type="email"
                placeholder="contact@organization.org"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                className="h-10 text-xs bg-background/60"
              />
              {errors.contact_email && (
                <p className="text-[11px] text-destructive">{errors.contact_email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contactPhone" className="text-xs font-semibold flex items-center gap-1">
                <Phone className="size-3.5 text-muted-foreground" />
                Contact Phone
              </Label>
              <Input
                id="contactPhone"
                placeholder="+880 1700 000000"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="h-10 text-xs bg-background/60"
              />
              {errors.contact_phone && (
                <p className="text-[11px] text-destructive">{errors.contact_phone}</p>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold flex items-center gap-1">
              <MapPin className="size-3.5 text-muted-foreground" />
              Headquarters / Operational Address <span className="text-destructive">*</span>
            </Label>
            <Input
              id="address"
              placeholder="e.g. House 42, Road 11, Banani, Dhaka, Bangladesh"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="h-10 text-xs bg-background/60"
            />
            {errors.address && (
              <p className="text-[11px] text-destructive">{errors.address}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs font-semibold text-muted-foreground">
              Organization Mission & Description (Optional)
            </Label>
            <Textarea
              id="description"
              rows={3}
              placeholder="Provide a brief overview of your relief capabilities, volunteer network, and operational areas..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs bg-background/60 resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs font-semibold flex items-center gap-1">
              <FileCheck2 className="size-3.5 text-muted-foreground" />
              Verification Documents (Multiple Allowed) <span className="text-destructive">*</span>
            </Label>

            <div className="relative border-2 border-dashed border-border/80 hover:border-emerald-500/50 transition-colors rounded-xl p-4 bg-muted/20 text-center">
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg,.webp"
                onChange={handleFileChange}
                className="absolute inset-0 size-full opacity-0 cursor-pointer"
                id="verificationDocs"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <div className="size-9 rounded-full bg-muted/60 flex items-center justify-center text-foreground">
                  <Upload className="size-4.5" />
                </div>
                <div className="text-xs font-semibold text-foreground">
                  Click or drag documents to upload
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Govt. certificate, NGO license, or tax clearance (PDF, PNG, JPG up to 10MB each)
                </p>
              </div>
            </div>

            {errors.verification_docs && (
              <p className="text-[11px] text-destructive">{errors.verification_docs}</p>
            )}

            {selectedFiles.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={`${file.name}-${idx}`}
                    className="flex items-center justify-between px-3 py-2 bg-muted/40 border border-border/60 rounded-xl text-xs"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <FileText className="size-4 text-muted-foreground shrink-0" />
                      <span className="font-medium text-foreground truncate">{file.name}</span>
                      <span className="text-[10px] text-muted-foreground shrink-0 font-mono">
                        ({formatFileSize(file.size)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="size-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive flex items-center justify-center transition-colors shrink-0 ml-2"
                    >
                      <X className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-3 flex justify-center">
            <ModernButton type="submit" disabled={loading}>
              {loading ? 'Sending Application...' : 'Send Application'}
            </ModernButton>
          </div>
        </form>
      </CardContent>

      <CardFooter className="justify-center pt-2 pb-1">
        <p className="text-xs text-muted-foreground">
          Looking to join as an individual volunteer?{' '}
          <Link href="/manage-volunteers" className="text-foreground underline underline-offset-4 font-medium hover:text-primary">
            Join Volunteer Network
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
};

export default ReliefOrgSignUpForm;
