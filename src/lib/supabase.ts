import { createClient } from '@supabase/supabase-js';
import { useState, useEffect } from 'react';
import type { Database } from '@/integrations/supabase/types';

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

// Create client with proper typing
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: { 'x-application-name': 'rowing-quest-journey' },
  },
  db: {
    schema: 'public',
  },
});

// Verify database connection
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    // Try a simple query that should always work if connected
    // Using a simple select count query instead of RPC to avoid potential issues
    const { data, error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    if (error) {
      console.error('Supabase connection verification failed:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Simple health check function
export async function checkHealth() {
  try {
    // Try auth first
    const { data: authData, error: authError } = await supabase.auth.getSession();
    if (authError) {
      console.error('Auth check failed:', authError);
      return false;
    }

    // Simple query to verify database connection
    const { data, error: dbError } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });

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
  const [connectionDetails, setConnectionDetails] = useState<any>(null);

  const checkConnection = async () => {
    try {
      setStatus('checking');
      setError(null);

      const startTime = performance.now();
      const isHealthy = await verifySupabaseConnection();
      const endTime = performance.now();
      
      const details = {
        timestamp: new Date().toISOString(),
        responseTime: Math.round(endTime - startTime),
        supabaseUrl: supabaseUrl?.replace(/^(https?:\/\/[^\/]+).*$/, '$1') || 'unknown',
        authConfigured: !!supabaseAnonKey,
      };
      
      setConnectionDetails(details);
      
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
    
    // Set up periodic health checks
    const intervalId = setInterval(() => {
      verifySupabaseConnection().then(isHealthy => {
        if (!isHealthy && status === 'connected') {
          console.warn('Database connection lost, reconnecting...');
          checkConnection();
        }
      });
    }, 30000); // Check every 30 seconds
    
    return () => clearInterval(intervalId);
  }, []);

  return {
    status,
    error,
    retry: checkConnection,
    isConnected: status === 'connected',
    connectionDetails
  };
}