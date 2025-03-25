import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Medal } from "lucide-react";

interface LeaderboardEntry {
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  total_distance: number;
  total_sessions: number;
}

export function Leaderboard() {
  const { teamId } = useAuth();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [timeframe, setTimeframe] = useState<"week" | "month" | "all">("week");

  useEffect(() => {
    if (teamId) {
      fetchLeaderboardData(timeframe);
    }
  }, [teamId, timeframe]);

  const fetchLeaderboardData = async (period: "week" | "month" | "all") => {
    try {
      setIsLoading(true);

      let query = supabase
        .from("activities")
        .select(
          `
          user_id,
          profiles:user_id (full_name, avatar_url)
        `
        )
        .eq("team_id", teamId);

      // Add date filter based on timeframe
      const now = new Date();
      if (period === "week") {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", weekAgo.toISOString());
      } else if (period === "month") {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        query = query.gte("created_at", monthAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Process data to aggregate by user
      const userMap = new Map<string, LeaderboardEntry>();

      data?.forEach((activity) => {
        const userId = activity.user_id;
        const profile = activity.profiles;

        if (!userMap.has(userId)) {
          userMap.set(userId, {
            user_id: userId,
            full_name: profile.full_name,
            avatar_url: profile.avatar_url,
            total_distance: 0,
            total_sessions: 0,
          });
        }

        const user = userMap.get(userId)!;
        user.total_distance += activity.distance || 0;
        user.total_sessions += 1;
      });

      // Convert map to array and sort by distance
      const leaderboard = Array.from(userMap.values()).sort(
        (a, b) => b.total_distance - a.total_distance
      );

      setLeaderboardData(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getMedalColor = (index: number) => {
    switch (index) {
      case 0:
        return "text-yellow-500";
      case 1:
        return "text-gray-400";
      case 2:
        return "text-amber-700";
      default:
        return "text-transparent";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Leaderboard</CardTitle>
        <CardDescription>See who's leading the team in rowing distance</CardDescription>
        <Tabs
          value={timeframe}
          onValueChange={(value) => setTimeframe(value as "week" | "month" | "all")}
          className="mt-2"
        >
          <TabsList>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="all">All Time</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading leaderboard data...</div>
        ) : leaderboardData.length === 0 ? (
          <div className="text-center py-4">
            No rowing activity recorded for this period
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>Rower</TableHead>
                  <TableHead className="text-right">Distance</TableHead>
                  <TableHead className="text-right">Sessions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboardData.map((entry, index) => (
                  <TableRow key={entry.user_id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        {index < 3 && (
                          <Medal className={`h-5 w-5 mr-1 ${getMedalColor(index)}`} />
                        )}
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback>
                            {getInitials(entry.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{entry.full_name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.total_distance.toLocaleString()} m
                    </TableCell>
                    <TableCell className="text-right">
                      {entry.total_sessions}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}