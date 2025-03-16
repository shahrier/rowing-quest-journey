import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, LineChart, PieChart } from 'lucide-react';

export default function StatsPage() {
  const { user, teamId } = useAuth();
  const [personalStats, setPersonalStats] = useState({
    totalDistance: 0,
    weeklyDistance: 0,
    monthlyDistance: 0,
    strengthSessions: 0,
    averageSessionDuration: 0,
  });
  const [teamStats, setTeamStats] = useState({
    totalDistance: 0,
    memberCount: 0,
    averagePerMember: 0,
    topContributor: '',
    topContribution: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamManager, setIsTeamManager] = useState(false);

  useEffect(() => {
    if (user) {
      fetchPersonalStats();
      if (teamId) {
        fetchTeamStats();
      }
      fetchUserRole();
    }
  }, [user, teamId]);

  const fetchPersonalStats = async () => {
    try {
      // Get rowing activities
      const { data: rowingData, error: rowingError } = await supabase
        .from('activities')
        .select('distance, duration, created_at')
        .eq('user_id', user?.id)
        .eq('activity_type', 'rowing');
        
      if (rowingError) throw rowingError;
      
      // Calculate total distance
      const totalDistance = rowingData?.reduce((sum, activity) => {
        return sum + (activity.distance || 0);
      }, 0) || 0;
      
      // Calculate weekly distance (last 7 days)
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const weeklyDistance = rowingData?.reduce((sum, activity) => {
        const activityDate = new Date(activity.created_at);
        if (activityDate >= oneWeekAgo) {
          return sum + (activity.distance || 0);
        }
        return sum;
      }, 0) || 0;
      
      // Calculate monthly distance (last 30 days)
      const oneMonthAgo = new Date();
      oneMonthAgo.setDate(oneMonthAgo.getDate() - 30);
      
      const monthlyDistance = rowingData?.reduce((sum, activity) => {
        const activityDate = new Date(activity.created_at);
        if (activityDate >= oneMonthAgo) {
          return sum + (activity.distance || 0);
        }
        return sum;
      }, 0) || 0;
      
      // Get strength sessions
      const { count: strengthCount, error: strengthError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true})
        .eq('user_id', user?.id)
        .eq('activity_type', 'strength');
        
      if (strengthError) throw strengthError;
      
      // Calculate average session duration
      const { data: durationData, error: durationError } = await supabase
        .from('activities')
        .select('duration')
        .eq('user_id', user?.id)
        .not('duration', 'is', null);
        
      if (durationError) throw durationError;
      
      const totalDuration = durationData?.reduce((sum, activity) => {
        return sum + (activity.duration || 0);
      }, 0) || 0;
      
      const averageSessionDuration = durationData?.length 
        ? Math.round(totalDuration / durationData.length) 
        : 0;
      
      setPersonalStats({
        totalDistance,
        weeklyDistance,
        monthlyDistance,
        strengthSessions: strengthCount || 0,
        averageSessionDuration,
      });
    } catch (error) {
      console.error('Error fetching personal stats:', error);
    }
  };

  const fetchTeamStats = async () => {
    try {
      // Get team members
      const { data: members, error: membersError } = await supabase
        .from('profiles')
        .select('user_id, full_name')
        .eq('team_id', teamId);
        
      if (membersError) throw membersError;
      
      // Get total team distance and top contributor
      let totalDistance = 0;
      let topContributor = '';
      let topContribution = 0;
      
      const memberStats = await Promise.all(members.map(async (member) => {
        const { data, error } = await supabase
          .from('activities')
          .select('distance')
          .eq('user_id', member.user_id)
          .eq('activity_type', 'rowing');
          
        if (error) throw error;
        
        const memberDistance = data?.reduce((sum, activity) => {
          return sum + (activity.distance || 0);
        }, 0) || 0;
        
        if (memberDistance > topContribution) {
          topContribution = memberDistance;
          topContributor = member.full_name;
        }
        
        totalDistance += memberDistance;
        
        return {
          name: member.full_name,
          distance: memberDistance,
        };
      }));
      
      setTeamStats({
        totalDistance,
        memberCount: members.length,
        averagePerMember: members.length ? Math.round(totalDistance / members.length) : 0,
        topContributor,
        topContribution,
      });
    } catch (error) {
      console.error('Error fetching team stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserRole = async () => {
    try {
      // Fetch user role from user_roles
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user role:', error);
        setIsAdmin(false);
        setIsTeamManager(false);
        return;
      }

      // Check if the role is valid
      if (!data || !data.role) {
        console.error('No role found for user:', user.id);
        setIsAdmin(false);
        setIsTeamManager(false);
        return;
      }

      // Set admin and team manager status
      const isAdmin = ['admin', 'team_manager'].includes(data.role);
      setIsAdmin(isAdmin);
      setIsTeamManager(data.role === 'team_manager');
      console.log('User role:', data.role, 'Is Admin:', isAdmin);
    } catch (error) {
      console.error('Error fetching user role:', error);
    }
  };

  if (isLoading && teamId) {
    return <div>Loading statistics...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistics</h1>
        <p className="text-muted-foreground">
          Track your rowing and training performance
        </p>
      </div>
      
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList>
          <TabsTrigger value="personal">
            <BarChart className="h-4 w-4 mr-2" />
            Personal Stats
          </TabsTrigger>
          <TabsTrigger value="team" disabled={!teamId}>
            <LineChart className="h-4 w-4 mr-2" />
            Team Stats
          </TabsTrigger>
          <TabsTrigger value="trends">
            <PieChart className="h-4 w-4 mr-2" />
            Trends
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats.totalDistance.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Lifetime rowing distance
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Weekly Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats.weeklyDistance.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Last 7 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Monthly Distance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats.monthlyDistance.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Last 30 days
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Strength Sessions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats.strengthSessions}</div>
                <p className="text-xs text-muted-foreground">
                  Total strength training sessions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Session</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{personalStats.averageSessionDuration} min</div>
                <p className="text-xs text-muted-foreground">
                  Average workout duration
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Distribution</CardTitle>
              <CardDescription>
                Your rowing and strength training over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Activity chart will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.totalDistance.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Combined team distance
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.memberCount}</div>
                <p className="text-xs text-muted-foreground">
                  Active rowers
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Average Per Member</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.averagePerMember.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Average distance per team member
                </p>
              </CardContent>
            </Card>
            
            <Card className="md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Top Contributor</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamStats.topContributor}</div>
                <p className="text-xs text-muted-foreground">
                  {teamStats.topContribution.toLocaleString()} meters rowed
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Team Progress</CardTitle>
              <CardDescription>
                Contribution breakdown by team member
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Team contribution chart will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Progress</CardTitle>
              <CardDescription>
                Your rowing distance over the past weeks
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Weekly trend chart will be displayed here
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Activity Breakdown</CardTitle>
              <CardDescription>
                Distribution of your training activities
              </CardDescription>
            </CardHeader>
            <CardContent className="h-[300px] flex items-center justify-center">
              <p className="text-muted-foreground">
                Activity breakdown chart will be displayed here
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}