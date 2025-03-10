
import { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { currentUser } from "@/data/mockData";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ProfilePage = () => {
  const { toast } = useToast();
  const [user, setUser] = useState({
    name: currentUser.name,
    email: currentUser.email,
    bio: "Rowing enthusiast and team player. Love the open water and challenging myself."
  });
  
  const initials = user.name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase();
    
  const handleSaveProfile = () => {
    // In a real app, this would save to a backend
    toast({
      title: "Profile updated",
      description: "Your profile has been updated successfully."
    });
  };
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          Manage your account information and preferences
        </p>
      </div>
      
      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="stats">My Stats</TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <div className="flex gap-4 items-center">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={currentUser.avatar} alt={user.name} />
                  <AvatarFallback className="bg-ocean-100 text-ocean-800 text-xl">{initials}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle>{user.name}</CardTitle>
                  <CardDescription>Member since {currentUser.joinedAt.toLocaleDateString()}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input 
                      id="name"
                      value={user.name}
                      onChange={(e) => setUser({...user, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email"
                      value={user.email}
                      onChange={(e) => setUser({...user, email: e.target.value})}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea 
                    id="bio"
                    className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={user.bio}
                    onChange={(e) => setUser({...user, bio: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>My Rowing Statistics</CardTitle>
              <CardDescription>Your personal performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                  title="Total Distance" 
                  value={`${(currentUser.rowingDistanceM / 1000).toFixed(1)} km`} 
                  subtitle="Distance rowed to date"
                  color="bg-blue-100 text-blue-800"
                />
                <StatCard 
                  title="Strength Sessions" 
                  value={currentUser.strengthSessions.toString()}
                  subtitle="Total completed"
                  color="bg-purple-100 text-purple-800"
                />
                <StatCard 
                  title="Achievements" 
                  value={currentUser.achievements.length.toString()}
                  subtitle="Unlocked badges"
                  color="bg-amber-100 text-amber-800"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

const StatCard = ({ title, value, subtitle, color }: { title: string, value: string, subtitle: string, color: string }) => (
  <div className="border rounded-lg p-4 shadow-sm">
    <div className="text-sm font-medium text-gray-500">{title}</div>
    <div className="mt-2 text-3xl font-semibold">{value}</div>
    <div className="mt-1 text-xs text-gray-500">{subtitle}</div>
    <div className={`mt-2 h-1 w-16 rounded ${color}`}></div>
  </div>
);

export default ProfilePage;
