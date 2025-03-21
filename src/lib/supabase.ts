import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

// Get environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log configuration status (without exposing keys)
console.log("Supabase configuration:", {
  urlConfigured: !!supabaseUrl,
  keyConfigured: !!supabaseAnonKey
});

// Check for missing configuration
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase configuration. Please check your environment variables.");
}

// Create client
export const supabase = createClient<Database>(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Verify database connection
export async function verifySupabaseConnection(): Promise<boolean> {
  try {
    if (!supabaseUrl || !supabaseAnonKey) return false;
    
    // Try a simple query
    const { error } = await supabase
      .from('profiles')
      .select('count', { count: 'exact', head: true });
    
    return !error;
  } catch (error) {
    console.error('Supabase connection error:', error);
    return false;
  }
}

// Get user profile
export async function getUserProfile(userId: string) {
  if (!userId) return null;
  
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
  
  return data;
}

// Update user profile
export async function updateUserProfile(userId: string, updates: any) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('user_id', userId);
  
  if (error) {
    console.error('Error updating profile:', error);
    return false;
  }
  
  return true;
}

// Get team data
export async function getTeamData(teamId: string) {
  if (!teamId) return null;
  
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();
  
  if (error) {
    console.error('Error fetching team data:', error);
    return null;
  }
  
  return data;
}

// Log activity
export async function logActivity(activity: any) {
  const { data, error } = await supabase
    .from('activities')
    .insert(activity);
  
  if (error) {
    console.error('Error logging activity:', error);
    return false;
  }
  
  return true;
}