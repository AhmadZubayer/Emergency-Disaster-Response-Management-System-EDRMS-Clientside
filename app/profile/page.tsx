'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  User,
  FileEdit,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import Navbar from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import MuiChip from '@/components/mui-chip';
import useAuth from '@/app/hooks/useAuth';
import useAxiosSecure from '@/app/hooks/useAxiosSecure';
import EditProfileDrawer, { UserProfileData } from '@/components/profile/edit-profile-drawer';
import { MissingPerson } from '@/components/missing-persons/missing-person-dialog';
import MissingPersonDetailsDrawer from '@/components/missing-persons/missing-person-details-drawer';
import AddMissingPersonDrawer from '@/components/missing-persons/add-missing-person-drawer';
import { RescueRequest } from '@/components/rescue-requests/types';
import RescueRequestDetailsDrawer from '@/components/rescue-requests/rescue-request-details-drawer';
import AddRescueRequestDrawer from '@/components/rescue-requests/add-rescue-request-drawer';

interface UserDonation {
  id: string;
  campaign_id: string;
  campaign_title: string;
  amount: number;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  paid_at: string;
  created_at: string;
}

interface UserApplication {
  id: string;
  campaign_id: string;
  campaign_title: string | null;
  applicant_id: string;
  applicant_name: string | null;
  applicant_phone: string | null;
  reason: string;
  payout_details: string;
  proof_document_url?: string | null;
  status: string;
  approved_amount?: number | null;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

const ACTIVITY_TABS = [
  'MISSING PERSONS',
  'RESCUE REQUESTS',
  'DONATIONS',
  'APPLICATIONS',
] as const;

type ActivityTabType = (typeof ACTIVITY_TABS)[number];

const renderValue = (val?: string | number | null) => {
  if (val !== undefined && val !== null && String(val).trim().length > 0) {
    return <span className="font-semibold text-foreground">{String(val)}</span>;
  }
  return <span className="text-muted-foreground/50 italic font-normal">Not added</span>;
};

const ProfilePage = () => {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const axiosSecure = useAxiosSecure();

  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [myMissingPersons, setMyMissingPersons] = useState<MissingPerson[]>([]);
  const [myRescueRequests, setMyRescueRequests] = useState<RescueRequest[]>([]);
  const [myDonations, setMyDonations] = useState<UserDonation[]>([]);
  const [myApplications, setMyApplications] = useState<UserApplication[]>([]);
  const [activeChip, setActiveChip] = useState<ActivityTabType>('MISSING PERSONS');
  const [loading, setLoading] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [togglingSafety, setTogglingSafety] = useState(false);

  const [selectedPerson, setSelectedPerson] = useState<MissingPerson | null>(null);
  const [editingPerson, setEditingPerson] = useState<MissingPerson | null>(null);
  const [isMissingPersonDrawerOpen, setIsMissingPersonDrawerOpen] = useState(false);

  const [selectedRescueRequest, setSelectedRescueRequest] = useState<RescueRequest | null>(null);
  const [editingRescueRequest, setEditingRescueRequest] = useState<RescueRequest | null>(null);
  const [isRescueRequestDrawerOpen, setIsRescueRequestDrawerOpen] = useState(false);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [profileRes, mpRes, rrRes, donRes, appRes] = await Promise.allSettled([
        axiosSecure.get('/users/profile'),
        axiosSecure.get('/missing-persons/my'),
        axiosSecure.get('/rescue-requests/my'),
        axiosSecure.get('/donations/my-donations'),
        axiosSecure.get('/donations/my-applications'),
      ]);

      if (profileRes.status === 'fulfilled') {
        const data = profileRes.value.data?.data || profileRes.value.data;
        setProfile(data);
      }
      if (mpRes.status === 'fulfilled') {
        const data = mpRes.value.data?.data || mpRes.value.data || [];
        setMyMissingPersons(Array.isArray(data) ? data : []);
      }
      if (rrRes.status === 'fulfilled') {
        const data = rrRes.value.data?.data || rrRes.value.data || [];
        setMyRescueRequests(Array.isArray(data) ? data : []);
      }
      if (donRes.status === 'fulfilled') {
        const data = donRes.value.data?.data || donRes.value.data || [];
        setMyDonations(Array.isArray(data) ? data : []);
      }
      if (appRes.status === 'fulfilled') {
        const data = appRes.value.data?.data || appRes.value.data || [];
        setMyApplications(Array.isArray(data) ? data : []);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        router.push('/sign-in');
      } else {
        fetchProfileData();
      }
    }
  }, [user, authLoading, router]);

  const handleToggleSafety = async () => {
    try {
      setTogglingSafety(true);
      await axiosSecure.patch('/users/is-safe');
      await fetchProfileData();
    } catch {
    } finally {
      setTogglingSafety(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Navbar />
        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-10 space-y-6">
          <div className="h-28 rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          <div className="h-96 rounded-2xl bg-muted/30 animate-pulse border border-border/40" />
        </main>
      </div>
    );
  }

  const coordinates =
    profile?.gps_lat && profile?.gps_lng
      ? `${Number(profile.gps_lat).toFixed(4)}, ${Number(profile.gps_lng).toFixed(4)}`
      : null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/60 pb-6">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 font-bold text-2xl shrink-0 overflow-hidden">
              {profile?.photo_url ? (
                <img
                  src={profile.photo_url}
                  alt={profile.name}
                  className="size-full object-cover"
                />
              ) : (
                <User className="size-8 text-emerald-600" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl font-extrabold tracking-tight text-foreground">
                  {profile?.name || user?.name}
                </h1>
                <Badge variant="outline" className="text-[10px] px-2 py-0 uppercase font-bold tracking-wider">
                  {profile?.auth?.role || user?.role || 'user'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {profile?.auth?.email || user?.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={profile?.is_safe ? 'default' : 'outline'}
              size="sm"
              onClick={handleToggleSafety}
              disabled={togglingSafety}
              className="gap-1.5 rounded-xl text-xs font-semibold"
            >
              {profile?.is_safe ? (
                <>
                  <CheckCircle2 className="size-3.5 text-white" />
                  Status: Marked Safe
                </>
              ) : (
                <>
                  <AlertCircle className="size-3.5 text-amber-500" />
                  Status: Need Help
                </>
              )}
            </Button>
          </div>
        </div>

        <Tabs defaultValue="profile" className="w-full space-y-6">
          <TabsList className="h-9">
            <TabsTrigger value="profile">Your profile</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/50 pb-4">
                <h3 className="text-base font-bold text-foreground">Personal Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Your identity, contact numbers, and basic account profile.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Full Name
                  </span>
                  <div>{renderValue(profile?.name)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Email Address
                  </span>
                  <div>{renderValue(profile?.auth?.email)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Phone Number
                  </span>
                  <div>{renderValue(profile?.phone)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Account Role
                  </span>
                  <div>{renderValue(profile?.auth?.role?.toUpperCase())}</div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/50 pb-4">
                <h3 className="text-base font-bold text-foreground">Address & Location Details</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Residential address and GPS coordinates for emergency dispatch.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    House / Street
                  </span>
                  <div>{renderValue(profile?.address?.house)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    City / Area
                  </span>
                  <div>{renderValue(profile?.address?.city)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    District / State
                  </span>
                  <div>{renderValue(profile?.address?.district)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Country
                  </span>
                  <div>{renderValue(profile?.address?.country)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    GPS Coordinates
                  </span>
                  <div>{renderValue(coordinates)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Safety Status
                  </span>
                  <div>
                    {profile?.is_safe === true ? (
                      <span className="font-semibold text-emerald-600">Safe</span>
                    ) : profile?.is_safe === false ? (
                      <span className="font-semibold text-red-500">Needs Assistance</span>
                    ) : (
                      <span className="text-muted-foreground/50 italic font-normal">Not added</span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-6">
              <div className="border-b border-border/50 pb-4">
                <h3 className="text-base font-bold text-foreground">Emergency & Medical Information</h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Critical medical history and emergency contacts accessed by relief responders.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 text-xs">
                <div className="space-y-1 col-span-1 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Emergency Message
                  </span>
                  <div>{renderValue(profile?.emergency_message)}</div>
                </div>

                <div className="space-y-1 col-span-1 md:col-span-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Medical Information
                  </span>
                  <div>{renderValue(profile?.medical_information)}</div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Member Since
                  </span>
                  <div>
                    {profile?.created_at
                      ? new Date(profile.created_at).toLocaleDateString()
                      : renderValue(null)}
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                    Last Profile Update
                  </span>
                  <div>
                    {profile?.updated_at
                      ? new Date(profile.updated_at).toLocaleDateString()
                      : renderValue(null)}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={() => setIsEditOpen(true)}
                className="gap-2 rounded-xl font-semibold px-5"
              >
                <FileEdit className="size-4" />
                Edit Profile
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <div className="flex flex-wrap items-center gap-2.5">
              {ACTIVITY_TABS.map((tab) => (
                <MuiChip
                  key={tab}
                  label={tab}
                  selected={activeChip === tab}
                  onClick={() => setActiveChip(tab)}
                />
              ))}
            </div>

            <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-border/50 pb-4">
                <div>
                  <h3 className="text-base font-bold text-foreground capitalize">
                    {activeChip.toLowerCase()}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {activeChip === 'MISSING PERSONS' && 'All missing person reports submitted by your account.'}
                    {activeChip === 'RESCUE REQUESTS' && 'Emergency rescue alerts registered by your account.'}
                    {activeChip === 'DONATIONS' && 'Contribution history and disaster relief fund payments.'}
                    {activeChip === 'APPLICATIONS' && 'Financial aid applications and payout review requests.'}
                  </p>
                </div>
                {activeChip === 'MISSING PERSONS' && (
                  <Button
                    render={<Link href="/missing-persons" />}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    View Missing Persons
                  </Button>
                )}
                {activeChip === 'RESCUE REQUESTS' && (
                  <Button
                    render={<Link href="/rescue-requests" />}
                    variant="outline"
                    size="sm"
                    className="rounded-xl text-xs"
                  >
                    View Rescue Requests
                  </Button>
                )}
              </div>

              {activeChip === 'MISSING PERSONS' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Photo</TableHead>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Gender / Age</TableHead>
                      <TableHead>Last Seen Location</TableHead>
                      <TableHead>Last Seen Date</TableHead>
                      <TableHead>Contact Phone</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myMissingPersons.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                          No missing person reports filed.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myMissingPersons.map((person) => (
                        <TableRow
                          key={person.id}
                          className="cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => setSelectedPerson(person)}
                        >
                          <TableCell>
                            <div className="size-9 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border/60">
                              {person.photo_url ? (
                                <img
                                  src={person.photo_url}
                                  alt={person.full_name}
                                  className="size-full object-cover"
                                />
                              ) : (
                                <User className="size-4 text-muted-foreground" />
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="font-semibold text-foreground">
                            {person.full_name}
                          </TableCell>
                          <TableCell>
                            {person.gender || 'Unknown'} • {person.age} yrs
                          </TableCell>
                          <TableCell>{person.last_seen_location}</TableCell>
                          <TableCell>
                            {person.last_seen_date
                              ? new Date(person.last_seen_date).toLocaleDateString()
                              : 'Unknown'}
                          </TableCell>
                          <TableCell>{person.contact_phone || 'N/A'}</TableCell>
                          <TableCell>
                            <Badge
                              variant={person.status === 'FOUND' ? 'default' : 'destructive'}
                              className="text-[10px] uppercase font-bold"
                            >
                              {person.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeChip === 'RESCUE REQUESTS' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Location / Address</TableHead>
                      <TableHead>People Count</TableHead>
                      <TableHead>Urgency</TableHead>
                      <TableHead>GPS Coordinates</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Reported Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myRescueRequests.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No rescue requests submitted.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myRescueRequests.map((req) => (
                        <TableRow
                          key={req.id}
                          className="cursor-pointer hover:bg-muted/70 transition-colors"
                          onClick={() => setSelectedRescueRequest(req)}
                        >
                          <TableCell className="font-semibold text-foreground max-w-[200px] truncate">
                            {req.address || `Request #${req.id.slice(0, 8)}`}
                          </TableCell>
                          <TableCell>
                            {req.people_count} {req.people_count === 1 ? 'person' : 'people'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                req.urgency_level === 'CRITICAL'
                                  ? 'destructive'
                                  : req.urgency_level === 'HIGH'
                                  ? 'default'
                                  : 'secondary'
                              }
                              className="text-[10px] uppercase font-bold"
                            >
                              {req.urgency_level}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.latitude && req.longitude
                              ? `${Number(req.latitude).toFixed(4)}, ${Number(req.longitude).toFixed(4)}`
                              : 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={req.status === 'RESCUED' ? 'default' : 'secondary'}
                              className="text-[10px] uppercase font-bold"
                            >
                              {req.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {req.created_at
                              ? new Date(req.created_at).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeChip === 'DONATIONS' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Gateway</TableHead>
                      <TableHead>Transaction ID</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myDonations.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No donation records found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myDonations.map((don) => (
                        <TableRow key={don.id}>
                          <TableCell className="font-semibold text-foreground max-w-[200px] truncate">
                            {don.campaign_title || 'General Relief Fund'}
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            ${don.amount.toFixed(2)}
                          </TableCell>
                          <TableCell className="uppercase text-[11px] font-mono">
                            {don.payment_gateway}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] text-muted-foreground">
                            {don.transaction_id || 'N/A'}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={don.status === 'COMPLETED' ? 'default' : 'secondary'}
                              className="text-[10px] uppercase font-bold"
                            >
                              {don.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {don.paid_at || don.created_at
                              ? new Date(don.paid_at || don.created_at).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}

              {activeChip === 'APPLICATIONS' && (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Campaign</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Approved Amount</TableHead>
                      <TableHead>Payout Details</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {myApplications.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                          No aid applications submitted.
                        </TableCell>
                      </TableRow>
                    ) : (
                      myApplications.map((app) => (
                        <TableRow key={app.id}>
                          <TableCell className="font-semibold text-foreground max-w-[180px] truncate">
                            {app.campaign_title || 'Relief Campaign'}
                          </TableCell>
                          <TableCell className="max-w-[200px] truncate text-muted-foreground">
                            {app.reason}
                          </TableCell>
                          <TableCell className="font-semibold text-emerald-600">
                            {app.approved_amount !== null && app.approved_amount !== undefined
                              ? `$${Number(app.approved_amount).toFixed(2)}`
                              : 'Pending'}
                          </TableCell>
                          <TableCell className="font-mono text-[11px] max-w-[150px] truncate">
                            {app.payout_details}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={
                                app.status === 'APPROVED'
                                  ? 'default'
                                  : app.status === 'REJECTED'
                                  ? 'destructive'
                                  : 'secondary'
                              }
                              className="text-[10px] uppercase font-bold"
                            >
                              {app.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {app.created_at
                              ? new Date(app.created_at).toLocaleDateString()
                              : 'N/A'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      <EditProfileDrawer
        open={isEditOpen}
        onOpenChange={setIsEditOpen}
        onSuccess={fetchProfileData}
        profile={profile}
      />

      <MissingPersonDetailsDrawer
        person={selectedPerson}
        open={!!selectedPerson}
        onOpenChange={(open) => {
          if (!open) setSelectedPerson(null);
        }}
        onEdit={(person) => {
          setSelectedPerson(null);
          setEditingPerson(person);
          setIsMissingPersonDrawerOpen(true);
        }}
        onRefresh={fetchProfileData}
      />

      <AddMissingPersonDrawer
        open={isMissingPersonDrawerOpen}
        onOpenChange={setIsMissingPersonDrawerOpen}
        onSuccess={fetchProfileData}
        editPerson={editingPerson}
      />

      <RescueRequestDetailsDrawer
        request={selectedRescueRequest}
        open={!!selectedRescueRequest}
        onOpenChange={(open) => {
          if (!open) setSelectedRescueRequest(null);
        }}
        onEdit={(req) => {
          setSelectedRescueRequest(null);
          setEditingRescueRequest(req);
          setIsRescueRequestDrawerOpen(true);
        }}
        onRefresh={fetchProfileData}
      />

      <AddRescueRequestDrawer
        open={isRescueRequestDrawerOpen}
        onOpenChange={setIsRescueRequestDrawerOpen}
        onSuccess={fetchProfileData}
        editRequest={editingRescueRequest}
      />
    </div>
  );
};

export default ProfilePage;

