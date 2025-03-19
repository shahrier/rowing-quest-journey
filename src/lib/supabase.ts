import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log Supabase configuration (without exposing full keys)
console.log("🔌 Supabase configuration:", {
  urlDefined: !!supabaseUrl,
  keyDefined: !!supabaseAnonKey,
  urlPrefix: supabaseUrl ? supabaseUrl.substring(0, 10) + '...' : 'undefined',
  keyPrefix: supabaseAnonKey ? supabaseAnonKey.substring(0, 5) + '...' : 'undefined'
});

// Check for missing configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("❌ Missing Supabase configuration:", {
    urlMissing: !supabaseUrl,
    keyMissing: !supabaseAnonKey
  });
  throw new Error('Missing Supabase environment variables');
}

// Create client with retries
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'your-app-name' },
  },
  db: {
    schema: 'public',
  },
});

// Simple health check function
export async function checkHealth() {
  try {
    // Try auth first
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth check failed:', authError);
      return false;
    }

    // Call the check_connection function to verify the database connection
    const { data, error: dbError } = await supabase.rpc('check_connection');

    if (dbError) {
      console.error('Database check failed:', dbError);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Health check failed:', error);
    return false;
  }
}

// Connection status hook with retry logic
export function useDatabase() {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [error, setError] = useState<string | null>(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);

      const isHealthy = await checkHealth();
      
      if (isHealthy) {
        setStatus('connected');
      } else {
        setStatus('error');
        setError('Database connection failed');
      }
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  useEffect(() => {
    checkConnection();
  }, []);

  return {
    status,
    error,
    retry: checkConnection,
    isConnected: status === 'connected',
  };
}