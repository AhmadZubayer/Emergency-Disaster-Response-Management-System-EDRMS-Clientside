export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type RescueStatus =
  | 'PENDING'
  | 'ACKNOWLEDGED'
  | 'DISPATCHED'
  | 'IN_PROGRESS'
  | 'RESCUED'
  | 'CANCELLED';

export interface RescueRequest {
  id: string;
  user_id: string;
  user?: {
    id: string;
    name?: string;
    email?: string;
    phone_number?: string;
  };
  latitude: number;
  longitude: number;
  address?: string | null;
  people_count: number;
  urgency_level: UrgencyLevel;
  photo_url?: string | null;
  description: string;
  contact_phone: string;
  medical_notes?: string | null;
  status: RescueStatus;
  assigned_rescuer_id?: string | null;
  created_at: string;
  updated_at: string;
}
