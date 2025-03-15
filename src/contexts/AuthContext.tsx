
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { getUserRole, hasRole } from '@/lib/auth-utils';
import { AuthContextType } from './auth/types';
import { Session, User } from '@supabase/supabase-js';
import { UserProfile, AppRole } from '@/types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

// Export AuthContext
export { AuthContext };

const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isMissingCredentials = !import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_ANON_KEY;

  console.log('Supabase URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('Supabase Anon Key:', import.meta.env.VITE_SUPABASE_ANON_KEY);

  const fetchUserProfile = useCallback(async (userId: string) => {
    if (!userId || isMissingCredentials) return null;

    try {
      const [profileData, roles] = await Promise.all([
        supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()
          .then(({ data, error }) => {
            if (error) throw error;
            return data;
          }),
        getUserRole(userId)
      ]);

      const userIsAdmin = await hasRole(userId, 'admin');
      setIsAdmin(userIsAdmin);

      const userProfile: UserProfile = {
        ...profileData,
        roles
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, [isMissingCredentials]);

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

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setProfile(null);
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchUserProfile, isMissingCredentials]);

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
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;
