import { createClient } from '@supabase/supabase-js';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

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
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify connection
export const verifySupabaseConnection = async () => {
  console.log("🔍 Verifying Supabase connection...");
  
  try {
    // Simple query to check connection
    const start = performance.now();
    const { data, error, status } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    const duration = performance.now() - start;
    
    if (error) {
      console.error("❌ Supabase connection failed:", {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        status
      });
      return {
        connected: false,
        error: error.message,
        status,
        duration
      };
    }
    
    console.log("✅ Supabase connection successful:", {
      status,
      duration: `${duration.toFixed(2)}ms`,
      data
    });
    
    return {
      connected: true,
      status,
      duration,
      data
    };
  } catch (error) {
    console.error("❌ Supabase connection error:", error);
    return {
      connected: false,
      error: error instanceof Error ? error.message : String(error),
      duration: 0
    };
  }
};

// Automatically verify connection in development mode
if (import.meta.env.DEV) {
  console.log("🔄 Scheduling Supabase connection verification");
  setTimeout(verifySupabaseConnection, 1000);
}