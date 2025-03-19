import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TeamManagement } from "@/components/teams/TeamManagement";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { MediaUpload } from "@/components/media/MediaUpload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Trophy, Image } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function TeamPage() {
  const { user, teamId } = useAuth();
  const { toast } = useToast();
  const [hasTeam, setHasTeam] = useState<boolean | null>(null);
  const [availableTeams, setAvailableTeams] = useState<
    { id: string; name: string }[]
  >([]);
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [isJoining, setIsJoining] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamManager, setIsTeamManager] = useState(false);

  useEffect(() => {
    setHasTeam(!!teamId);
    if (!teamId) {
      fetchAvailableTeams();
    }
    fetchUserRole();
  }, [teamId]);

  const fetchAvailableTeams = async () => {
    try {
      const { data, error } = await supabase.from("teams").select("id, name");

      if (error) throw error;
      setAvailableTeams(data || []);
    } catch (error) {
      console.error("Error fetching teams:", error);
    }
  };

  const fetchUserRole = async () => {
    // Fetch user role from user_roles
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user role:", error);
      setIsAdmin(false);
      setIsTeamManager(false);
      return;
    }

    // Check if the role is valid
    if (!data || !data.role) {
      console.error("No role found for user:", user.id);
      setIsAdmin(false);
      setIsTeamManager(false);
      return;
    }

    // Set admin and team manager status
    const isAdmin = ["admin", "team_manager"].includes(data.role);
    setIsAdmin(isAdmin);
    setIsTeamManager(data.role === "team_manager");
    console.log("User role:", data.role, "Is Admin:", isAdmin);
  };

  const handleJoinTeam = async () => {
    if (!selectedTeam) {
      toast({
        title: "No team selected",
        description: "Please select a team to join",
        variant: "destructive",
      });
      return;
    }

    setIsJoining(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ team_id: selectedTeam })
        .eq("user_id", user?.id);

      if (error) throw error;

      toast({
        title: "Team joined",
        description: "You have successfully joined the team",
      });

      // Refresh page to update team status
      window.location.reload();
    } catch (error) {
      console.error("Error joining team:", error);
      toast({
        title: "Error",
        description: "Failed to join team",
        variant: "destructive",
      });
    } finally {
      setIsJoining(false);
    }
  };

  if (hasTeam === false) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Join a Team</h1>
          <p className="text-muted-foreground">
            Join an existing team to start tracking your rowing journey
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Available Teams</CardTitle>
            <CardDescription>
              Select a team to join and start contributing to their journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {availableTeams.length === 0 ? (
                <p>No teams available to join. Please check back later.</p>
              ) : (
                <>
                  <div className="space-y-2">
                    <label
                      htmlFor="team-select"
                      className="text-sm font-medium"
                    >
                      Select Team
                    </label>
                    <select
                      id="team-select"
                      value={selectedTeam}
                      onChange={(e) => setSelectedTeam(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select a team...</option>
                      {availableTeams.map((team) => (
                        <option key={team.id} value={team.id}>
                          {team.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Button
                    onClick={handleJoinTeam}
                    disabled={!selectedTeam || isJoining}
                    className="w-full"
                  >
                    {isJoining ? "Joining..." : "Join Team"}
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Team</h1>
        <p className="text-muted-foreground">
          Manage your team, view leaderboards, and share media
        </p>
      </div>

      <Tabs defaultValue="leaderboard" className="space-y-6">
        <TabsList>
          <TabsTrigger value="leaderboard">
            <Trophy className="h-4 w-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="h-4 w-4 mr-2" />
            Team Media
          </TabsTrigger>
          {(isTeamManager || isAdmin) && (
            <TabsTrigger value="management">
              <Users className="h-4 w-4 mr-2" />
              Team Management
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="leaderboard">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="media">
          <MediaUpload />
        </TabsContent>

        {(isTeamManager || isAdmin) && (
          <TabsContent value="management">
            <TeamManagement />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
