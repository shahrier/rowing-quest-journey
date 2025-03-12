
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { User } from "@/data/types";

const TeamPage = () => {
  // Sort users by rowing distance descending
  const sortedUsers = [...mockUsers].sort((a, b) => b.rowingDistanceM - a.rowingDistanceM);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Team Members</h1>
        <p className="text-muted-foreground">
          Meet the rowers participating in the journey
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Directory</CardTitle>
          <CardDescription>View all team members and their contributions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedUsers.map((user) => (
              <UserCard key={user.id} user={user} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

const UserCard = ({ user }: { user: User }) => {
  const initials = user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();

  return (
    <div className="flex space-x-4 items-start p-4 rounded-lg border shadow-sm">
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback className="bg-ocean-100 text-ocean-800">{initials}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col">
        <h3 className="font-medium">{user.name}</h3>
        <p className="text-sm text-muted-foreground mb-2">Joined {user.joinedAt.toLocaleDateString()}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span>Distance:</span>
            <span className="font-medium">{(user.rowingDistanceM / 1000).toFixed(1)} km</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Strength:</span>
            <span className="font-medium">{user.strengthSessions} sessions</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span>Achievements:</span>
            <span className="font-medium">{user.achievements.length}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamPage;
