import { supabase } from './supabase';

export const setupAdminUser = async (email: string) => {
  try {
    // First, get the user from auth
    const { data: authData, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('Error getting auth user:', authError);
      return false;
    }

    if (!authData.user) {
      console.error('No authenticated user found');
      return false;
    }

    // Check if user exists in profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', authData.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error checking profile:', profileError);
      return false;
    }

    if (!profileData) {
      // Create profile if it doesn't exist
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user.id,
          email: email,
          full_name: authData.user.user_metadata?.full_name || email.split('@')[0],
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Error creating profile:', insertError);
        return false;
      }
    } else if (profileData.role !== 'admin') {
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', authData.user.id);

      if (updateError) {
        console.error('Error updating role:', updateError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Error in setupAdminUser:', error);
    return false;
  }
};