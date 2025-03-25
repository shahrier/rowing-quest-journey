import { createClient } from "@supabase/supabase-js";
import { useState, useEffect } from "react";

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    "Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in your .env file."
  );
}

export const supabase = createClient(
  supabaseUrl || "",
  supabaseAnonKey || ""
);

// Hook to check database connection
export function useDatabase() {
  const [status, setStatus] = useState<"checking" | "connected" | "error">("checking");
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus("checking");
      setError(null);

      // Simple query to check if we can connect
      const { error } = await supabase.from("profiles").select("count", { count: "exact", head: true });

      if (error) {
        throw error;
      }

      setStatus("connected");
    } catch (err: any) {
      console.error("Database connection error:", err);
      setStatus("error");
      setError(err.message || "Failed to connect to the database");
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    status,
    error,
    retry: checkConnection,
  };
}