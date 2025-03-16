// This is a script to set up the admin user
// You would run this script manually or as part of your deployment process

import { createClient } from '@supabase/supabase-js';

// Replace with your Supabase URL and service role key (not anon key)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  const adminEmail = 'shahrier@gmail.com';
  
  try {
    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', adminEmail)
      .single();
      
    if (userError && userError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's expected if user doesn't exist
      throw userError;
    }
    
    if (user) {
      // Update existing user to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: 'admin' })
        .eq('email', adminEmail);
        
      if (updateError) throw updateError;
      
      console.log(`User ${adminEmail} has been updated to admin role`);
    } else {
      console.log(`User ${adminEmail} not found. They need to register first.`);
    }
  } catch (error) {
    console.error('Error setting up admin:', error);
  }
}

setupAdmin();