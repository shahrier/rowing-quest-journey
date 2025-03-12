import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Users, Route, Dumbbell } from "lucide-react";
import { mockUsers } from "@/data/mockData";
import { getDataMode, getTeamTotalDistance } from "@/data/dataService";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

const TeamPage = () => {
  const [loading, setLoading] = useState(true);
  const [isUsingRealData, setIsUsingRealData] = useState(false);
  const [teamMembers, setTeamMembers] = useState<any[]>([]);
  const { user } = useAuth();
  const [teamStats, setTeamStats] = useState({
    totalDistance: 0,
    totalTrainings: 0,
    totalStrength: 0,
  });

  useEffect(() => {
    const fetchTeamData = async () => {
      try {
        // Use local mock data if not using real data
        setIsUsingRealData(getDataMode() === 'real');
        
        if (isUsingRealData && supabase) {
          // This would fetch real team members from Supabase
          const { data, error } = await supabase
            .from('team_members')
            .select('id, full_name, email, avatar_url')
            .order('full_name');
            
          if (error) {
            console.error('Error fetching team members:', error);
            setTeamMembers([]);
          } else {
            setTeamMembers(data || []);
          }
        } else {
          // Otherwise use mock data
          // Sort names alphabetically
          setTeamMembers(mockUsers.slice().sort((a, b) => a.name.localeCompare(b.name)));
        }
        
        // Set team stats
        setTeamStats({
          totalDistance: getTeamTotalDistance(),
          totalTrainings: 124,
          totalStrength: 5280,
        });
        
        setLoading(false);
      } catch (err) {
        console.error('Error in fetchTeamData:', err);
        setLoading(false);
      }
    };

    fetchTeamData();
  }, [isUsingRealData, supabase]);

  // Display team members - safely handle real vs mock data
  const renderTeamMembers = () => {
    return teamMembers.map((member, index) => {
      // For real data from Supabase
      if (isUsingRealData) {
        return (
          <div key={member.id} className="flex items-center space-x-4 py-3">
            <Avatar>
              <AvatarImage src={member.avatar_url || `/placeholder.svg`} />
              <AvatarFallback>{getInitials(member.full_name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{member.full_name}</p>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>
        );
      } 
      // For mock data
      else {
        return (
          <div key={member.id || index} className="flex items-center space-x-4 py-3">
            <Avatar>
              <AvatarImage src={member.avatar || `/placeholder.svg`} />
              <AvatarFallback>{getInitials(member.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{member.name}</p>
              <p className="text-sm text-muted-foreground truncate">{member.email}</p>
            </div>
          </div>
        );
      }
    });
  };

  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <div className="container py-6 space-y-6">
      <h1 className="text-3xl font-bold">Team</h1>
      
      <div className="grid gap-6 md:grid-cols-3">
        <StatsCard 
          title="Team Members" 
          value={teamMembers.length} 
          icon={Users}
          description="Active rowers in your team"
        />
        <StatsCard 
          title="Total Distance" 
          value={`${teamStats.totalDistance.toLocaleString()} km`} 
          icon={Route}
          description="Combined distance rowed"
        />
        <StatsCard 
          title="Strength Training" 
          value={`${teamStats.totalStrength.toLocaleString()} kg`} 
          icon={Dumbbell}
          description="Total weight lifted"
        />
      </div>
      
      <Tabs defaultValue="members">
        <TabsList>
          <TabsTrigger value="members">Team Members</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>
        <TabsContent value="members">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>
                {isUsingRealData 
                  ? "Showing actual team members" 
                  : "Showing demonstration data"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <div className="divide-y">
                  {renderTeamMembers()}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle>Leaderboard</CardTitle>
              <CardDescription>
                Top performers in your team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Leaderboard functionality coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TeamPage;
