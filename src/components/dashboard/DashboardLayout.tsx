import { useAuth } from "@/contexts/AuthContext";
import { JourneyProgress } from "@/components/journey/JourneyProgress";
import { ActivityLogger } from "@/components/activities/ActivityLogger";
import { Leaderboard } from "@/components/leaderboard/Leaderboard";
import { MediaUpload } from "@/components/media/MediaUpload";
import { TeamManagement } from "@/components/teams/TeamManagement";
import { BadgeManagement } from "@/components/badges/BadgeManagement";
import { DataExport } from "@/components/admin/DataExport";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Map,
  Activity,
  Trophy,
  Image,
  Users,
  Award,
  FileSpreadsheet,
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface UserProfile {
  role: string;
  team_id: string | null;
}

export function DashboardLayout() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from("profiles")
          .select("role, team_id")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (!user || !profile) {
    return <div data-oid="_neyl0a">Loading...</div>;
  }

  const isAdmin = profile.role === "admin";
  const isTeamManager = profile.role === "team_manager";
  const hasTeam = !!profile.team_id;

  return (
    <div className="container mx-auto p-4 space-y-6" data-oid="56q68j:">
      {!hasTeam && !isAdmin && (
        <div
          className="text-center p-6 bg-yellow-50 rounded-lg"
          data-oid="qls2hkx"
        >
          <h2
            className="text-lg font-semibold text-yellow-800"
            data-oid="syk464f"
          >
            Welcome to RowQuest!
          </h2>
          <p className="text-yellow-700" data-oid="jydrue0">
            Please join or create a team to start tracking your progress.
          </p>
        </div>
      )}

      <Tabs defaultValue="journey" className="space-y-4" data-oid="bb08z3-">
        <TabsList
          className="grid grid-cols-2 lg:grid-cols-7 gap-2"
          data-oid="aorfva7"
        >
          <TabsTrigger value="journey" data-oid="t-07fns">
            <Map className="w-4 h-4 mr-2" data-oid="wjmgfxc" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="activities" data-oid="jlkwr2j">
            <Activity className="w-4 h-4 mr-2" data-oid="2q6u3m2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="leaderboard" data-oid="kvemzt2">
            <Trophy className="w-4 h-4 mr-2" data-oid="pge3ebk" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="media" data-oid="i7qunc_">
            <Image className="w-4 h-4 mr-2" data-oid="6affooj" />
            Media
          </TabsTrigger>
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="team" data-oid="moq5hem">
              <Users className="w-4 h-4 mr-2" data-oid="q-sorqs" />
              Team
            </TabsTrigger>
          )}
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="badges" data-oid="kw-brys">
              <Award className="w-4 h-4 mr-2" data-oid="8x8nj9e" />
              Badges
            </TabsTrigger>
          )}
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="export" data-oid="3n277e5">
              <FileSpreadsheet className="w-4 h-4 mr-2" data-oid="h4y8cwb" />
              Export
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="journey" className="space-y-4" data-oid="scjskmq">
          <JourneyProgress data-oid="gpnxq0u" />
        </TabsContent>

        <TabsContent
          value="activities"
          className="space-y-4"
          data-oid="y28.b2y"
        >
          <ActivityLogger data-oid="93ruuco" />
        </TabsContent>

        <TabsContent
          value="leaderboard"
          className="space-y-4"
          data-oid="unqms5z"
        >
          <Leaderboard data-oid="-.hy177" />
        </TabsContent>

        <TabsContent value="media" className="space-y-4" data-oid="mvtt-i5">
          <MediaUpload data-oid="ymrsc7m" />
        </TabsContent>

        {(isAdmin || isTeamManager) && (
          <TabsContent value="team" className="space-y-4" data-oid="s7ae7px">
            <TeamManagement data-oid="44_q3zx" />
          </TabsContent>
        )}

        {(isAdmin || isTeamManager) && (
          <TabsContent value="badges" className="space-y-4" data-oid="iu43ib-">
            <BadgeManagement data-oid="u1fp0x8" />
          </TabsContent>
        )}

        {(isAdmin || isTeamManager) && (
          <TabsContent value="export" className="space-y-4" data-oid="qm4a1-n">
            <DataExport data-oid="3swq_3w" />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
