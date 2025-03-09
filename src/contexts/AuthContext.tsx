import { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, getUserRoles, hasRole } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { AppRole, UserProfile } from '@/types/auth';

type AuthContextType = {
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

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Supabase is configured - use the same check from the supabase.ts file
const isMissingCredentials = !supabase || !supabase.auth;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(!isMissingCredentials);
  const { toast } = useToast();

  // Fetch user profile and roles
  const fetchUserProfile = async (userId: string) => {
    if (!userId || isMissingCredentials) return null;

    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (profileError) {
      console.error('Error fetching profile:', profileError);
      return null;
    }

    // Get user roles
    const roles = await getUserRoles(userId);
    const userIsAdmin = await hasRole(userId, 'admin');
    setIsAdmin(userIsAdmin);

    const userProfile: UserProfile = {
      ...profileData,
      roles
    };

    setProfile(userProfile);
    return userProfile;
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchUserProfile(user.id);
    }
  };

  useEffect(() => {
    if (isMissingCredentials) {
      setIsLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        fetchUserProfile(session.user.id).finally(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setProfile(null);
          setIsAdmin(false);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleError = (error: Error) => {
    console.error('Auth error:', error);
    toast({
      title: 'Authentication error',
      description: error.message,
      variant: 'destructive',
    });
  };

  const signIn = async (email: string, password: string) => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      
      toast({
        title: 'Welcome back',
        description: 'You have been successfully signed in.',
      });
    } catch (error) {
      handleError(error as Error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: name,
          }
        }
      });
      
      if (error) throw error;
      
      toast({
        title: 'Account created',
        description: 'Your account has been created successfully. Please check your email for verification.',
      });
    } catch (error) {
      handleError(error as Error);
    }
  };

  const signInWithGoogle = async () => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signInWithFacebook = async () => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signInWithTwitter = async () => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'twitter',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
    
    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    if (isMissingCredentials) {
      toast({
        title: 'Configuration missing',
        description: 'Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: 'Signed out successfully',
      });
    } catch (error) {
      handleError(error as Error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        session,
        isLoading,
        signIn,
        signUp,
        signInWithGoogle,
        signInWithFacebook,
        signInWithTwitter,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
