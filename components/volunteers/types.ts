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

