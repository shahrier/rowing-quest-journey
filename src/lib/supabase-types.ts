export type BadgeTier = 'bronze' | 'silver' | 'gold';

export interface Team {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
  goal_distance: number;
  current_distance: number;
  description: string;
}

export interface Activity {
  id: string;
  user_id: string;
  team_id: string;
  activity_type: 'rowing' | 'strength';
  distance?: number;
  duration: number;
  notes?: string;
  created_at: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  requirement_type: string;
  requirement_value: number;
  tier: BadgeTier;
  team_id?: string;
  created_by: string;
  created_at: string;
}

export interface UserBadge {
  user_id: string;
  badge_id: string;
  earned_at: string;
  badge?: Badge;
}

export interface Media {
  id: string;
  user_id: string;
  team_id: string;
  media_type: 'photo' | 'video';
  url: string;
  caption?: string;
  created_at: string;
}
