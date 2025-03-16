import { useEffect } from 'react';
import { useAuth } from './use-auth';
import { supabase } from '@/lib/supabase';
import { useToast } from './use-toast';

export function useAdminCheck() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (user && user.email === 'shahrier@gmail.com' && !isAdmin) {
        try {
          console.log('Checking admin status for shahrier@gmail.com');
          
          // First check if profile exists
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', user.id)
            .single();
            
          if (profileError && profileError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
            console.error('Error checking profile:', profileError);
            return;
          }

          if (!profileData) {
            // Create profile if it doesn't exist
            const { error: insertError } = await supabase
              .from('profiles')
              .insert({
                user_id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                role: 'admin',
                created_at: new Date().toISOString()
              });

            if (insertError) {
              console.error('Error creating profile:', insertError);
              return;
            }
          } else if (profileData.role !== 'admin') {
            // Update existing profile to admin
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ 
                role: 'admin',
                updated_at: new Date().toISOString()
              })
              .eq('user_id', user.id);
              
            if (updateError) {
              console.error('Error updating role:', updateError);
              return;
            }
          }
          
          console.log('Admin role set successfully');
          
          toast({
            title: 'Admin Access Granted',
            description: 'Your account has been updated with admin privileges. Please refresh the page.',
          });
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, [user, isAdmin]);
}