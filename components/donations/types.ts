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


