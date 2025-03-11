
export interface Team {
  id: string;
  name: string;
  created_at: string;
  created_by: string;
}

export interface TeamMembership {
  id: string;
  team_id: string;
  user_id: string;
  role: 'manager' | 'member';
  joined_at: string;
}

export interface Journey {
  id: string;
  team_id: string;
  name: string;
  start_location: string;
  end_location: string;
  distance_km: number;
  created_at: string;
}

export interface TeamWithMembers extends Team {
  members: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
    role: 'manager' | 'member';
  }[];
}

export interface TeamWithJourney extends Team {
  journey?: Journey;
}
