import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Activity } from '@/lib/supabase-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

export function ActivityLogger() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [activityType, setActivityType] = useState<'rowing' | 'strength'>('rowing');
  const [distance, setDistance] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [durationSeconds, setDurationSeconds] = useState('');
  const [notes, setNotes] = useState('');

  const handleLogActivity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!durationMinutes && !durationSeconds) {
      toast({
        title: 'Error',
        description: 'Please enter activity duration',
        variant: 'destructive',
      });
      return;
    }

    if (activityType === 'rowing' && !distance) {
      toast({
        title: 'Error',
        description: 'Please enter rowing distance',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.team_id) {
        toast({
          title: 'Error',
          description: 'You must be part of a team to log activities',
          variant: 'destructive',
        });
        return;
      }

      // Create the activity
      const { error: activityError } = await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          team_id: profile.team_id,
          activity_type: activityType,
          distance: activityType === 'rowing' ? parseInt(distance) : null,
          duration: (parseInt(durationMinutes || '0') * 60) + parseInt(durationSeconds || '0'),
          notes: notes.trim() || null,
        });

      if (activityError) throw activityError;

      // Update team's total distance if it's a rowing activity
      if (activityType === 'rowing') {
        const { error: updateError } = await supabase.rpc('update_team_distance', {
          team_id: profile.team_id,
          distance_to_add: parseInt(distance)
        });

        if (updateError) throw updateError;
      }

      toast({
        title: 'Success',
        description: 'Activity logged successfully',
      });

      // Reset form
      setDistance('');
      setDurationMinutes('');
      setDurationSeconds('');
      setNotes('');
    } catch (error) {
      console.error('Error logging activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to log activity',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogActivity} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityType">Activity Type</Label>
            <Select 
              value={activityType} 
              onValueChange={(value) => setActivityType(value as 'rowing' | 'strength')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select activity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="rowing">Rowing</SelectItem>
                <SelectItem value="strength">Strength Training</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {activityType === 'rowing' && (
            <div className="space-y-2">
              <Label htmlFor="distance">Distance (meters)</Label>
              <Input
                id="distance"
                type="number"
                value={distance}
                onChange={(e) => setDistance(e.target.value)}
                placeholder="Enter distance in meters"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Duration</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <Input
                  type="number"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(e.target.value)}
                  placeholder="Minutes"
                  min="0"
                />
              </div>
              <div className="flex-1">
                <Input
                  type="number"
                  value={durationSeconds}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    if (val >= 60) {
                      setDurationSeconds('59');
                    } else {
                      setDurationSeconds(e.target.value);
                    }
                  }}
                  placeholder="Seconds"
                  min="0"
                  max="59"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter any notes about the activity"
            />
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Logging...' : 'Log Activity'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
