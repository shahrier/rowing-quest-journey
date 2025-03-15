import { supabase } from './supabase';

export const setupAdminUser = async (email: string) => {
  try {
    // First, get the user ID from the email
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('user_id, role')
      .eq('email', email)
      .single();

    if (userError) {
      console.error('Error finding user:', userError);
      return false;
    }

    if (!userData) {
      console.error('User not found');
      return false;
    }

    // If user is not already an admin, make them one
    if (userData.role !== 'admin') {
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('user_id', userData.user_id);

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
