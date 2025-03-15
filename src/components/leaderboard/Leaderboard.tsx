
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Award, Dumbbell, Timer } from 'lucide-react';

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_distance: number;
  strength_sessions: number;
  badge_count: number;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Get user's team
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('team_id')
          .eq('user_id', user?.id)
          .single();

        if (profileError) throw profileError;

        if (profile.team_id) {
          // Get team members' stats
          const { data, error } = await supabase
            .from('profiles')
            .select(`
              id,
              user_id,
              full_name,
              (
                SELECT COALESCE(SUM(distance), 0)
                FROM activities
                WHERE activities.user_id = profiles.user_id
                AND activity_type = 'rowing'
              ) as total_distance,
              (
                SELECT COUNT(*)
                FROM activities
                WHERE activities.user_id = profiles.user_id
                AND activity_type = 'strength'
              ) as strength_sessions,
              (
                SELECT COUNT(*)
                FROM user_badges
                WHERE user_badges.user_id = profiles.user_id
              ) as badge_count
            `)
            .eq('team_id', profile.team_id)
            .order('total_distance', { ascending: false });

          if (error) throw error;
          setLeaderboardData(data);
        }
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeaderboardData();
    }
  }, [user]);

  if (isLoading) {
    return <div>Loading leaderboard...</div>;
  }

  if (!leaderboardData.length) {
    return <div>Join a team to view leaderboard</div>;
  }

  const renderLeaderboardRow = (entry: LeaderboardEntry, index: number) => (
    <div
      key={entry.user_id}
      className={`flex items-center justify-between p-3 ${
        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
      } ${entry.user_id === user?.id ? 'border-l-4 border-primary' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <span className="font-medium w-8">{index + 1}</span>
        <span>{entry.full_name}</span>
      </div>
      <div className="flex items-center space-x-2">
        {entry.badge_count > 0 && (
          <Badge variant="secondary">
            <Award className="w-4 h-4 mr-1" />
            {entry.badge_count}
          </Badge>
        )}
        <span className="text-gray-600">{entry.total_distance}m</span>
      </div>
    </div>
  );

  const renderStrengthLeaderboardRow = (entry: LeaderboardEntry, index: number) => (
    <div
      key={entry.user_id}
      className={`flex items-center justify-between p-3 ${
        index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
      } ${entry.user_id === user?.id ? 'border-l-4 border-primary' : ''}`}
    >
      <div className="flex items-center space-x-3">
        <span className="font-medium w-8">{index + 1}</span>
        <span>{entry.full_name}</span>
      </div>
      <div className="flex items-center space-x-2">
        {entry.badge_count > 0 && (
          <Badge variant="secondary">
            <Award className="w-4 h-4 mr-1" />
            {entry.badge_count}
          </Badge>
        )}
        <span className="text-gray-600">{entry.strength_sessions} sessions</span>
      </div>
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rowing">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rowing">
              <Timer className="w-4 h-4 mr-2" />
              Rowing Distance
            </TabsTrigger>
            <TabsTrigger value="strength">
              <Dumbbell className="w-4 h-4 mr-2" />
              Strength Training
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rowing" className="mt-4">
            <div className="rounded-md border">
              {[...leaderboardData]
                .sort((a, b) => b.total_distance - a.total_distance)
                .map(renderLeaderboardRow)}
            </div>
          </TabsContent>
          
          <TabsContent value="strength" className="mt-4">
            <div className="rounded-md border">
              {[...leaderboardData]
                .sort((a, b) => b.strength_sessions - a.strength_sessions)
                .map(renderStrengthLeaderboardRow)}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
