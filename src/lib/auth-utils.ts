import { supabase } from './supabase';
import { AppRole } from '@/types/auth';

// Function to check if a user has a specific role
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  if (!userId) return false;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return profile?.role === role;
};

// Function to get user's role
export const getUserRole = async (userId: string): Promise<AppRole | null> => {
  if (!userId) return null;
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('user_id', userId)
    .single();
  
  return profile?.role || null;
};

// Function to make a user an admin (only existing admins should be able to call this)
export const makeUserAdmin = async (userId: string): Promise<boolean> => {
  if (!userId) return false;
  
  const { error } = await supabase
    .from('profiles')
    .update({ role: 'admin' })
    .eq('user_id', userId);
  
  return !error;
};

// Function to assign user to a team
export const assignUserToTeam = async (userId: string, teamId: string): Promise<boolean> => {
  if (!userId || !teamId) return false;
  
  const { error } = await supabase
    .from('profiles')
    .update({ team_id: teamId })
    .eq('user_id', userId);
  
  return !error;
};

// Function to create a new team
export const createTeam = async (name: string, description?: string): Promise<string | null> => {
  const { data, error } = await supabase
    .from('teams')
    .insert({
      name,
      description,
      current_distance: 0,
      goal_distance: 5556000 // Boston to Amsterdam in meters
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error creating team:', error);
    return null;
  }
  
  return data.id;
};
