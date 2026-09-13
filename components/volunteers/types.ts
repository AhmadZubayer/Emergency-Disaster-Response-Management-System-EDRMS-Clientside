export interface VolunteerGroup {
  id: string;
  title: string;
  description: string;
  required_skills: string[];
  location: string;
  needed_volunteers: number;
  disaster_name?: string | null;
  status: 'open' | 'closed';
  joined_volunteers?: number;
  created_at?: string;
  updated_at?: string;
}

export type VolunteerSkill =
  | 'first_aid'
  | 'search_and_rescue'
  | 'fire_safety'
  | 'medical_assistance'
  | 'logistics_transport'
  | 'flood_rescue'
  | 'shelter_management'
  | 'food_distribution'
  | 'psychosocial_support'
  | 'telecommunications'
  | 'other';

export type VolunteerVerificationStatus =
  | 'not_applied'
  | 'pending'
  | 'verified'
  | 'rejected';

export interface VolunteerProfile {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone_number?: string;
  };
  skills: VolunteerSkill[];
  why_join: string;
  nid_card_url?: string | null;
  available: boolean;
  verification_status: VolunteerVerificationStatus;
  current_latitude?: number | null;
  current_longitude?: number | null;
  on_duty: boolean;
  last_location_update?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface NearbyRescueRequest {
  id: string;
  address?: string | null;
  description: string;
  people_count: number;
  urgency_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  latitude: number;
  longitude: number;
  contact_phone?: string;
  medical_notes?: string | null;
  distance_km: number;
  created_at?: string;
}

export type VolunteerTaskStatus =
  | 'accepted'
  | 'rejected'
  | 'in_progress'
  | 'completed';

export interface VolunteerTask {
  id: string;
  volunteer_id: string;
  rescue_request_id: string;
  status: VolunteerTaskStatus;
  progress_note?: string | null;
  completed_at?: string | null;
  created_at?: string;
  updated_at?: string;
  rescue_request?: NearbyRescueRequest;
}

export type FieldReportType =
  | 'blocked_route'
  | 'dangerous_route'
  | 'resource_shortage';

export type ReportSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface FieldReport {
  id: string;
  report_type: FieldReportType;
  description: string;
  latitude: number;
  longitude: number;
  address?: string | null;
  severity: ReportSeverity;
  resource_name?: string | null;
  quantity_needed?: number | null;
  created_at?: string;
}

export interface OrganizationOpportunity extends VolunteerGroup {
  organization_user_id: string;
  organization_user?: {
    id: string;
    name?: string;
    email?: string;
  };
}

export interface OrganizationJoin {
  id: string;
  volunteer_id: string;
  organization_request_id: string;
  joined_at?: string;
  organization_request?: OrganizationOpportunity;
}

export interface GroupJoin {
  id: string;
  volunteer_id: string;
  target_type: 'rescue_request' | 'missing_person';
  target_id: string;
  why_join: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at?: string;
  updated_at?: string;
}

export const VOLUNTEER_SKILLS: Array<{
  value: VolunteerSkill;
  label: string;
}> = [
  { value: 'first_aid', label: 'First Aid' },
  { value: 'search_and_rescue', label: 'Search and Rescue' },
  { value: 'fire_safety', label: 'Fire Safety' },
  { value: 'medical_assistance', label: 'Medical Assistance' },
  { value: 'logistics_transport', label: 'Logistics and Transport' },
  { value: 'flood_rescue', label: 'Flood Rescue' },
  { value: 'shelter_management', label: 'Shelter Management' },
  { value: 'food_distribution', label: 'Food Distribution' },
  { value: 'psychosocial_support', label: 'Psychosocial Support' },
  { value: 'telecommunications', label: 'Telecommunications' },
  { value: 'other', label: 'Other' },
];

export const formatVolunteerValue = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

