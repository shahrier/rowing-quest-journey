import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Activity, Dumbbell, Clock, CalendarIcon, Trash2 } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { format } from "date-fns";

interface Activity {
  id: string;
  activity_type: "rowing" | "strength";
  distance: number | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
}

export function ActivityLogger() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"rowing" | "strength">("rowing");

  // Form states
  const [rowingDistance, setRowingDistance] = useState("");
  const [rowingDuration, setRowingDuration] = useState("");
  const [rowingNotes, setRowingNotes] = useState("");
  const [rowingDate, setRowingDate] = useState<Date>(new Date());
  const [isRowingDateOpen, setIsRowingDateOpen] = useState(false);

  const [strengthDuration, setStrengthDuration] = useState("");
  const [strengthNotes, setStrengthNotes] = useState("");
  const [strengthDate, setStrengthDate] = useState<Date>(new Date());
  const [isStrengthDateOpen, setIsStrengthDateOpen] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);

      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
      toast({
        title: "Error",
        description: "Failed to load your activities",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogRowing = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!rowingDistance) {
      toast({
        title: "Missing information",
        description: "Please enter a distance",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create activity
      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: user?.id,
          activity_type: "rowing",
          distance: parseFloat(rowingDistance),
          duration: rowingDuration ? parseFloat(rowingDuration) : null,
          notes: rowingNotes || null,
          created_at: rowingDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update team's total distance
      await updateTeamDistance(parseFloat(rowingDistance));

      // Check for badge achievements
      await checkForBadges("rowing", parseFloat(rowingDistance));

      toast({
        title: "Activity logged",
        description: `You've logged ${rowingDistance}m of rowing`,
      });

      // Reset form
      setRowingDistance("");
      setRowingDuration("");
      setRowingNotes("");
      setRowingDate(new Date());

      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error("Error logging rowing activity:", error);
      toast({
        title: "Error",
        description: "Failed to log your activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogStrength = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!strengthDuration) {
      toast({
        title: "Missing information",
        description: "Please enter a duration",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Create activity
      const { data, error } = await supabase
        .from("activities")
        .insert({
          user_id: user?.id,
          activity_type: "strength",
          distance: null,
          duration: parseFloat(strengthDuration),
          notes: strengthNotes || null,
          created_at: strengthDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Check for badge achievements
      await checkForBadges("strength");

      toast({
        title: "Activity logged",
        description: `You've logged ${strengthDuration} minutes of strength training`,
      });

      // Reset form
      setStrengthDuration("");
      setStrengthNotes("");
      setStrengthDate(new Date());

      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error("Error logging strength activity:", error);
      toast({
        title: "Error",
        description: "Failed to log your activity",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;

    try {
      // Get the activity details first to handle team distance updates
      const { data: activity, error: fetchError } = await supabase
        .from("activities")
        .select("*")
        .eq("id", activityToDelete)
        .single();

      if (fetchError) throw fetchError;

      // Delete the activity
      const { error } = await supabase
        .from("activities")
        .delete()
        .eq("id", activityToDelete);

      if (error) throw error;

      // If it was a rowing activity, update team distance
      if (activity.activity_type === "rowing" && activity.distance) {
        await updateTeamDistance(-activity.distance); // Subtract the distance
      }

      toast({
        title: "Activity deleted",
        description: "Your activity has been deleted",
      });

      // Refresh activities
      fetchActivities();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting activity:", error);
      toast({
        title: "Error",
        description: "Failed to delete your activity",
        variant: "destructive",
      });
    }
  };

  const updateTeamDistance = async (distanceChange: number) => {
    try {
      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("team_id")
        .eq("user_id", user?.id)
        .single();

      if (profileError || !profile.team_id) return;

      // Update team's current distance
      const { error } = await supabase.rpc("update_team_distance", {
        team_id_param: profile.team_id,
        distance_change: distanceChange / 1000, // Convert meters to km
      });

      if (error) {
        console.error("Error updating team distance:", error);
      }
    } catch (error) {
      console.error("Error in updateTeamDistance:", error);
    }
  };

  const checkForBadges = async (
    activityType: "rowing" | "strength",
    distance?: number,
  ) => {
    try {
      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("team_id")
        .eq("user_id", user?.id)
        .single();

      if (profileError) return;

      // Get relevant badges based on activity type
      let query = supabase.from("badges").select("*");

      if (activityType === "rowing") {
        query = query.eq("requirement_type", "rowing_distance");
      } else if (activityType === "strength") {
        query = query.eq("requirement_type", "strength_sessions");
      }

      // Filter to include global badges and team-specific badges
      query = query.or(
        `team_id.is.null,team_id.eq.${profile.team_id || "null"}`,
      );

      const { data: badges, error: badgesError } = await query;

      if (badgesError || !badges || badges.length === 0) return;

      // Check each badge requirement
      for (const badge of badges) {
        if (
          activityType === "rowing" &&
          badge.requirement_type === "rowing_distance"
        ) {
          // For rowing distance badges, check if this single activity meets the requirement
          if (distance && distance >= badge.requirement_value) {
            await awardBadge(badge.id);
          }
        } else if (
          activityType === "strength" &&
          badge.requirement_type === "strength_sessions"
        ) {
          // For strength session badges, count total sessions
          const { count, error: countError } = await supabase
            .from("activities")
            .select("*", { count: "exact", head: true })
            .eq("user_id", user?.id)
            .eq("activity_type", "strength");

          if (!countError && count && count >= badge.requirement_value) {
            await awardBadge(badge.id);
          }
        }
      }
    } catch (error) {
      console.error("Error checking for badges:", error);
    }
  };

  const awardBadge = async (badgeId: string) => {
    try {
      // Check if user already has this badge
      const { count, error: countError } = await supabase
        .from("user_badges")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user?.id)
        .eq("badge_id", badgeId);

      if (countError || count) return; // Already has badge or error

      // Award the badge
      const { error } = await supabase.from("user_badges").insert({
        user_id: user?.id,
        badge_id: badgeId,
      });

      if (error) {
        console.error("Error awarding badge:", error);
        return;
      }

      // Get badge details for notification
      const { data: badge, error: badgeError } = await supabase
        .from("badges")
        .select("name, tier")
        .eq("id", badgeId)
        .single();

      if (badgeError) return;

      // Notify user
      toast({
        title: "🏆 New Badge Earned!",
        description: `You've earned the ${badge.tier} badge: ${badge.name}`,
      });
    } catch (error) {
      console.error("Error in awardBadge:", error);
    }
  };

  const confirmDelete = (activityId: string) => {
    setActivityToDelete(activityId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card data-oid="8jzyvp8">
      <CardHeader data-oid="78n7kid">
        <CardTitle data-oid="j4cbgqv">Log Your Activities</CardTitle>
        <CardDescription data-oid="r4j509x">
          Track your rowing and strength training progress
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="jzmr85q">
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "rowing" | "strength")
          }
          data-oid="au.t:h6"
        >
          <TabsList className="grid w-full grid-cols-2" data-oid=".b-6nq9">
            <TabsTrigger value="rowing" data-oid="f4stt3j">
              <Activity className="h-4 w-4 mr-2" data-oid="zxq7j36" />
              Rowing
            </TabsTrigger>
            <TabsTrigger value="strength" data-oid="lzupou1">
              <Dumbbell className="h-4 w-4 mr-2" data-oid="3b5hi18" />
              Strength Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rowing" className="space-y-4" data-oid="h1:5t:e">
            <form
              onSubmit={handleLogRowing}
              className="space-y-4"
              data-oid="o.h4ef6"
            >
              <div className="grid gap-4 md:grid-cols-2" data-oid="m4eimer">
                <div className="space-y-2" data-oid="1.0t1f0">
                  <Label htmlFor="rowing-distance" data-oid=":w.gp71">
                    Distance (meters)
                  </Label>
                  <Input
                    id="rowing-distance"
                    type="number"
                    placeholder="Enter distance in meters"
                    value={rowingDistance}
                    onChange={(e) => setRowingDistance(e.target.value)}
                    min="1"
                    required
                    data-oid="4t2q_jn"
                  />
                </div>
                <div className="space-y-2" data-oid="mkgi-w9">
                  <Label htmlFor="rowing-duration" data-oid="4sz_5-5">
                    Duration (minutes)
                  </Label>
                  <Input
                    id="rowing-duration"
                    type="number"
                    placeholder="Optional"
                    value={rowingDuration}
                    onChange={(e) => setRowingDuration(e.target.value)}
                    min="1"
                    data-oid="bt566k2"
                  />
                </div>
              </div>

              <div className="space-y-2" data-oid="qy0ptaa">
                <Label htmlFor="rowing-date" data-oid="rcw4.7s">
                  Date
                </Label>
                <Popover
                  open={isRowingDateOpen}
                  onOpenChange={setIsRowingDateOpen}
                  data-oid="ch2ycu."
                >
                  <PopoverTrigger asChild data-oid="1qu5eu1">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-oid="piirjs3"
                    >
                      <CalendarIcon
                        className="mr-2 h-4 w-4"
                        data-oid="6vw-qf8"
                      />

                      {rowingDate ? (
                        format(rowingDate, "PPP")
                      ) : (
                        <span data-oid="4rza4og">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" data-oid="i_7fwuk">
                    <Calendar
                      mode="single"
                      selected={rowingDate}
                      onSelect={(date) => {
                        setRowingDate(date || new Date());
                        setIsRowingDateOpen(false);
                      }}
                      initialFocus
                      data-oid="rdlm2u_"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2" data-oid="080c6h0">
                <Label htmlFor="rowing-notes" data-oid="r234exm">
                  Notes
                </Label>
                <Textarea
                  id="rowing-notes"
                  placeholder="Optional notes about your rowing session"
                  value={rowingNotes}
                  onChange={(e) => setRowingNotes(e.target.value)}
                  rows={3}
                  data-oid="ol:x.vb"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-oid="syg5noj"
              >
                {isSubmitting ? "Logging..." : "Log Rowing Activity"}
              </Button>
            </form>
          </TabsContent>

          <TabsContent
            value="strength"
            className="space-y-4"
            data-oid=".8m8puy"
          >
            <form
              onSubmit={handleLogStrength}
              className="space-y-4"
              data-oid="be4flm7"
            >
              <div className="space-y-2" data-oid="3v-ajgg">
                <Label htmlFor="strength-duration" data-oid="0434lg.">
                  Duration (minutes)
                </Label>
                <Input
                  id="strength-duration"
                  type="number"
                  placeholder="Enter duration in minutes"
                  value={strengthDuration}
                  onChange={(e) => setStrengthDuration(e.target.value)}
                  min="1"
                  required
                  data-oid="b.y.goh"
                />
              </div>

              <div className="space-y-2" data-oid="vfikt3k">
                <Label htmlFor="strength-date" data-oid="l5xv1kk">
                  Date
                </Label>
                <Popover
                  open={isStrengthDateOpen}
                  onOpenChange={setIsStrengthDateOpen}
                  data-oid="o837xdv"
                >
                  <PopoverTrigger asChild data-oid="nv9sbza">
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                      data-oid="velm1m2"
                    >
                      <CalendarIcon
                        className="mr-2 h-4 w-4"
                        data-oid=".kd6rdi"
                      />

                      {strengthDate ? (
                        format(strengthDate, "PPP")
                      ) : (
                        <span data-oid="afcq-tt">Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" data-oid="krl2jkm">
                    <Calendar
                      mode="single"
                      selected={strengthDate}
                      onSelect={(date) => {
                        setStrengthDate(date || new Date());
                        setIsStrengthDateOpen(false);
                      }}
                      initialFocus
                      data-oid="cj5woxa"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2" data-oid="7fw8wuc">
                <Label htmlFor="strength-notes" data-oid="5y0q:x_">
                  Notes
                </Label>
                <Textarea
                  id="strength-notes"
                  placeholder="Describe your strength training (e.g., kettlebell swings, core workouts)"
                  value={strengthNotes}
                  onChange={(e) => setStrengthNotes(e.target.value)}
                  rows={3}
                  data-oid="lrty4l3"
                />
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
                data-oid="zc0rcjo"
              >
                {isSubmitting ? "Logging..." : "Log Strength Activity"}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="mt-8" data-oid="dv91jep">
          <h3 className="text-lg font-medium mb-4" data-oid="0wzut-r">
            Recent Activities
          </h3>
          {isLoading ? (
            <div className="text-center py-4" data-oid="m8zrrhw">
              Loading activities...
            </div>
          ) : activities.length === 0 ? (
            <div
              className="text-center py-4 text-muted-foreground"
              data-oid="9srled3"
            >
              You haven't logged any activities yet
            </div>
          ) : (
            <div className="rounded-md border" data-oid="qflridf">
              <Table data-oid="lkhebf:">
                <TableHeader data-oid="6iuy:j8">
                  <TableRow data-oid="4.qg_zz">
                    <TableHead data-oid="7-advjh">Type</TableHead>
                    <TableHead data-oid="ip4c2gv">Details</TableHead>
                    <TableHead data-oid="x-y2hjq">Date</TableHead>
                    <TableHead className="text-right" data-oid=":_u4s4i">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody data-oid="ou5xn0s">
                  {activities.map((activity) => (
                    <TableRow key={activity.id} data-oid="en2e_rp">
                      <TableCell data-oid="-yj76nb">
                        {activity.activity_type === "rowing" ? (
                          <span
                            className="flex items-center"
                            data-oid="mvl1gnb"
                          >
                            <Activity
                              className="h-4 w-4 mr-2"
                              data-oid="wgewsji"
                            />
                            Rowing
                          </span>
                        ) : (
                          <span
                            className="flex items-center"
                            data-oid=".xbxfw6"
                          >
                            <Dumbbell
                              className="h-4 w-4 mr-2"
                              data-oid="eitm73j"
                            />
                            Strength
                          </span>
                        )}
                      </TableCell>
                      <TableCell data-oid="9:w_poc">
                        {activity.activity_type === "rowing" ? (
                          <div data-oid="r7rt1y9">
                            <div data-oid="a1tq0y-">{activity.distance}m</div>
                            {activity.duration && (
                              <div
                                className="text-sm text-muted-foreground flex items-center"
                                data-oid="7fc_j1i"
                              >
                                <Clock
                                  className="h-3 w-3 mr-1"
                                  data-oid="_qxev42"
                                />
                                {activity.duration} min
                              </div>
                            )}
                          </div>
                        ) : (
                          <div data-oid=":u9a78k">
                            <div data-oid="txt9nbf">
                              {activity.duration} min
                            </div>
                            {activity.notes && (
                              <div
                                className="text-sm text-muted-foreground"
                                data-oid="yy3b1jm"
                              >
                                {activity.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell data-oid="rv5r4t_">
                        {new Date(activity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right" data-oid="kdxs06c">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(activity.id)}
                          data-oid="osc_iz."
                        >
                          <Trash2 className="h-4 w-4" data-oid="q2a6hfn" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        data-oid="b_rbi:0"
      >
        <DialogContent data-oid="ytbye-b">
          <DialogHeader data-oid="yox.3tb">
            <DialogTitle data-oid="01eslvv">Delete Activity</DialogTitle>
            <DialogDescription data-oid="sy6pb-7">
              Are you sure you want to delete this activity? This action cannot
              be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter data-oid="773e.-r">
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              data-oid="06-eczt"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteActivity}
              data-oid="b89jc4y"
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
