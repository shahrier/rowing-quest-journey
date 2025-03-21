// This is a script to set up the admin user
// You would run this script manually or as part of your deployment process

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

// Replace with your Supabase URL and service role key (not anon key)
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables: SUPABASE_URL and/or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

async function setupAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || 'shahrier@gmail.com';
  
  if (!adminEmail) {
    console.error('Missing ADMIN_EMAIL environment variable');
    process.exit(1);
  }
  
  console.log(`Setting up admin user: ${adminEmail}`);
  
  try {
    // First check if the user exists in auth.users
    const { data: authUser, error: authError } = await supabase.auth.admin.getUserByEmail(adminEmail);
    
    if (authError) {
      console.error('Error fetching user from auth:', authError);
      process.exit(1);
    }
    
    if (!authUser || !authUser.user) {
      console.error(`User ${adminEmail} not found in auth. They need to register first.`);
      process.exit(1);
    }
    
    const userId = authUser.user.id;
    
    // Check if user exists in profiles table
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 is "no rows returned" - that's expected if profile doesn't exist
      console.error('Error fetching profile:', profileError);
      process.exit(1);
    }
    
    if (profile) {
      // Update existing profile to admin
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          role: 'admin',
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);
        
      if (updateError) {
        console.error('Error updating profile:', updateError);
        process.exit(1);
      }
      
      console.log(`✅ User ${adminEmail} has been updated to admin role`);
    } else {
      // Create new profile with admin role
      const { error: insertError } = await supabase
        .from('profiles')
        .insert({
          user_id: userId,
          email: adminEmail,
          full_name: authUser.user.user_metadata?.full_name || 'Admin User',
          role: 'admin',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        
      if (insertError) {
        console.error('Error creating profile:', insertError);
        process.exit(1);
      }
      
      console.log(`✅ Created new profile for ${adminEmail} with admin role`);
    }
    
    console.log('Admin setup completed successfully');
  } catch (error) {
    console.error('Unexpected error setting up admin:', error);
    process.exit(1);
  }
}

setupAdmin();