import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Badge as BadgeType, BadgeTier } from "@/lib/supabase-types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, Edit, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const REQUIREMENT_TYPES = [
  { value: "rowing_distance", label: "Rowing Distance (meters)" },
  { value: "strength_sessions", label: "Strength Training Sessions" },
  { value: "kettlebell_swings", label: "Kettlebell Swings" },
  { value: "core_workouts", label: "Core Workouts" },
  { value: "team_contribution", label: "Team Contribution (km)" },
];

const BADGE_TIERS: { value: BadgeTier; label: string }[] = [
  { value: "bronze", label: "Bronze" },
  { value: "silver", label: "Silver" },
  { value: "gold", label: "Gold" },
];

interface BadgeManagementProps {
  isGlobalOnly?: boolean;
}

export function BadgeManagement({
  isGlobalOnly = false,
}: BadgeManagementProps) {
  const { user, isAdmin, teamId } = useAuth();
  const { toast } = useToast();
  const [badges, setBadges] = useState<BadgeType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedBadge, setSelectedBadge] = useState<BadgeType | null>(null);

  // Form states
  const [badgeName, setBadgeName] = useState("");
  const [description, setDescription] = useState("");
  const [requirementType, setRequirementType] = useState("");
  const [requirementValue, setRequirementValue] = useState("");
  const [tier, setTier] = useState<BadgeTier>("bronze");
  const [isGlobalBadge, setIsGlobalBadge] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchBadges();
  }, [isGlobalOnly, teamId]);

  const fetchBadges = async () => {
    try {
      setIsLoading(true);

      let query = supabase.from("badges").select("*");

      if (isGlobalOnly) {
        // Admin view - show only global badges
        query = query.is("team_id", null);
      } else if (isAdmin) {
        // Admin can see all badges in the regular view
      } else if (teamId) {
        // Team manager or user - show only team badges
        query = query.eq("team_id", teamId);
      }

      const { data, error } = await query.order("created_at", {
        ascending: false,
      });

      if (error) throw error;
      setBadges(data || []);
    } catch (error) {
      console.error("Error fetching badges:", error);
      toast({
        title: "Error",
        description: "Failed to load badges",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeName.trim() || !requirementType || !requirementValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user has permission to create badge
      if (isGlobalBadge && !isAdmin) {
        toast({
          title: "Error",
          description: "Only admins can create global badges",
          variant: "destructive",
        });
        return;
      }

      if (!isGlobalBadge && !teamId && !isAdmin) {
        toast({
          title: "Error",
          description: "You must be part of a team to create team badges",
          variant: "destructive",
        });
        return;
      }

      // Create the badge
      const { error: badgeError } = await supabase.from("badges").insert({
        name: badgeName,
        description,
        requirement_type: requirementType,
        requirement_value: parseInt(requirementValue),
        tier,
        team_id: isGlobalBadge ? null : teamId,
        created_by: user?.id,
      });

      if (badgeError) throw badgeError;

      toast({
        title: "Success",
        description: "Badge created successfully",
      });

      // Reset form and close dialog
      resetForm();
      setIsCreateDialogOpen(false);

      // Refresh badges
      fetchBadges();
    } catch (error) {
      console.error("Error creating badge:", error);
      toast({
        title: "Error",
        description: "Failed to create badge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditBadge = (badge: BadgeType) => {
    setSelectedBadge(badge);
    setBadgeName(badge.name);
    setDescription(badge.description);
    setRequirementType(badge.requirement_type);
    setRequirementValue(badge.requirement_value.toString());
    setTier(badge.tier as BadgeTier);
    setIsGlobalBadge(badge.team_id === null);
    setIsEditDialogOpen(true);
  };

  const handleUpdateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBadge) return;

    if (!badgeName.trim() || !requirementType || !requirementValue) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Check if user has permission to update badge
      if (isGlobalBadge && !isAdmin) {
        toast({
          title: "Error",
          description: "Only admins can update global badges",
          variant: "destructive",
        });
        return;
      }

      // Update the badge
      const { error } = await supabase
        .from("badges")
        .update({
          name: badgeName,
          description,
          requirement_type: requirementType,
          requirement_value: parseInt(requirementValue),
          tier,
          team_id: isGlobalBadge ? null : teamId,
        })
        .eq("id", selectedBadge.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Badge updated successfully",
      });

      // Reset form and close dialog
      resetForm();
      setIsEditDialogOpen(false);

      // Refresh badges
      fetchBadges();
    } catch (error) {
      console.error("Error updating badge:", error);
      toast({
        title: "Error",
        description: "Failed to update badge",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBadge = async (badgeId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this badge? Users who have earned it will lose it.",
      )
    ) {
      return;
    }

    try {
      // First delete user_badges entries
      const { error: userBadgeError } = await supabase
        .from("user_badges")
        .delete()
        .eq("badge_id", badgeId);

      if (userBadgeError) {
        console.error("Error deleting user badges:", userBadgeError);
      }

      // Then delete the badge
      const { error } = await supabase
        .from("badges")
        .delete()
        .eq("id", badgeId);

      if (error) throw error;

      toast({
        title: "Badge Deleted",
        description: "The badge has been deleted successfully",
      });

      // Refresh badges
      fetchBadges();
    } catch (error) {
      console.error("Error deleting badge:", error);
      toast({
        title: "Error",
        description: "Failed to delete badge",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setBadgeName("");
    setDescription("");
    setRequirementType("");
    setRequirementValue("");
    setTier("bronze");
    setIsGlobalBadge(false);
    setSelectedBadge(null);
  };

  const openCreateDialog = () => {
    resetForm();
    setIsCreateDialogOpen(true);
  };

  const getBadgeTypeLabel = (type: string) => {
    const found = REQUIREMENT_TYPES.find((t) => t.value === type);
    return found ? found.label : type;
  };

  const renderBadgeForm = (
    isEdit: boolean,
    onSubmit: (e: React.FormEvent) => Promise<void>,
  ) => (
    <form onSubmit={onSubmit} className="space-y-4" data-oid="4d.hijc">
      <div className="space-y-2" data-oid="xlg2c_o">
        <Label htmlFor="badgeName" data-oid="h.5-bho">
          Badge Name
        </Label>
        <Input
          id="badgeName"
          value={badgeName}
          onChange={(e) => setBadgeName(e.target.value)}
          placeholder="Enter badge name"
          required
          data-oid="znytztt"
        />
      </div>

      <div className="space-y-2" data-oid="tw7j:p8">
        <Label htmlFor="description" data-oid="2or8nro">
          Description
        </Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter badge description"
          rows={2}
          data-oid="y:vx1y8"
        />
      </div>

      <div className="space-y-2" data-oid="l6eh5n:">
        <Label htmlFor="requirementType" data-oid="v.vo071">
          Requirement Type
        </Label>
        <Select
          value={requirementType}
          onValueChange={setRequirementType}
          data-oid="k:0dqth"
        >
          <SelectTrigger data-oid="-jwes2j">
            <SelectValue
              placeholder="Select requirement type"
              data-oid="mol4afr"
            />
          </SelectTrigger>
          <SelectContent data-oid="fhak2if">
            {REQUIREMENT_TYPES.map((type) => (
              <SelectItem
                key={type.value}
                value={type.value}
                data-oid="x2froo5"
              >
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2" data-oid="y1hhr.9">
        <Label htmlFor="requirementValue" data-oid="cd:xzb9">
          Requirement Value
        </Label>
        <Input
          id="requirementValue"
          type="number"
          value={requirementValue}
          onChange={(e) => setRequirementValue(e.target.value)}
          placeholder="Enter requirement value"
          min="1"
          required
          data-oid="6ll.xyp"
        />
      </div>

      <div className="space-y-2" data-oid="21gud1h">
        <Label htmlFor="tier" data-oid="f.h12a7">
          Badge Tier
        </Label>
        <Select
          value={tier}
          onValueChange={(value) => setTier(value as BadgeTier)}
          data-oid="s5o6ms8"
        >
          <SelectTrigger data-oid="z.06qmi">
            <SelectValue placeholder="Select badge tier" data-oid="p8zr_3p" />
          </SelectTrigger>
          <SelectContent data-oid="igtnjl7">
            {BADGE_TIERS.map((t) => (
              <SelectItem key={t.value} value={t.value} data-oid="b3bc273">
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isAdmin && !isGlobalOnly && (
        <div className="flex items-center space-x-2" data-oid="q32ptar">
          <Switch
            id="isGlobalBadge"
            checked={isGlobalBadge}
            onCheckedChange={setIsGlobalBadge}
            data-oid="7ut54ba"
          />

          <Label htmlFor="isGlobalBadge" data-oid="3kmcog-">
            Create as Global Badge (available to all teams)
          </Label>
        </div>
      )}

      <DialogFooter data-oid="_4tpmjh">
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            isEdit ? setIsEditDialogOpen(false) : setIsCreateDialogOpen(false)
          }
          data-oid="195:73h"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} data-oid="qva:l7v">
          {isSubmitting
            ? isEdit
              ? "Updating..."
              : "Creating..."
            : isEdit
              ? "Update Badge"
              : "Create Badge"}
        </Button>
      </DialogFooter>
    </form>
  );

  return (
    <Card data-oid="vqgpg2e">
      <CardHeader data-oid="j7j9zf_">
        <div className="flex justify-between items-center" data-oid="ft1uxkc">
          <div data-oid="gs:jyx3">
            <CardTitle data-oid="q9ba87.">
              {isGlobalOnly ? "Global Badges" : "Badge Management"}
            </CardTitle>
            <CardDescription data-oid="aksv-wi">
              {isGlobalOnly
                ? "Manage badges available to all teams"
                : "Create and manage badges for your team"}
            </CardDescription>
          </div>
          <Button onClick={openCreateDialog} data-oid="q6-o4af">
            <Plus className="h-4 w-4 mr-2" data-oid="on6xkf:" />
            Create Badge
          </Button>
        </div>
      </CardHeader>
      <CardContent data-oid="bfivr9s">
        {isLoading ? (
          <div className="text-center py-4" data-oid="f:-fbcc">
            Loading badges...
          </div>
        ) : (
          <div className="rounded-md border" data-oid="9l7wgmz">
            <Table data-oid="lhkwkjc">
              <TableHeader data-oid="47-temy">
                <TableRow data-oid="xr7o6l3">
                  <TableHead data-oid="-ym_tjk">Badge</TableHead>
                  <TableHead data-oid="m4h3_n6">Requirement</TableHead>
                  <TableHead data-oid="uhfio-_">Tier</TableHead>
                  <TableHead data-oid="opoqc19">Scope</TableHead>
                  <TableHead className="text-right" data-oid="11v:hd8">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody data-oid="ad.4z18">
                {badges.length === 0 ? (
                  <TableRow data-oid="vn-.dyv">
                    <TableCell
                      colSpan={5}
                      className="text-center"
                      data-oid="5.7svf_"
                    >
                      No badges found
                    </TableCell>
                  </TableRow>
                ) : (
                  badges.map((badge) => (
                    <TableRow key={badge.id} data-oid="h7yymd4">
                      <TableCell data-oid="1q7mmhi">
                        <div className="font-medium" data-oid="ayi:k.v">
                          {badge.name}
                        </div>
                        <div
                          className="text-sm text-muted-foreground"
                          data-oid="jhpxnp0"
                        >
                          {badge.description}
                        </div>
                      </TableCell>
                      <TableCell data-oid="xtpl7ne">
                        {getBadgeTypeLabel(badge.requirement_type)}:{" "}
                        {badge.requirement_value}
                      </TableCell>
                      <TableCell data-oid="31p4luc">
                        <Badge
                          variant={
                            badge.tier === "gold"
                              ? "default"
                              : badge.tier === "silver"
                                ? "secondary"
                                : "outline"
                          }
                          data-oid="_8iln8t"
                        >
                          <Award className="h-3 w-3 mr-1" data-oid="4o3x.c-" />
                          {badge.tier.charAt(0).toUpperCase() +
                            badge.tier.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell data-oid="fkrrcoc">
                        {badge.team_id ? "Team" : "Global"}
                      </TableCell>
                      <TableCell className="text-right" data-oid="1fpsalm">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEditBadge(badge)}
                          data-oid="rmkkcuf"
                        >
                          <Edit className="h-4 w-4" data-oid="u8umvfx" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteBadge(badge.id)}
                          data-oid="usn15xj"
                        >
                          <Trash2 className="h-4 w-4" data-oid="rbw_spq" />
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

      {/* Create Badge Dialog */}
      <Dialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        data-oid="l4l:pjt"
      >
        <DialogContent data-oid="qxli973">
          <DialogHeader data-oid="cbuyj:j">
            <DialogTitle data-oid="z1zzzx1">Create New Badge</DialogTitle>
            <DialogDescription data-oid="e7pk_fd">
              Create a new badge for users to earn
            </DialogDescription>
          </DialogHeader>
          {renderBadgeForm(false, handleCreateBadge)}
        </DialogContent>
      </Dialog>

      {/* Edit Badge Dialog */}
      <Dialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        data-oid="wi3slz4"
      >
        <DialogContent data-oid="fw8ufxn">
          <DialogHeader data-oid="qv3yy:b">
            <DialogTitle data-oid="tio44zj">Edit Badge</DialogTitle>
            <DialogDescription data-oid="kgr..pa">
              Update badge details and requirements
            </DialogDescription>
          </DialogHeader>
          {renderBadgeForm(true, handleUpdateBadge)}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
