import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Session, User } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isTeamManager: boolean;
  teamId: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, teamName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export default function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamManager, setIsTeamManager] = useState(false);
  const [teamId, setTeamId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchUserRole(session.user.id);
      } else {
        setIsAdmin(false);
        setIsTeamManager(false);
        setTeamId(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role, team_id')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        return;
      }

      // Set admin status
      setIsAdmin(data.role === 'admin');
      
      // Set team manager status
      setIsTeamManager(data.role === 'team_manager');
      
      // Set team ID
      setTeamId(data.team_id);
      
      console.log('User role:', data.role, 'Team ID:', data.team_id);
    } catch (error) {
      console.error('Error in fetchUserRole:', error);
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        toast({
          title: 'Sign in failed',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Signed in successfully',
        description: 'Welcome back!',
      });
    } catch (error) {
      console.error('Error signing in:', error);
      toast({
        title: 'Sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string, teamName?: string) => {
    try {
      // Create the user account
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) {
        toast({
          title: 'Sign up failed',
          description: authError.message,
          variant: 'destructive',
        });
        return;
      }

      if (!authData.user) {
        toast({
          title: 'Sign up failed',
          description: 'User creation failed',
          variant: 'destructive',
        });
        return;
      }

      // Determine if user is creating a team (will be team manager)
      const role = teamName ? 'team_manager' : 'user';
      let teamId = null;

      // If creating a team, create the team first
      if (teamName) {
        const { data: teamData, error: teamError } = await supabase
          .from('teams')
          .insert({
            name: teamName,
            created_by: authData.user.id,
            journey_name: 'Boston to Rotterdam',
            start_location: 'Boston',
            end_location: 'Rotterdam',
            total_distance_km: 5556,
          })
          .select()
          .single();

        if (teamError) {
          console.error('Error creating team:', teamError);
          toast({
            title: 'Team creation failed',
            description: teamError.message,
            variant: 'destructive',
          });
          // Continue with user creation even if team creation fails
        } else {
          teamId = teamData.id;
        }
      }

      // Create user profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          full_name: fullName,
          email: email,
          role: role,
          team_id: teamId,
        });

      if (profileError) {
        console.error('Error creating profile:', profileError);
        toast({
          title: 'Profile creation failed',
          description: profileError.message,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Account created successfully',
        description: teamName 
          ? `Your team "${teamName}" has been created and you are the team manager.` 
          : 'Your account has been created. You can now join a team.',
      });
    } catch (error) {
      console.error('Error signing up:', error);
      toast({
        title: 'Sign up failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: 'Signed out successfully',
      });
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: 'Sign out failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: 'Google sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error signing in with Google:', error);
      toast({
        title: 'Google sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const signInWithFacebook = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'facebook',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: 'Facebook sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error signing in with Facebook:', error);
      toast({
        title: 'Facebook sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const signInWithTwitter = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'twitter',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) {
        toast({
          title: 'Twitter sign in failed',
          description: error.message,
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
      toast({
        title: 'Twitter sign in failed',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  const value = {
    user,
    session,
    isAdmin,
    isTeamManager,
    teamId,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithFacebook,
    signInWithTwitter,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}