import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Ship, Award, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Dashboard() {
  const { user } = useAuth();
  const [teamName, setTeamName] = useState<string | null>(null);
  const [totalDistance, setTotalDistance] = useState(0);
  const [teamMembers, setTeamMembers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        
        // Get user's team info
        const { data: profileData } = await supabase
          .from("profiles")
          .select("team_id")
          .eq("user_id", user.id)
          .single();
          
        if (profileData?.team_id) {
          // Get team name
          const { data: teamData } = await supabase
            .from("teams")
            .select("name")
            .eq("id", profileData.team_id)
            .single();
            
          if (teamData) {
            setTeamName(teamData.name);
          }
          
          // Count team members
          const { count } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("team_id", profileData.team_id);
            
          setTeamMembers(count || 0);
          
          // Get total distance for team
          const { data: distanceData } = await supabase
            .from("activities")
            .select("distance")
            .eq("team_id", profileData.team_id);
            
          if (distanceData) {
            const total = distanceData.reduce((sum, activity) => sum + (activity.distance || 0), 0);
            setTotalDistance(total);
          }
        }
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to RowQuest, {user?.user_metadata?.full_name || 'Rower'}!
        </p>
      </div>

      {!teamName ? (
        <Card>
          <CardHeader>
            <CardTitle>Join a Team</CardTitle>
            <CardDescription>
              You're not part of any team yet. Join a team to start tracking your rowing journey.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/team">
                Find a Team
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Distance
                </CardTitle>
                <Ship className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDistance.toLocaleString()} m</div>
                <p className="text-xs text-muted-foreground">
                  Team's total rowing distance
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team Members
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamMembers}</div>
                <p className="text-xs text-muted-foreground">
                  Active rowers in your team
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Team
                </CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{teamName}</div>
                <p className="text-xs text-muted-foreground">
                  Your current team
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Log Activity</CardTitle>
                <CardDescription>
                  Record your rowing sessions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full">
                  <Ship className="mr-2 h-4 w-4" />
                  Log Rowing Session
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Team Progress</CardTitle>
                <CardDescription>
                  View your team's journey
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/team">
                    <Users className="mr-2 h-4 w-4" />
                    View Team
                  </Link>
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Your Profile</CardTitle>
                <CardDescription>
                  View and edit your profile
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="outline" className="w-full" asChild>
                  <Link to="/profile">
                    <ArrowRight className="mr-2 h-4 w-4" />
                    Go to Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}