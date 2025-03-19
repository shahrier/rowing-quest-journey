import React, { createContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import { getUserRole, hasRole } from "@/lib/auth-utils";
import { useToast } from "@/hooks/use-toast";
import { UserProfile } from "./types";
import { AuthContextType } from "./types";

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined,
);

// Check if Supabase is configured
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

    try {
      const { data: profileData, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", userId)
        .single();

      if (error) throw error;

      const userIsAdmin = profileData.role === "admin";
      setIsAdmin(userIsAdmin);

      const userProfile: UserProfile = {
        user_id: profileData.user_id,
        email: profileData.email,
        full_name: profileData.full_name,
        avatar_url: profileData.avatar_url,
        role: profileData.role,
        team_id: profileData.team_id,
        created_at: profileData.created_at,
        updated_at: profileData.updated_at,
      };

      setProfile(userProfile);
      return userProfile;
    } catch (error) {
      console.error("Error fetching profile:", error);
      return null;
    }
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
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
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
  }, []);

  const handleError = (error: Error) => {
    console.error("Auth error:", error);
    toast({
      title: "Authentication error",
      description: error.message,
      variant: "destructive",
    });
  };

  const signIn = async (email: string, password: string) => {
    if (isMissingCredentials) {
      toast({
        title: "Configuration missing",
        description:
          "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      toast({
        title: "Welcome back",
        description: "You have been successfully signed in.",
      });
    } catch (error) {
      handleError(error as Error);
    }
  };

  const signUp = async (email: string, password: string, name: string) => {
    if (isMissingCredentials) {
      toast({
        title: "Configuration missing",
        description:
          "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
        variant: "destructive",
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
          },
        },
      });

      if (error) throw error;

      toast({
        title: "Account created",
        description:
          "Your account has been created successfully. Please check your email for verification.",
      });
    } catch (error) {
      handleError(error as Error);
    }
  };

  const signInWithGoogle = async () => {
    if (isMissingCredentials) {
      toast({
        title: "Configuration missing",
        description:
          "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      handleError(error);
    }
  };

  const signInWithFacebook = async () => {
    if (isMissingCredentials) {
      toast({
        title: "Configuration missing",
        description:
          "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "facebook",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      handleError(error);
    }
  };

  const signInWithTwitter = async () => {
    if (isMissingCredentials) {
      toast({
        title: "Configuration missing",
        description:
          "Supabase credentials are not configured. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "twitter",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });

    if (error) {
      handleError(error);
    }
  };

  const signOut = async () => {
    if (isMissingCredentials) return;
    const { error } = await supabase.auth.signOut();
    if (error) {
      handleError(error);
    }
  };

  const value: AuthContextType = {
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
  };

  return (
    <AuthContext.Provider value={value} data-oid="4q5xf95">
      {children}
    </AuthContext.Provider>
  );
}
