export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  photo_url?: string | null;
  status: 'active' | 'completed' | 'closed';
  start_date: string;
  end_date: string;
  donors_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface DonationApplication {
  id: string;
  campaign_id: string;
  campaign_title?: string | null;
  applicant_id: string;
  applicant_name: string;
  applicant_email?: string | null;
  applicant_phone?: string | null;
  reason: string;
  payout_details: string;
  proof_document_url?: string | null;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_amount?: number | null;
  reviewed_by_user_id?: string | null;
  reviewed_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DonationTransaction {
  id: string;
  campaign_id: string;
  transaction_type: 'DONATE' | 'RECEIVE';
  user_id?: string | null;
  user_name: string;
  user_email?: string | null;
  is_anonymous: boolean;
  amount: number;
  payment_gateway: string;
  transaction_id: string;
  status: string;
  paid_at: string;
  created_at: string;
}
