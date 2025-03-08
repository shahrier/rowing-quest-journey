
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/data/types";
import { mockUsers } from "@/data/mockData";
import { Medal } from "lucide-react";

export function TeamRanking() {
  // Sort users by rowing distance in descending order
  const sortedUsers = [...mockUsers].sort(
    (a, b) => b.rowingDistanceKm - a.rowingDistanceKm
  );

  // Take top 5 users
  const topUsers = sortedUsers.slice(0, 5);

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Top Rowers</h3>

      <div className="space-y-3">
        {topUsers.map((user, index) => (
          <RankingItem key={user.id} user={user} rank={index + 1} />
        ))}
      </div>
    </div>
  );
}

interface RankingItemProps {
  user: User;
  rank: number;
}

function RankingItem({ user, rank }: RankingItemProps) {
  // Determine medal color for top 3
  const getMedalColor = () => {
    switch (rank) {
      case 1:
        return "text-yellow-500";
      case 2:
        return "text-gray-400"; // silver
      case 3:
        return "text-amber-700"; // bronze
      default:
        return "text-muted-foreground";
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("");
  };

  return (
    <div className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors">
      {rank <= 3 ? (
        <Medal className={`h-5 w-5 ${getMedalColor()}`} />
      ) : (
        <span className="w-5 text-center text-muted-foreground">{rank}</span>
      )}

      <Avatar className="h-8 w-8">
        <AvatarImage src={user.avatar} />
        <AvatarFallback className="bg-primary/10 text-primary">
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.strengthSessions} sessions</p>
      </div>

      <div className="text-right">
        <p className="text-sm font-semibold">
          {user.rowingDistanceKm.toLocaleString()} km
        </p>
      </div>
    </div>
  );
}
