
import { createClient } from '@supabase/supabase-js';

// Replace these with your Supabase project URL and anon key
// These are safe to expose in the client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
