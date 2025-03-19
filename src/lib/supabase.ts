import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use environment variables for Supabase URL and key
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lqdvtghdufzwrtuszuhr.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHZ0Z2hkdWZ6d3J0dXN6dWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTQ2MDYsImV4cCI6MjA1NzEzMDYwNn0.BBPiOdTjXE2ArG6yttLkcmeK9VVirdyD0NTi7HxcDVQ';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);