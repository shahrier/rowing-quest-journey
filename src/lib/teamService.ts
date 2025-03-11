
import { supabase } from "@/lib/supabase";
import { Team, TeamMembership, Journey, TeamWithMembers, TeamWithJourney } from "@/types/team";

// Get current user's teams
export const getUserTeams = async (): Promise<Team[]> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_memberships!inner(user_id)
    `)
    .eq('team_memberships.user_id', supabase.auth.getSession().then(({ data }) => data.session?.user.id));
    
  if (error) {
    throw error;
  }
  
  return data || [];
};

// Get a team by ID with all its members
export const getTeamWithMembers = async (teamId: string): Promise<TeamWithMembers | null> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      team_memberships(
        id, 
        role,
        user_id,
        profiles:user_id(id, full_name, email, avatar_url)
      )
    `)
    .eq('id', teamId)
    .single();
    
  if (error) {
    throw error;
  }
  
  if (!data) return null;
  
  // Format the members array
  const members = data.team_memberships.map((membership: any) => ({
    id: membership.profiles.id,
    name: membership.profiles.full_name || 'Anonymous User',
    email: membership.profiles.email,
    avatar: membership.profiles.avatar_url,
    role: membership.role
  }));
  
  return {
    ...data,
    members
  };
};

// Get a team with its journey
export const getTeamJourney = async (teamId: string): Promise<TeamWithJourney | null> => {
  const { data, error } = await supabase
    .from('teams')
    .select(`
      *,
      journeys(*)
    `)
    .eq('id', teamId)
    .single();
    
  if (error) {
    throw error;
  }
  
  if (!data) return null;
  
  return {
    ...data,
    journey: data.journeys[0]
  };
};

// Create a new team
export const createTeam = async (name: string): Promise<Team> => {
  const { data, error } = await supabase
    .from('teams')
    .insert({ name })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  // Add the current user as a manager
  const userId = (await supabase.auth.getSession()).data.session?.user.id;
  
  if (userId) {
    await supabase
      .from('team_memberships')
      .insert({
        team_id: data.id,
        user_id: userId,
        role: 'manager'
      });
  }
  
  return data;
};

// Create a journey for a team
export const createJourney = async (
  teamId: string, 
  name: string, 
  startLocation: string, 
  endLocation: string, 
  distanceKm: number
): Promise<Journey> => {
  const { data, error } = await supabase
    .from('journeys')
    .insert({
      team_id: teamId,
      name,
      start_location: startLocation,
      end_location: endLocation,
      distance_km: distanceKm
    })
    .select()
    .single();
    
  if (error) {
    throw error;
  }
  
  return data;
};

// Add a member to a team
export const addTeamMember = async (teamId: string, email: string, role: 'manager' | 'member' = 'member'): Promise<boolean> => {
  // First find the user by email
  const { data: user, error: userError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', email)
    .single();
    
  if (userError || !user) {
    throw new Error('User not found with that email');
  }
  
  // Check if the user is already a member
  const { data: existingMembership, error: membershipError } = await supabase
    .from('team_memberships')
    .select('id')
    .match({ team_id: teamId, user_id: user.id });
    
  if (membershipError) {
    throw membershipError;
  }
  
  if (existingMembership && existingMembership.length > 0) {
    throw new Error('User is already a member of this team');
  }
  
  // Add the user to the team
  const { error: addError } = await supabase
    .from('team_memberships')
    .insert({
      team_id: teamId,
      user_id: user.id,
      role
    });
    
  if (addError) {
    throw addError;
  }
  
  return true;
};

// Remove a member from a team
export const removeTeamMember = async (teamId: string, userId: string): Promise<boolean> => {
  const { error } = await supabase
    .from('team_memberships')
    .delete()
    .match({ team_id: teamId, user_id: userId });
    
  if (error) {
    throw error;
  }
  
  return true;
};

// Update a team member's role
export const updateTeamMemberRole = async (teamId: string, userId: string, role: 'manager' | 'member'): Promise<boolean> => {
  const { error } = await supabase
    .from('team_memberships')
    .update({ role })
    .match({ team_id: teamId, user_id: userId });
    
  if (error) {
    throw error;
  }
  
  return true;
};

// Check if the current user is a manager of the team
export const isTeamManager = async (teamId: string): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('is_team_manager', { team_id: teamId });
    
  if (error) {
    throw error;
  }
  
  return data || false;
};
