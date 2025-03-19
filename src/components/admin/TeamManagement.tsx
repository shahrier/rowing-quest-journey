import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Users, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface Team {
  id: string;
  name: string;
  journey_name: string;
  start_location: string;
  end_location: string;
  total_distance_km: number;
  current_distance_km: number;
  member_count: number;
  created_at: string;
}

export function TeamManagement() {
  const { user, isAdmin } = useAuth();
  const { toast } = useToast();
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  // Form states
  const [teamName, setTeamName] = useState("");
  const [journeyName, setJourneyName] = useState("");
  const [startLocation, setStartLocation] = useState("Boston");
  const [endLocation, setEndLocation] = useState("Rotterdam");
  const [journeyDescription, setJourneyDescription] = useState(
    "Row across the Atlantic Ocean from Boston to Rotterdam.",
  );
  const [totalDistance, setTotalDistance] = useState(5556);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);

      // Get teams with member count
      const { data, error } = await supabase.from("teams").select(`
          id,
          name,
          journey_name,
          start_location,
          end_location,
          total_distance_km,
          current_distance_km,
          created_at
        `);

      if (error) throw error;

      // Get member counts for each team
      const teamsWithCounts = await Promise.all(
        data.map(async (team) => {
          const { count, error: countError } = await supabase
            .from("profiles")
            .select("*", { count: "exact", head: true })
            .eq("team_id", team.id);

          if (countError) {
            console.error("Error getting member count:", countError);
            return { ...team, member_count: 0 };
          }

          return {
            ...team,
            member_count: count || 0,
            created_at: new Date(team.created_at).toLocaleDateString(),
          };
        }),
      );

      setTeams(teamsWithCounts);
    } catch (error) {
      console.error("Error fetching teams:", error);
      toast({
        title: "Error",
        description: "Failed to load teams",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !startLocation || !endLocation || !totalDistance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data, error } = await supabase
        .from("teams")
        .insert({
          name: teamName,
          journey_name: journeyName || `${startLocation} to ${endLocation}`,
          start_location: startLocation,
          end_location: endLocation,
          total_distance_km: totalDistance,
          current_distance_km: 0,
          created_by: user?.id,
        })
        .select()
        .single();

      if (error) throw error;

      // Create default journey checkpoints
      await createDefaultCheckpoints(data.id);

      toast({
        title: "Team Created",
        description: `Team "${teamName}" has been created successfully with a journey from ${startLocation} to ${endLocation}.`,
      });

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

      // Refresh teams list
      fetchTeams();
    } catch (error) {
      console.error("Error creating team:", error);
      toast({
        title: "Error",
        description: "Failed to create team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditTeam = (team: Team) => {
    setSelectedTeam(team);
    setTeamName(team.name);
    setJourneyName(team.journey_name);
    setStartLocation(team.start_location);
    setEndLocation(team.end_location);
    setTotalDistance(team.total_distance_km);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeam) return;

    if (!teamName || !startLocation || !endLocation || !totalDistance) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("teams")
        .update({
          name: teamName,
          journey_name: journeyName || `${startLocation} to ${endLocation}`,
          start_location: startLocation,
          end_location: endLocation,
          total_distance_km: totalDistance,
        })
        .eq("id", selectedTeam.id);

      if (error) throw error;

      toast({
        title: "Team Updated",
        description: `Team "${teamName}" has been updated successfully.`,
      });

      // Reset form and close dialog
      resetForm();
      setIsEditDialogOpen(false);

      // Refresh teams list
      fetchTeams();
    } catch (error) {
      console.error("Error updating team:", error);
      toast({
        title: "Error",
        description: "Failed to update team. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this team? All team data will be lost.",
      )
    ) {
      return;
    }

    try {
      // First update all profiles to remove team_id
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ team_id: null })
        .eq("team_id", teamId);

      if (profileError) {
        console.error("Error updating profiles:", profileError);
      }

      // Delete journey checkpoints
      const { error: checkpointError } = await supabase
        .from("journey_checkpoints")
        .delete()
        .eq("team_id", teamId);

      if (checkpointError) {
        console.error("Error deleting checkpoints:", checkpointError);
      }

      // Delete team
      const { error } = await supabase.from("teams").delete().eq("id", teamId);

      if (error) throw error;

      toast({
        title: "Team Deleted",
        description: "The team has been deleted successfully.",
      });

      // Refresh teams list
      fetchTeams();
    } catch (error) {
      console.error("Error deleting team:", error);
      toast({
        title: "Error",
        description: "Failed to delete team. Please try again.",
        variant: "destructive",
      });
    }
  };

  const createDefaultCheckpoints = async (teamId: string) => {
    try {
      // Create default checkpoints for Boston to Rotterdam journey
      const checkpoints = [
        {
          team_id: teamId,
          name: "Boston",
          description: "Starting point of our journey",
          distance_from_start: 0,
          latitude: 42.3601,
          longitude: -71.0589,
          is_reached: true,
        },
        {
          team_id: teamId,
          name: "Halifax",
          description: "First major stop along the Atlantic",
          distance_from_start: 800,
          latitude: 44.6488,
          longitude: -63.5752,
          is_reached: false,
        },
        {
          team_id: teamId,
          name: "Reykjavik",
          description: "Icelandic capital",
          distance_from_start: 2400,
          latitude: 64.1466,
          longitude: -21.9426,
          is_reached: false,
        },
        {
          team_id: teamId,
          name: "Edinburgh",
          description: "Scottish historic city",
          distance_from_start: 3600,
          latitude: 55.9533,
          longitude: -3.1883,
          is_reached: false,
        },
        {
          team_id: teamId,
          name: "London",
          description: "Capital of England",
          distance_from_start: 4200,
          latitude: 51.5074,
          longitude: -0.1278,
          is_reached: false,
        },
        {
          team_id: teamId,
          name: "Rotterdam",
          description: "Final destination",
          distance_from_start: 5556,
          latitude: 51.9244,
          longitude: 4.4777,
          is_reached: false,
        },
      ];

      const { error } = await supabase
        .from("journey_checkpoints")
        .insert(checkpoints);

      if (error) {
        console.error("Error creating checkpoints:", error);
      }
    } catch (error) {
      console.error("Error in createDefaultCheckpoints:", error);
    }
  };

  const resetForm = () => {
    setTeamName("");
    setJourneyName("");
    setStartLocation("Boston");
    setEndLocation("Rotterdam");
    setJourneyDescription(
      "Row across the Atlantic Ocean from Boston to Rotterdam.",
    );
    setTotalDistance(5556);
    setSelectedTeam(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  return (
    <Card data-oid="ev_dg5p">
      <CardHeader data-oid="-f9it.f">
        <div className="flex justify-between items-center" data-oid="r9:gl54">
          <div data-oid="4feconl">
            <CardTitle className="flex items-center gap-2" data-oid="j6fw:-b">
              <Users className="h-5 w-5" data-oid="pzw:t63" />
              Team Management
            </CardTitle>
            <CardDescription data-oid="3rqr.0n">
              Create and manage rowing teams
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} data-oid="g6qsvfb">
            <Plus className="h-4 w-4 mr-2" data-oid="as4av3." />
            Create Team
          </Button>
        </div>
      </CardHeader>
      <CardContent data-oid="d9sqdlh">
        {isLoading ? (
          <div className="text-center py-4" data-oid="ws4c8rs">
            Loading teams...
          </div>
        ) : (
          <div className="rounded-md border" data-oid="4bk6mf8">
            <Table data-oid="r6jx2u7">
              <TableHeader data-oid="mb_yyu.">
                <TableRow data-oid="51sq5:c">
                  <TableHead data-oid="9yh4joa">Team Name</TableHead>
                  <TableHead data-oid="yyb:xn5">Journey</TableHead>
                  <TableHead data-oid="m2li.6b">Distance</TableHead>
                  <TableHead data-oid="x_wm773">Members</TableHead>
                  <TableHead data-oid="3lqkqn0">Created</TableHead>
                  <TableHead className="text-right" data-oid="qxs.2k1">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-oid="qaayyay">
                {teams.length === 0 ? (
                  <TableRow data-oid=".hxuacz">
                    <TableCell
                      colSpan={6}
                      className="text-center"
                      data-oid="3euw2c:"
                    >
                      No teams found
                    </TableCell>
                  </TableRow>
                ) : (
                  teams.map((team) => (
                    <TableRow key={team.id} data-oid="gg8zhu8">
                      <TableCell className="font-medium" data-oid="937aa.u">
                        {team.name}
                      </TableCell>
                      <TableCell data-oid="dtskdc0">
                        {team.journey_name}
                      </TableCell>
                      <TableCell data-oid="-h49:y8">
                        {team.current_distance_km.toLocaleString()} /{" "}
                        {team.total_distance_km.toLocaleString()} km
                        <div
                          className="w-full bg-gray-200 rounded-full h-2.5 mt-1"
                          data-oid="m26ao3n"
                        >
                          <div
                            className="bg-primary h-2.5 rounded-full"
                            style={{
                              width: `${Math.min(100, (team.current_distance_km / team.total_distance_km) * 100)}%`,
                            }}
                            data-oid="852wp1:"
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell data-oid="x.rhibp">
                        {team.member_count}
                      </TableCell>
                      <TableCell data-oid="in67j_f">
                        {team.created_at}
                      </TableCell>
                      <TableCell className="text-right" data-oid="cdbuav8">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditTeam(team)}
                          data-oid="fpg6tt:"
                        >
                          <Edit className="h-4 w-4" data-oid=".gh9pc6" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteTeam(team.id)}
                          data-oid="2tlkm-v"
                        >
                          <Trash2 className="h-4 w-4" data-oid="bsm72v6" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Create Team Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        data-oid="tlj9e_r"
      >
        <DialogContent className="sm:max-w-[600px]" data-oid="9w7r8l6">
          <DialogHeader data-oid="5n45oxc">
            <DialogTitle data-oid="cj81fd2">Create New Team</DialogTitle>
            <DialogDescription data-oid="az:f3q:">
              Create a new team and define their rowing journey
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleCreateTeam}
            className="space-y-4"
            data-oid="cvwn.bs"
          >
            <div className="space-y-2" data-oid=".isdx5w">
              <Label htmlFor="team-name" data-oid="99dnefd">
                Team Name
              </Label>
              <Input
                id="team-name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                data-oid="w4ai7h_"
              />
            </div>

            <div className="space-y-2" data-oid="0tykxe:">
              <Label htmlFor="journey-name" data-oid="l:9v.6g">
                Journey Name
              </Label>
              <Input
                id="journey-name"
                placeholder="e.g. Atlantic Challenge"
                value={journeyName}
                onChange={(e) => setJourneyName(e.target.value)}
                data-oid="izfni0i"
              />

              <p className="text-xs text-muted-foreground" data-oid="lam1d8l">
                Optional. If not provided, will default to "[Start] to [End]"
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2" data-oid="twf9r4j">
              <div className="space-y-2" data-oid="oi3tcq_">
                <Label htmlFor="start-location" data-oid="d8o.-1n">
                  Start Location
                </Label>
                <div className="flex" data-oid="gyvogo:">
                  <span
                    className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                    data-oid="c2.3zby"
                  >
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      data-oid="he1i9rb"
                    />
                  </span>
                  <Input
                    id="start-location"
                    className="rounded-l-none"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    required
                    data-oid=".g-.82s"
                  />
                </div>
              </div>
              <div className="space-y-2" data-oid="xfjsk5p">
                <Label htmlFor="end-location" data-oid="y:08rjf">
                  End Location
                </Label>
                <div className="flex" data-oid="z3b_ms5">
                  <span
                    className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                    data-oid="ayqupp6"
                  >
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      data-oid="bziiiuc"
                    />
                  </span>
                  <Input
                    id="end-location"
                    className="rounded-l-none"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    required
                    data-oid="heq._kl"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2" data-oid="02-fq13">
              <Label htmlFor="total-distance" data-oid="gznugy_">
                Total Distance (km)
              </Label>
              <Input
                id="total-distance"
                type="number"
                min="1"
                value={totalDistance}
                onChange={(e) => setTotalDistance(Number(e.target.value))}
                required
                data-oid="9-rwz7g"
              />
            </div>

            <div className="space-y-2" data-oid="pj5__4g">
              <Label htmlFor="journey-description" data-oid="7xoevuv">
                Journey Description
              </Label>
              <Textarea
                id="journey-description"
                placeholder="Describe your team's journey"
                value={journeyDescription}
                onChange={(e) => setJourneyDescription(e.target.value)}
                rows={3}
                data-oid="o-r7qfa"
              />
            </div>

            <DialogFooter data-oid="rrkvuzd">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
                data-oid="ot6o9jg"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-oid="z88w.tg">
                {isSubmitting ? "Creating Team..." : "Create Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Edit Team Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data-oid="bo535bk"
      >
        <DialogContent className="sm:max-w-[600px]" data-oid="bmudfo4">
          <DialogHeader data-oid="k4avpjn">
            <DialogTitle data-oid="--arr42">Edit Team</DialogTitle>
            <DialogDescription data-oid="udc5cy8">
              Update team information and journey details
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleUpdateTeam}
            className="space-y-4"
            data-oid="._u7_ao"
          >
            <div className="space-y-2" data-oid="m6tnpuv">
              <Label htmlFor="edit-team-name" data-oid="wek24tg">
                Team Name
              </Label>
              <Input
                id="edit-team-name"
                placeholder="Enter team name"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                required
                data-oid="4je2uki"
              />
            </div>

            <div className="space-y-2" data-oid="7ht_hza">
              <Label htmlFor="edit-journey-name" data-oid="m:6i8yd">
                Journey Name
              </Label>
              <Input
                id="edit-journey-name"
                placeholder="e.g. Atlantic Challenge"
                value={journeyName}
                onChange={(e) => setJourneyName(e.target.value)}
                data-oid="18hg716"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2" data-oid="1o8cilc">
              <div className="space-y-2" data-oid="6wrqc9h">
                <Label htmlFor="edit-start-location" data-oid="wwhwf5x">
                  Start Location
                </Label>
                <div className="flex" data-oid="qyfftb:">
                  <span
                    className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                    data-oid="l7.gw-w"
                  >
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      data-oid="3tlbv40"
                    />
                  </span>
                  <Input
                    id="edit-start-location"
                    className="rounded-l-none"
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    required
                    data-oid="wcmamyy"
                  />
                </div>
              </div>
              <div className="space-y-2" data-oid=":l5:mu-">
                <Label htmlFor="edit-end-location" data-oid="69q6_7-">
                  End Location
                </Label>
                <div className="flex" data-oid="5k.8z12">
                  <span
                    className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                    data-oid="vu72og8"
                  >
                    <MapPin
                      className="h-4 w-4 text-muted-foreground"
                      data-oid="f__bz3e"
                    />
                  </span>
                  <Input
                    id="edit-end-location"
                    className="rounded-l-none"
                    value={endLocation}
                    onChange={(e) => setEndLocation(e.target.value)}
                    required
                    data-oid="o6ae:1w"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2" data-oid="5uaqne_">
              <Label htmlFor="edit-total-distance" data-oid="e1b.lda">
                Total Distance (km)
              </Label>
              <Input
                id="edit-total-distance"
                type="number"
                min="1"
                value={totalDistance}
                onChange={(e) => setTotalDistance(Number(e.target.value))}
                required
                data-oid="4kznpss"
              />
            </div>

            <DialogFooter data-oid="b7jp:tj">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditDialogOpen(false)}
                data-oid="8jgmol6"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-oid="rabron6">
                {isSubmitting ? "Updating Team..." : "Update Team"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
