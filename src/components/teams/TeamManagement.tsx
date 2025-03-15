import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Team } from '@/lib/supabase-types';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

export function TeamManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const BOSTON_TO_AMSTERDAM = 5_556_000; // 5,556 km in meters
  const [isLoading, setIsLoading] = useState(false);

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a team name',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      // Create the team
      const { data: team, error: teamError } = await supabase
        .from('teams')
        .insert({
          name: teamName,
          description,
          goal_distance: BOSTON_TO_AMSTERDAM,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      // Update the user's profile with the team_id and role
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          team_id: team.id,
          role: 'team_manager',
        })
        .eq('user_id', user?.id);

      if (profileError) throw profileError;

      toast({
        title: 'Success',
        description: 'Team created successfully',
      });

      // Reset form
      setTeamName('');
      setDescription('');

    } catch (error) {
      console.error('Error creating team:', error);
      toast({
        title: 'Error',
        description: 'Failed to create team',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Team</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateTeam} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="teamName">Team Name</Label>
            <Input
              id="teamName"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter team description"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="goalDistance">Goal Distance</Label>
            <div className="text-sm text-gray-600">
              Boston to Amsterdam: {(BOSTON_TO_AMSTERDAM / 1000).toFixed(0)} km
            </div>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Team'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
