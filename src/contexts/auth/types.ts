
import { Session, User } from '@supabase/supabase-js';
import { AppRole } from '@/types/auth';

export type UserProfile = {
  user_id: string;
  email: string;
  full_name: string | null;
  role: string;
  avatar_url?: string;
  team_id?: string;
  created_at?: string;
  updated_at?: string;
};

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isAdmin: boolean;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

// Re-export the Supabase types
export type { User, Session };
