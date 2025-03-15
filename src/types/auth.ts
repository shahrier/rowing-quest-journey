
import { Session, User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'user' | 'team_manager';

export interface UserProfile {
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: AppRole;
  team_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  isTeamManager: boolean;
  isLoading: boolean;
}

export type { User, Session };
