import React, { createContext, useState, useEffect, useContext, ReactNode } from "react";
import { supabase } from "@/lib/supabase";

interface AuthState {
  user: any | null;
  session: any | null;
  isAdmin: boolean;
  isTeamManager: boolean;
  isLoading: boolean;
  teamId: string | null;
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
    isLoading: false,
    teamId: null,
  });

  useEffect(() => {
    // For demo purposes, let's create a mock user
    const mockUser = {
      id: '123',
      email: 'demo@example.com',
      user_metadata: {
        full_name: 'Demo User'
      }
    };
    
    setState(prev => ({
      ...prev,
      user: mockUser,
      isLoading: false
    }));
  }, []);

  const refreshProfile = async () => {
    // Mock implementation
    console.log("Refreshing profile...");
  };

  const value = {
    ...state,
    signIn: async (email: string, password: string) => {
      console.log("Sign in with", email, password);
    },
    signUp: async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string; userId?: string }> => {
      console.log("Sign up with", email, password, fullName);
      return { success: true, userId: '123' };
    },
    signOut: async () => {
      console.log("Sign out");
    },
    signInWithGoogle: async () => {
      console.log("Sign in with Google");
    },
    signInWithFacebook: async () => {
      console.log("Sign in with Facebook");
    },
    signInWithTwitter: async () => {
      console.log("Sign in with Twitter");
    },
    refreshProfile,
  };

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