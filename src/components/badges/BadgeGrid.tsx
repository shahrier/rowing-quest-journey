import { useEffect, useState } from "react";
import { Badge } from "./Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/lib/supabase";
import { BadgeTier } from "@/lib/supabase-types";

interface BadgeItem {
  id: string;
  name: string;
  description: string;
  tier: BadgeTier;
  earned: boolean;
  earned_at?: string;
}

export function BadgeGrid() {
  const { user } = useAuth();
  const [badges, setBadges] = useState<BadgeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBadges = async () => {
      if (!user) return;

      try {
        // This is a mock implementation - in a real app, you would fetch from Supabase
        // For now, we'll use static data
        const mockBadges: BadgeItem[] = [
          {
            id: "1",
            name: "5km Rowed",
            description: "Row 5km in a single session",
            tier: "bronze",
            earned: true,
            earned_at: new Date().toISOString(),
          },
          {
            id: "2",
            name: "10km Rowed",
            description: "Row 10km in a single session",
            tier: "silver",
            earned: false,
          },
          {
            id: "3",
            name: "20km Rowed",
            description: "Row 20km in a single session",
            tier: "gold",
            earned: false,
          },
          {
            id: "4",
            name: "10 Strength Sessions",
            description: "Complete 10 strength training sessions",
            tier: "bronze",
            earned: true,
            earned_at: new Date(
              Date.now() - 7 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
          {
            id: "5",
            name: "20 Strength Sessions",
            description: "Complete 20 strength training sessions",
            tier: "silver",
            earned: false,
          },
          {
            id: "6",
            name: "Team Player",
            description: "Contribute 50km to your team goal",
            tier: "bronze",
            earned: true,
            earned_at: new Date(
              Date.now() - 14 * 24 * 60 * 60 * 1000,
            ).toISOString(),
          },
        ];

        setBadges(mockBadges);
      } catch (error) {
        console.error("Error fetching badges:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBadges();
  }, [user]);

  if (isLoading) {
    return <div data-oid="2xbd.s3">Loading badges...</div>;
  }

  const earnedBadges = badges.filter((badge) => badge.earned);
  const availableBadges = badges.filter((badge) => !badge.earned);

  return (
    <Card data-oid="adtzx:1">
      <CardHeader data-oid="jutpjlf">
        <CardTitle data-oid="plaa_jk">Badges & Achievements</CardTitle>
      </CardHeader>
      <CardContent data-oid="ax28n6y">
        <Tabs defaultValue="earned" data-oid="8s9s314">
          <TabsList className="grid w-full grid-cols-2" data-oid="2oqtxqw">
            <TabsTrigger value="earned" data-oid="60x538s">
              Earned ({earnedBadges.length})
            </TabsTrigger>
            <TabsTrigger value="available" data-oid="dak3vey">
              Available ({availableBadges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="earned" className="mt-4" data-oid="hze6l0-">
            {earnedBadges.length === 0 ? (
              <p
                className="text-center text-muted-foreground py-6"
                data-oid="vm54v.v"
              >
                You haven't earned any badges yet. Keep training to unlock
                achievements!
              </p>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                data-oid="4w7yrp-"
              >
                {earnedBadges.map((badge) => (
                  <Badge
                    key={badge.id}
                    name={badge.name}
                    description={badge.description}
                    tier={badge.tier}
                    earned={true}
                    data-oid="qo-l_ie"
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available" className="mt-4" data-oid="bok52jh">
            {availableBadges.length === 0 ? (
              <p
                className="text-center text-muted-foreground py-6"
                data-oid="y:i30jh"
              >
                Congratulations! You've earned all available badges.
              </p>
            ) : (
              <div
                className="grid grid-cols-2 sm:grid-cols-3 gap-4"
                data-oid="lhrs-by"
              >
                {availableBadges.map((badge) => (
                  <Badge
                    key={badge.id}
                    name={badge.name}
                    description={badge.description}
                    tier={badge.tier}
                    earned={false}
                    data-oid="6rllojn"
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
