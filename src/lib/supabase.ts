
import { createClient } from '@supabase/supabase-js';
import { AppRole } from '@/types/auth';

// Replace these with your Supabase project URL and anon key
// These are safe to expose in the client
const supabaseUrl = 'https://lqdvtghdufzwrtuszuhr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxZHZ0Z2hkdWZ6d3J0dXN6dWhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE1NTQ2MDYsImV4cCI6MjA1NzEzMDYwNn0.BBPiOdTjXE2ArG6yttLkcmeK9VVirdyD0NTi7HxcDVQ';

// Check if credentials are valid
const isMissingCredentials = !supabaseUrl || !supabaseAnonKey;

if (isMissingCredentials) {
  console.warn('Missing Supabase credentials. Authentication features will not work until you add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Function to check if a user has a specific role
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  if (isMissingCredentials) return false;
  
  const { data, error } = await supabase.rpc('has_role', {
    _user_id: userId,
    _role: role
  });
  
  if (error) {
    console.error('Error checking role:', error);
    return false;
  }
  
  return data || false;
};

// Function to get all roles for a user
export const getUserRoles = async (userId: string): Promise<AppRole[]> => {
  if (isMissingCredentials) return [];
  
  const { data, error } = await supabase.rpc('get_user_roles', {
    _user_id: userId
  });
  
  if (error) {
    console.error('Error getting user roles:', error);
    return [];
  }
  
  return data || [];
};

// Function to make a user an admin (only existing admins should be able to call this)
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  if (isMissingCredentials) return false;
  
  const { error } = await supabase
    .from('user_roles')
    .insert({ user_id: userId, role: 'admin' })
    .throwOnError();
  
  if (error) {
    console.error('Error making user admin:', error);
    return false;
  }
  
  return true;
};
