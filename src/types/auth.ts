import { User } from '@supabase/supabase-js';

export type AppRole = 'admin' | 'user';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  roles: AppRole[];
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  roles: AppRole[];
  isAdmin: boolean;
  isLoading: boolean;
}