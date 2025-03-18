export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  tier: BadgeTier;
  team_id: string | null;
  created_by: string;
  created_at: string;
}

export interface UserBadge {
  id: string;
  user_id: string;
  badge_id: string;
  earned_at: string;
}

export interface Team {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  goal_distance: number | null;
  current_distance: number;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: 'admin' | 'team_manager' | 'user';
  team_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Activity {
  id: string;
  user_id: string;
  team_id: string;
  activity_type: 'rowing' | 'strength';
  distance: number | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
}

export interface Media {
  id: string;
  user_id: string;
  team_id: string;
  url: string;
  type: 'photo' | 'video';
  caption: string | null;
  created_at: string;
}

export interface JourneyCheckpoint {
  id: string;
  team_id: string;
  name: string;
  description: string | null;
  distance_from_start: number;
  latitude: number;
  longitude: number;
  is_reached: boolean;
  reached_at: string | null;
}

export type AppRole = 'admin' | 'team_manager' | 'user';