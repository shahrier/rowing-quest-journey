
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// These are safe to expose in the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// For development without Supabase credentials
const isMissingCredentials = !supabaseUrl || !supabaseAnonKey;

if (isMissingCredentials) {
  console.warn('Missing Supabase credentials. Authentication features will not work until you add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

// Create a dummy client if credentials are missing (for development)
export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-key'
);

