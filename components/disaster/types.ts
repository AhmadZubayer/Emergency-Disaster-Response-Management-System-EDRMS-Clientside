export type DisasterTypeCategory =
  | 'cyclone'
  | 'flood'
  | 'flash_flood'
  | 'heavy_rain'
  | 'drought'
  | 'earthquake'
  | 'landslide'
  | 'wildfire'
  | 'tsunami'
  | 'heatwave'
  | 'cold_wave'
  | 'river_erosion'
  | 'storm_surge'
  | 'tornado'
  | 'avalanche';

export interface Disaster {
  id: string;
  disaster_name: string;
  impacted_location: string;
  impact_time: string;
  type: DisasterTypeCategory;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

