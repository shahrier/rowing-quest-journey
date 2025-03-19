import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { achievements, mockUsers } from "@/data/mockData";
import { Award, Dumbbell, Droplet, Medal } from "lucide-react";

export function RecentAchievements() {
  // Create a list of recently unlocked achievements
  const recentUnlocks = [
    {
      userId: "u3",
      achievementId: "a4",
      unlockedAt: new Date("2023-05-10"),
    },
    {
      userId: "u7",
      achievementId: "a3",
      unlockedAt: new Date("2023-05-08"),
    },
    {
      userId: "u2",
      achievementId: "a2",
      unlockedAt: new Date("2023-05-05"),
    },
  ];

  // Get icon component based on icon name
  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "droplet":
        return Droplet;
      case "dumbbell":
        return Dumbbell;
      case "award":
        return Award;
      case "medal":
        return Medal;
      default:
        return Award;
    }
  };

  return (
    <Card data-oid="bhjibme">
      <CardHeader data-oid=".td6_j9">
        <CardTitle className="text-lg" data-oid="nkslo1s">
          Recent Achievements
        </CardTitle>
        <CardDescription data-oid="3.t:qa-">
          Latest team accomplishments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4" data-oid="r46m26.">
        {recentUnlocks.map((unlock) => {
          const user = mockUsers.find((u) => u.id === unlock.userId);
          const achievement = achievements.find(
            (a) => a.id === unlock.achievementId,
          );

          if (!user || !achievement) return null;

          const IconComponent = getIconComponent(achievement.icon);

          return (
            <div
              key={`${unlock.userId}-${unlock.achievementId}`}
              className="flex items-center gap-3"
              data-oid="r0.4.nr"
            >
              <Avatar className="h-9 w-9" data-oid="6w_m756">
                <AvatarImage src={user.avatar} data-oid="xaw_-tl" />
                <AvatarFallback
                  className="bg-primary/10 text-primary"
                  data-oid=".m797-g"
                >
                  {user.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0" data-oid="2mtz4wi">
                <p className="text-sm font-medium" data-oid="1mqz6b6">
                  {user.name}
                </p>
                <div
                  className="flex items-center gap-1 text-xs text-muted-foreground"
                  data-oid="ml-q_.w"
                >
                  <IconComponent
                    className="h-3 w-3 text-energy-500"
                    data-oid="s54g2i5"
                  />

                  <span data-oid=".dicgia">Unlocked "{achievement.name}"</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground" data-oid="g5_iauq">
                {new Date(unlock.unlockedAt).toLocaleDateString()}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
