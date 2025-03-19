import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Award, Dumbbell, Timer } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  total_distance: number;
  strength_sessions: number;
  badge_count: number;
}

export function Leaderboard() {
  const { user } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        // Get user's team
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("team_id")
          .eq("user_id", user?.id)
          .single();

        if (profileError) throw profileError;

        if (profile.team_id) {
          // Get team members' profiles
          const { data: teamMembers, error: teamError } = await supabase
            .from("profiles")
            .select("user_id, full_name")
            .eq("team_id", profile.team_id);

          if (teamError) throw teamError;

          // Process the data to match our LeaderboardEntry interface
          const processedData: LeaderboardEntry[] = [];

          // For each profile, we'll need to get distance, strength sessions and badge count separately
          for (const member of teamMembers || []) {
            // Get total rowing distance
            const { data: distanceData, error: distanceError } = await supabase
              .from("activities")
              .select("distance")
              .eq("user_id", member.user_id)
              .eq("activity_type", "rowing");

            if (distanceError)
              console.error("Error fetching distance:", distanceError);

            // Calculate total distance from the returned data
            const totalDistance =
              distanceData?.reduce((sum, activity) => {
                return sum + (activity.distance || 0);
              }, 0) || 0;

            // Get strength sessions count
            const { count: strengthSessions, error: strengthError } =
              await supabase
                .from("activities")
                .select("*", { count: "exact" })
                .eq("user_id", member.user_id)
                .eq("activity_type", "strength");

            if (strengthError)
              console.error("Error fetching strength sessions:", strengthError);

            // Get badges count
            const { count: badgeCount, error: badgeError } = await supabase
              .from("user_badges")
              .select("*", { count: "exact" })
              .eq("user_id", member.user_id);

            if (badgeError) console.error("Error fetching badges:", badgeError);

            processedData.push({
              user_id: member.user_id,
              full_name: member.full_name || "Unknown",
              total_distance: totalDistance,
              strength_sessions: strengthSessions || 0,
              badge_count: badgeCount || 0,
            });
          }

          setLeaderboardData(processedData);
        }
      } catch (error) {
        console.error("Error fetching leaderboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchLeaderboardData();
    }
  }, [user]);

  if (isLoading) {
    return <div data-oid="djg8a0a">Loading leaderboard...</div>;
  }

  if (!leaderboardData.length) {
    return <div data-oid="fxtbelp">Join a team to view leaderboard</div>;
  }

  const renderLeaderboardRow = (entry: LeaderboardEntry, index: number) => (
    <div
      key={entry.user_id}
      className={`flex items-center justify-between p-3 ${
        index % 2 === 0 ? "bg-gray-50" : "bg-white"
      } ${entry.user_id === user?.id ? "border-l-4 border-primary" : ""}`}
      data-oid="hb8406o"
    >
      <div className="flex items-center space-x-3" data-oid="orj.uk.">
        <span className="font-medium w-8" data-oid="h1a_y6_">
          {index + 1}
        </span>
        <span data-oid="7qvcsoe">{entry.full_name}</span>
      </div>
      <div className="flex items-center space-x-2" data-oid="9tdo2b:">
        {entry.badge_count > 0 && (
          <Badge variant="secondary" data-oid="z6yj0f4">
            <Award className="w-4 h-4 mr-1" data-oid="gm1tf:1" />
            {entry.badge_count}
          </Badge>
        )}
        <span className="text-gray-600" data-oid="qoik980">
          {entry.total_distance}m
        </span>
      </div>
    </div>
  );

  const renderStrengthLeaderboardRow = (
    entry: LeaderboardEntry,
    index: number,
  ) => (
    <div
      key={entry.user_id}
      className={`flex items-center justify-between p-3 ${
        index % 2 === 0 ? "bg-gray-50" : "bg-white"
      } ${entry.user_id === user?.id ? "border-l-4 border-primary" : ""}`}
      data-oid="mfto3:z"
    >
      <div className="flex items-center space-x-3" data-oid="syx5a6d">
        <span className="font-medium w-8" data-oid="yx7d5tr">
          {index + 1}
        </span>
        <span data-oid=".dj4:b:">{entry.full_name}</span>
      </div>
      <div className="flex items-center space-x-2" data-oid=".5vanoo">
        {entry.badge_count > 0 && (
          <Badge variant="secondary" data-oid="oiw1b3f">
            <Award className="w-4 h-4 mr-1" data-oid="6bvkcd8" />
            {entry.badge_count}
          </Badge>
        )}
        <span className="text-gray-600" data-oid="7_s80iy">
          {entry.strength_sessions} sessions
        </span>
      </div>
    </div>
  );

  return (
    <Card data-oid="i8dspbd">
      <CardHeader data-oid="dlmsfob">
        <CardTitle data-oid="0vab3p5">Team Leaderboard</CardTitle>
      </CardHeader>
      <CardContent data-oid="7l3t6ga">
        <Tabs defaultValue="rowing" data-oid="9vrfc9u">
          <TabsList className="grid w-full grid-cols-2" data-oid="gbwi94f">
            <TabsTrigger value="rowing" data-oid="j356mhj">
              <Timer className="w-4 h-4 mr-2" data-oid="n7sg8qb" />
              Rowing Distance
            </TabsTrigger>
            <TabsTrigger value="strength" data-oid="1:d14em">
              <Dumbbell className="w-4 h-4 mr-2" data-oid="q77nzzv" />
              Strength Training
            </TabsTrigger>
          </TabsList>

          <TabsContent value="rowing" className="mt-4" data-oid="wwp72nx">
            <div className="rounded-md border" data-oid="xb43fni">
              {[...leaderboardData]
                .sort((a, b) => b.total_distance - a.total_distance)
                .map(renderLeaderboardRow)}
            </div>
          </TabsContent>

          <TabsContent value="strength" className="mt-4" data-oid="h9uy9sg">
            <div className="rounded-md border" data-oid="df.4klm">
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
