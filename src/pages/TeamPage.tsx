
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockUsers } from "@/data/mockData";
import { Separator } from "@/components/ui/separator";
import { User } from "@/data/types";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { getDataMode } from "@/data/dataService";

const TeamPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  
  useEffect(() => {
    const fetchTeamMembers = async () => {
      setIsLoading(true);
      
      try {
        const dataMode = getDataMode();
        
        if (dataMode === 'mock') {
          // Use mock data
          setUsers([...mockUsers].sort((a, b) => b.rowingDistanceM - a.rowingDistanceM));
          setIsLoading(false);
          return;
        }
        
        // Fetch real data from Supabase
        if (user) {
          // First get the user's team
          const { data: memberships } = await supabase
            .from('team_memberships')
            .select('team_id')
            .eq('user_id', user.id)
            .single();
            
          if (memberships) {
            // Get all members of this team
            const { data: teamMembers } = await supabase
              .from('team_memberships')
              .select(`
                user_id,
                profiles:user_id(id, full_name, email, avatar_url)
              `)
              .eq('team_id', memberships.team_id);
              
            if (teamMembers && teamMembers.length > 0) {
              // Convert to User format
              const formattedUsers: User[] = teamMembers.map(member => ({
                id: member.profiles.id,
                name: member.profiles.full_name || 'Anonymous User',
                email: member.profiles.email,
                avatar: member.profiles.avatar_url,
                rowingDistanceM: 0, // We'll need to add a separate table for this
                strengthSessions: 0, // We'll need to add a separate table for this
                achievements: [], 
                joinedAt: new Date()
              }));
              
              setUsers(formattedUsers);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching team members:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamMembers();
  }, [user]);
  
  // Sort users by rowing distance descending
  const sortedUsers = [...users].sort((a, b) => b.rowingDistanceM - a.rowingDistanceM);
  
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
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : sortedUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sortedUsers.map((user) => (
                <UserCard key={user.id} user={user} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No team members found</p>
            </div>
          )}
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
