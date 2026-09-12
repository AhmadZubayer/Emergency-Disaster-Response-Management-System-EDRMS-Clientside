export interface DonationCampaign {
  id: string;
  title: string;
  description: string;
  target_amount: number;
  raised_amount: number;
  status: 'active' | 'completed' | 'closed';
  start_date: string;
  end_date: string;
  created_at?: string;
  updated_at?: string;
}

