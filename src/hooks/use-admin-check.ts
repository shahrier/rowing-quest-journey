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
          
          // Check current role
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('user_id', user.id)
            .single();
            
          if (error) throw error;
          
          console.log('Current role:', data.role);
          
          if (data.role !== 'admin') {
            // Update to admin role
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ role: 'admin' })
              .eq('user_id', user.id);
              
            if (updateError) throw updateError;
            
            console.log('Updated to admin role');
            
            toast({
              title: 'Admin Access Granted',
              description: 'Your account has been updated with admin privileges. Please refresh the page.',
            });
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
        }
      }
    };
    
    checkAdminStatus();
  }, [user, isAdmin]);
}