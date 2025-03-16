import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { MapPin, Flag, Navigation } from 'lucide-react';
import { JourneyMap } from './JourneyMap';

interface Checkpoint {
  id: string;
  name: string;
  description: string | null;
  distance_from_start: number;
  latitude: number;
  longitude: number;
  is_reached: boolean;
  reached_at: string | null;
}

interface Team {
  id: string;
  name: string;
  journey_name: string;
  start_location: string;
  end_location: string;
  total_distance_km: number;
  current_distance_km: number;
}

export function JourneyProgress() {
  const { user, teamId } = useAuth();
  const [team, setTeam] = useState<Team | null>(null);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [nextCheckpoint, setNextCheckpoint] = useState<Checkpoint | null>(null);
  const [completionPercentage, setCompletionPercentage] = useState(0);
  const [distanceToNext, setDistanceToNext] = useState(0);

  useEffect(() => {
    if (user && teamId) {
      fetchTeamData();
      fetchCheckpoints();
    } else {
      setIsLoading(false);
    }
  }, [user, teamId]);

  const fetchTeamData = async () => {
    try {
      const { data, error } = await supabase
        .from('teams')
        .select('*')
        .eq('id', teamId)
        .single();

      if (error) throw error;
      setTeam(data);
      
      if (data) {
        const percentage = Math.min(100, Math.round((data.current_distance_km / data.total_distance_km) * 100));
        setCompletionPercentage(percentage);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    }
  };

  const fetchCheckpoints = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('journey_checkpoints')
        .select('*')
        .eq('team_id', teamId)
        .order('distance_from_start', { ascending: true });

      if (error) throw error;
      
      setCheckpoints(data || []);
      
      // Find the next checkpoint
      if (data && team) {
        const next = data.find(cp => cp.distance_from_start > team.current_distance_km);
        if (next) {
          setNextCheckpoint(next);
          setDistanceToNext(Math.round(next.distance_from_start - team.current_distance_km));
        }
      }
    } catch (error) {
      console.error('Error fetching checkpoints:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div>Loading journey progress...</div>;
  }

  if (!team || !teamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Journey Progress</CardTitle>
          <CardDescription>
            Join a team to track your rowing journey
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>You need to be part of a team to view journey progress.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{team.journey_name}</CardTitle>
        <CardDescription>
          From {team.start_location} to {team.end_location}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-1" />
              <span>{team.start_location}</span>
            </div>
            <span>{completionPercentage}% complete</span>
            <div className="flex items-center">
              <span>{team.end_location}</span>
              <Flag className="h-4 w-4 ml-1" />
            </div>
          </div>
          <Progress value={completionPercentage} className="h-2" />
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>0 km</span>
            <span>{team.current_distance_km.toLocaleString()} km</span>
            <span>{team.total_distance_km.toLocaleString()} km</span>
          </div>
        </div>
        
        {nextCheckpoint && (
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <div className="bg-primary text-primary-foreground p-2 rounded-full">
                <Navigation className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-medium">Next Checkpoint: {nextCheckpoint.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {nextCheckpoint.description || `Approaching ${nextCheckpoint.name}`}
                </p>
                <p className="text-sm font-medium mt-2">
                  {distanceToNext.toLocaleString()} km to go
                </p>
              </div>
            </div>
          </div>
        )}
        
        <JourneyMap 
          checkpoints={checkpoints} 
          currentDistance={team.current_distance_km} 
          totalDistance={team.total_distance_km}
        />
        
        <div className="space-y-2">
          <h3 className="font-medium">Checkpoints</h3>
          <div className="space-y-3">
            {checkpoints.map((checkpoint, index) => {
              const isReached = team.current_distance_km >= checkpoint.distance_from_start;
              const isCurrent = nextCheckpoint?.id === checkpoint.id;
              
              return (
                <div 
                  key={checkpoint.id}
                  className={`flex items-center gap-3 p-2 rounded-md ${
                    isReached 
                      ? 'bg-green-50 dark:bg-green-950' 
                      : isCurrent 
                      ? 'bg-blue-50 dark:bg-blue-950' 
                      : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isReached 
                      ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' 
                      : 'bg-gray-100 text-gray-500 dark:bg-gray-800'
                  }`}>
                    {index + 1}
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span className="font-medium">{checkpoint.name}</span>
                      <span className="text-sm text-muted-foreground">
                        {checkpoint.distance_from_start} km
                      </span>
                    </div>
                    {isReached && checkpoint.reached_at && (
                      <div className="text-xs text-green-600 dark:text-green-400">
                        Reached on {new Date(checkpoint.reached_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}