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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { UserPlus, Mail, UserMinus, Crown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  total_distance: number;
  strength_sessions: number;
  joined_at: string;
}

export function TeamManagement() {
  const { user, teamId } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [memberToPromote, setMemberToPromote] = useState<TeamMember | null>(
    null,
  );
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamManager, setIsTeamManager] = useState(false);

  useEffect(() => {
    if (user && teamId) {
      fetchUserRole();
      fetchTeamMembers();
    } else {
      setIsLoading(false);
    }
  }, [user, teamId]);

  const fetchUserRole = async () => {
    // Fetch user role from user_roles
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("team_id", teamId)
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

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);

      // Get team members
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, user_id, full_name, email, role, created_at")
        .eq("team_id", teamId)
        .order("full_name");

      if (profilesError) throw profilesError;

      // Get activity stats for each member
      const membersWithStats = await Promise.all(
        profiles.map(async (profile) => {
          // Get total rowing distance
          const { data: distanceData, error: distanceError } = await supabase
            .from("activities")
            .select("distance")
            .eq("user_id", profile.user_id)
            .eq("activity_type", "rowing");

          if (distanceError)
            console.error("Error fetching distance:", distanceError);

          const totalDistance =
            distanceData?.reduce((sum, activity) => {
              return sum + (activity.distance || 0);
            }, 0) || 0;

          // Get strength sessions count
          const { count: strengthSessions, error: strengthError } =
            await supabase
              .from("activities")
              .select("*", { count: "exact", head: true })
              .eq("user_id", profile.user_id)
              .eq("activity_type", "strength");

          if (strengthError)
            console.error("Error fetching strength sessions:", strengthError);

          return {
            ...profile,
            total_distance: totalDistance,
            strength_sessions: strengthSessions || 0,
            joined_at: new Date(profile.created_at).toLocaleDateString(),
          };
        }),
      );

      setMembers(membersWithStats);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!inviteEmail) {
      toast({
        title: "Missing email",
        description: "Please enter an email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from("profiles")
        .select("user_id, team_id")
        .eq("email", inviteEmail)
        .single();

      if (userError && userError.code !== "PGRST116") {
        // PGRST116 is "no rows returned" - that's expected if user doesn't exist
        throw userError;
      }

      if (existingUser) {
        if (existingUser.team_id) {
          toast({
            title: "User already in a team",
            description: "This user is already a member of a team",
            variant: "destructive",
          });
          return;
        }

        // Update existing user's team
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ team_id: teamId })
          .eq("user_id", existingUser.user_id);

        if (updateError) throw updateError;

        toast({
          title: "User added to team",
          description: `${inviteEmail} has been added to your team`,
        });
      } else {
        // In a real app, you would send an email invitation
        // For now, just show a message
        toast({
          title: "Invitation sent",
          description: `An invitation has been sent to ${inviteEmail}`,
        });
      }

      // Reset form and close dialog
      setInviteEmail("");
      setIsInviteDialogOpen(false);

      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error("Error inviting user:", error);
      toast({
        title: "Error",
        description: "Failed to invite user",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (
      !confirm("Are you sure you want to remove this member from the team?")
    ) {
      return;
    }

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ team_id: null })
        .eq("user_id", memberId);

      if (error) throw error;

      toast({
        title: "Member removed",
        description: "The member has been removed from your team",
      });

      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error("Error removing member:", error);
      toast({
        title: "Error",
        description: "Failed to remove member",
        variant: "destructive",
      });
    }
  };

  const handlePromoteMember = (member: TeamMember) => {
    setMemberToPromote(member);
    setIsPromoteDialogOpen(true);
  };

  const confirmPromoteMember = async (role: string) => {
    if (!memberToPromote) return;

    try {
      const { error } = await supabase
        .from("profiles")
        .update({ role })
        .eq("user_id", memberToPromote.user_id);

      if (error) throw error;

      toast({
        title: "Role updated",
        description: `${memberToPromote.full_name} is now a ${role === "team_manager" ? "Team Manager" : "User"}`,
      });

      // Reset and close dialog
      setMemberToPromote(null);
      setIsPromoteDialogOpen(false);

      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: "Failed to update role",
        variant: "destructive",
      });
    }
  };

  if (!isTeamManager && !isAdmin) {
    return (
      <Card data-oid="-7p7m1n">
        <CardHeader data-oid="-3cgt3s">
          <CardTitle data-oid="x3squcb">Team Management</CardTitle>
          <CardDescription data-oid="ekpms6:">
            Manage your team members and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8" data-oid="ax_jw5d">
          <p data-oid="rx8hd_h">
            You need to be a team manager to access this section.
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!teamId) {
    return (
      <Card data-oid=":ibft3l">
        <CardHeader data-oid="3cqhuw.">
          <CardTitle data-oid="u:xtry7">Team Management</CardTitle>
          <CardDescription data-oid="qn3fh4f">
            Manage your team members and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8" data-oid="dibak3k">
          <p data-oid="g4-..j_">
            You need to be part of a team to manage members.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-oid="l-o1drk">
      <CardHeader data-oid="7k-ij-j">
        <div className="flex justify-between items-center" data-oid="zhdn1lw">
          <div data-oid="mou83ou">
            <CardTitle data-oid="y136l7:">Team Management</CardTitle>
            <CardDescription data-oid="mf0ut.z">
              Manage your team members and settings
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsInviteDialogOpen(true)}
            data-oid="r:0r0bv"
          >
            <UserPlus className="h-4 w-4 mr-2" data-oid="9mj3xa9" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent data-oid="p6wai7h">
        {isLoading ? (
          <div className="text-center py-4" data-oid="w73tqli">
            Loading team members...
          </div>
        ) : (
          <div className="rounded-md border" data-oid="zi9gen4">
            <Table data-oid="8da-rt9">
              <TableHeader data-oid="3191bhn">
                <TableRow data-oid="t9sb5vq">
                  <TableHead data-oid="wbax7s5">Name</TableHead>
                  <TableHead data-oid=".6pg3r_">Role</TableHead>
                  <TableHead data-oid="pxf-xuw">Distance</TableHead>
                  <TableHead data-oid="xx9ppzx">Strength</TableHead>
                  <TableHead data-oid="xlt8b9c">Joined</TableHead>
                  <TableHead className="text-right" data-oid="ijv2p2f">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-oid="lh-hmb_">
                {members.length === 0 ? (
                  <TableRow data-oid="thx5e_r">
                    <TableCell
                      colSpan={6}
                      className="text-center"
                      data-oid="-xqaa62"
                    >
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.user_id} data-oid="juarn4a">
                      <TableCell className="font-medium" data-oid="raniav9">
                        {member.full_name}
                      </TableCell>
                      <TableCell data-oid="82eo04x">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.role === "admin"
                              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
                              : member.role === "team_manager"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                          }`}
                          data-oid="2_9i:sk"
                        >
                          {member.role === "admin"
                            ? "Admin"
                            : member.role === "team_manager"
                              ? "Team Manager"
                              : "User"}
                        </span>
                      </TableCell>
                      <TableCell data-oid=".v1wfa6">
                        {member.total_distance.toLocaleString()} m
                      </TableCell>
                      <TableCell data-oid="8ao8u11">
                        {member.strength_sessions} sessions
                      </TableCell>
                      <TableCell data-oid="g3yfwy:">
                        {member.joined_at}
                      </TableCell>
                      <TableCell className="text-right" data-oid="j0-c_7d">
                        {member.user_id !== user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePromoteMember(member)}
                              title="Change role"
                              data-oid="2ghfezp"
                            >
                              <Crown className="h-4 w-4" data-oid="a2-vclm" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.user_id)}
                              title="Remove from team"
                              data-oid="lc-6.k7"
                            >
                              <UserMinus
                                className="h-4 w-4"
                                data-oid="38w5ka8"
                              />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Invite Member Dialog */}
      <Dialog
        open={isInviteDialogOpen}
        onOpenChange={setIsInviteDialogOpen}
        data-oid="0c_jgh8"
      >
        <DialogContent data-oid="h2ll.j3">
          <DialogHeader data-oid="pus-p8u">
            <DialogTitle data-oid="1d1vs3t">Invite Team Member</DialogTitle>
            <DialogDescription data-oid="sroacp3">
              Enter the email address of the person you want to invite to your
              team.
            </DialogDescription>
          </DialogHeader>
          <form
            onSubmit={handleInviteUser}
            className="space-y-4"
            data-oid="66_e6qm"
          >
            <div className="space-y-2" data-oid="6k1bq9v">
              <Label htmlFor="invite-email" data-oid="y_or8ms">
                Email Address
              </Label>
              <div className="flex" data-oid="32o6btn">
                <span
                  className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted"
                  data-oid="11scqn4"
                >
                  <Mail
                    className="h-4 w-4 text-muted-foreground"
                    data-oid="ulayz7w"
                  />
                </span>
                <Input
                  id="invite-email"
                  type="email"
                  className="rounded-l-none"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  data-oid="vp0ali3"
                />
              </div>
            </div>
            <DialogFooter data-oid="p3s4g2e">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsInviteDialogOpen(false)}
                data-oid="ty39g95"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-oid="-.v536n">
                {isSubmitting ? "Sending..." : "Send Invitation"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog
        open={isPromoteDialogOpen}
        onOpenChange={setIsPromoteDialogOpen}
        data-oid="ui77j2n"
      >
        <DialogContent data-oid="55tobuk">
          <DialogHeader data-oid="g2:xarq">
            <DialogTitle data-oid=".kk.ukt">Change Member Role</DialogTitle>
            <DialogDescription data-oid="5f8ldny">
              {memberToPromote &&
                `Select a new role for ${memberToPromote.full_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4" data-oid="yi6d0h1">
            <div className="space-y-2" data-oid=":mwujfc">
              <Label htmlFor="role" data-oid="fe5pulz">
                Role
              </Label>
              <Select
                defaultValue={memberToPromote?.role}
                onValueChange={(value) => confirmPromoteMember(value)}
                data-oid="3lo2u5c"
              >
                <SelectTrigger data-oid="ygulkyw">
                  <SelectValue placeholder="Select role" data-oid="e.akb93" />
                </SelectTrigger>
                <SelectContent data-oid="pw6oxg6">
                  <SelectItem value="user" data-oid="eilaf7f">
                    User
                  </SelectItem>
                  <SelectItem value="team_manager" data-oid="mj4frjr">
                    Team Manager
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter data-oid="rc0uusl">
              <Button
                variant="outline"
                onClick={() => setIsPromoteDialogOpen(false)}
                data-oid="yqy8w_b"
              >
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
