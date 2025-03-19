import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";

interface AuthState {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  isTeamManager: boolean;
  isLoading: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string; userId?: string }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithFacebook: () => Promise<void>;
  signInWithTwitter: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    isAdmin: false,
    isTeamManager: false,
    isLoading: true,
  });
  const { toast } = useToast();

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        loading: false,
      }));

      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        user: session?.user ?? null,
        session: session,
        loading: false,
      }));

      if (session?.user) {
        checkUserRole(session.user.id);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const checkUserRole = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user role:", error);
        setState(prev => ({
          ...prev,
          isAdmin: false,
          isTeamManager: false,
        }));
        return;
      }

      setState(prev => ({
        ...prev,
        isAdmin: data.role === "admin",
        isTeamManager: data.role === "team_manager",
      }));
    } catch (error) {
      console.error("Error checking user role:", error);
      setState(prev => ({
        ...prev,
        isAdmin: false,
        isTeamManager: false,
      }));
    }
  };

  const refreshProfile = async () => {
    if (state.user) {
      await checkUserRole(state.user.id);
    }
  };

  const value = {
    ...state,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    signUp: async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
      try {
        // Sign up the user
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (!data.user) {
          return { success: false, error: "User creation failed" };
        }

        // Create a profile for the user
        const { error: profileError } = await supabase.from("profiles").insert({
          user_id: data.user.id,
          email: email,
          full_name: fullName,
          role: "user",
          created_at: new Date().toISOString(),
        });

        if (profileError) {
          console.error("Error creating profile:", profileError);
          return { success: true, userId: data.user.id, error: "Account created but profile setup failed. Please contact support." };
        }

        return { success: true, userId: data.user.id };
      } catch (error: any) {
        console.error("Sign up error:", error);
        return { success: false, error: error.message || "An unexpected error occurred" };
      }
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Sign out error:", error);
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
      }
    },
    signInWithGoogle: async () => {
      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    },
    signInWithFacebook: async () => {
      await supabase.auth.signInWithOAuth({
        provider: "facebook",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    },
    signInWithTwitter: async () => {
      await supabase.auth.signInWithOAuth({
        provider: "twitter",
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
    },
    refreshProfile,
  };

  // Show loading state
  if (state.loading) {
    return <div>Loading auth...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}