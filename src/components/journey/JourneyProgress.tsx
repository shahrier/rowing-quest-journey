import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Team } from '@/lib/supabase-types';

// Distance from Boston to Amsterdam in meters
const TOTAL_DISTANCE = 5_556_000; // 5,556 km in meters

// Major milestones along the journey
const MILESTONES = [
  { name: 'Boston', distance: 0 },
  { name: 'Halifax', distance: 800_000 }, // 800 km
  { name: 'Mid-Atlantic', distance: 2_778_000 }, // Halfway point
  { name: 'Ireland', distance: 4_445_000 }, // 4,445 km
  { name: 'Amsterdam', distance: TOTAL_DISTANCE }
];

export function JourneyProgress() {
  const { user } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeamProgress = async () => {
      try {
        // Get user's team
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('team_id')
          .eq('user_id', user?.id)
          .single();

        if (profileError) throw profileError;

        if (profile.team_id) {
          const { data: teamData, error: teamError } = await supabase
            .from('teams')
            .select('*')
            .eq('id', profile.team_id)
            .single();

          if (teamError) throw teamError;
          setTeam(teamData);
        }
      } catch (error) {
        console.error('Error fetching team progress:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchTeamProgress();
    }

    // Subscribe to team updates
    const teamSubscription = supabase
      .channel('team_updates')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'teams',
          filter: `id=eq.${team?.id}`
        },
        (payload) => {
          setTeam(payload.new as Team);
        }
      )
      .subscribe();

    return () => {
      teamSubscription.unsubscribe();
    };
  }, [user]);

  if (isLoading) {
    return <div>Loading journey progress...</div>;
  }

  if (!team) {
    return <div>Join a team to track journey progress</div>;
  }

  const progressPercentage = (team.current_distance / TOTAL_DISTANCE) * 100;
  const currentMilestone = MILESTONES.reduce((prev, curr) => {
    return team.current_distance >= curr.distance ? curr : prev;
  });
  
  const nextMilestone = MILESTONES.find(m => m.distance > team.current_distance) || MILESTONES[MILESTONES.length - 1];
  const distanceToNextMilestone = nextMilestone.distance - team.current_distance;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Journey to Amsterdam</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative pt-8">
          <Progress value={progressPercentage} className="h-4" />
          
          {/* Milestone markers */}
          {MILESTONES.map((milestone) => {
            const markerPosition = (milestone.distance / TOTAL_DISTANCE) * 100;
            return (
              <div
                key={milestone.name}
                className="absolute -top-6"
                style={{ left: `${markerPosition}%` }}
              >
                <div className="h-4 w-0.5 bg-gray-400 mb-1" />
                <span className="text-xs text-gray-600 -ml-8 whitespace-nowrap">
                  {milestone.name}
                </span>
              </div>
            );
          })}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Current Location: Near {currentMilestone.name}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          
          <div className="text-sm text-gray-600">
            Distance Covered: {(team.current_distance / 1000).toFixed(1)} km
          </div>
          
          <div className="text-sm text-gray-600">
            Distance to {nextMilestone.name}: {(distanceToNextMilestone / 1000).toFixed(1)} km
          </div>

          <div className="text-sm text-gray-600">
            Total Distance: {(TOTAL_DISTANCE / 1000).toFixed(1)} km
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
