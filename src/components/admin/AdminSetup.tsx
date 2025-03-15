import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { setupAdminUser } from '@/lib/admin-utils';
import { useAuth } from '@/hooks/use-auth';

export function AdminSetup() {
  const [email, setEmail] = useState('');
  const { toast } = useToast();
  const { refreshProfile } = useAuth();

  const handleSetupAdmin = async () => {
    if (!email) {
      toast({
        title: 'Email required',
        description: 'Please enter your email address.',
        variant: 'destructive',
      });
      return;
    }

    const success = await setupAdminUser(email);
    
    if (success) {
      toast({
        title: 'Success',
        description: 'Admin role has been set up. Please sign out and sign back in.',
      });
      // Refresh the user's profile to get the new role
      await refreshProfile();
    } else {
      toast({
        title: 'Error',
        description: 'Failed to set up admin role. Please check the console for details.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-lg font-semibold">Admin Setup (Development Only)</h2>
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <Button onClick={handleSetupAdmin}>
          Make Admin
        </Button>
      </div>
    </div>
  );
}
