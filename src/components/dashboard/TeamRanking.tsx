import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/data/types";
import { mockUsers } from "@/data/mockData";
import { Medal } from "lucide-react";

export function TeamRanking() {
  // Sort users by rowing distance in descending order
  const sortedUsers = [...mockUsers].sort(
    (a, b) => b.rowingDistanceM - a.rowingDistanceM,
  );

  // Take top 5 users
  const topUsers = sortedUsers.slice(0, 5);

  return (
    <div className="space-y-4" data-oid="c1od5t:">
      <h3 className="font-semibold text-lg" data-oid="j_rlu60">
        Top Rowers
      </h3>

      <div className="space-y-3" data-oid="ned6yxc">
        {topUsers.map((user, index) => (
          <RankingItem
            key={user.id}
            user={user}
            rank={index + 1}
            data-oid="oktahhy"
          />
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
    <div
      className="flex items-center gap-3 p-2 rounded-md hover:bg-muted/50 transition-colors"
      data-oid="5nnx8ov"
    >
      {rank <= 3 ? (
        <Medal className={`h-5 w-5 ${getMedalColor()}`} data-oid="-_i804r" />
      ) : (
        <span
          className="w-5 text-center text-muted-foreground"
          data-oid="-q5t7-6"
        >
          {rank}
        </span>
      )}

      <Avatar className="h-8 w-8" data-oid="l3vjd9n">
        <AvatarImage src={user.avatar} data-oid="ahuu1gc" />
        <AvatarFallback
          className="bg-primary/10 text-primary"
          data-oid=":ixsk1x"
        >
          {getInitials(user.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0" data-oid="or:b0:s">
        <p className="text-sm font-medium truncate" data-oid="m:etmdt">
          {user.name}
        </p>
        <p className="text-xs text-muted-foreground" data-oid="l43jcw2">
          {user.strengthSessions} sessions
        </p>
      </div>

      <div className="text-right" data-oid="plfhrau">
        <p className="text-sm font-semibold" data-oid="8u4h.sv">
          {user.rowingDistanceM.toLocaleString()} m
        </p>
      </div>
    </div>
  );
}
