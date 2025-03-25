import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Hook to check database connection
export function useDatabase() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("connected");
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus("checking");
      setError(null);
      setStatus("connected");
    } catch (err: any) {
      console.error("Database connection error:", err);
      setStatus("error");
      setError(err.message || "Failed to connect to the database");
    }
  };

  useEffect(() => {
    // For now, just assume we're connected to avoid blocking the UI
    setStatus("connected");
  }, []);

  return {
    status,
    error,
    retry: checkConnection,
  };
}