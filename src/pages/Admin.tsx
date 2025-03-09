
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase, makeUserAdmin } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface UserData {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export default function Admin() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [email, setEmail] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Fetch all users and their roles
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (profilesError) throw profilesError;

        // Get admin status for each user
        const usersWithRoles = await Promise.all(
          profiles.map(async (profile) => {
            const { data: isAdmin } = await supabase.rpc('has_role', {
              _user_id: profile.id,
              _role: 'admin'
            });

            return {
              id: profile.id,
              email: profile.email,
              full_name: profile.full_name,
              is_admin: isAdmin || false,
              created_at: profile.created_at
            };
          })
        );

        setUsers(usersWithRoles);
      } catch (error) {
        console.error('Error fetching users:', error);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleMakeAdmin = async (userId: string) => {
    try {
      const success = await makeUserAdmin(userId);
      
      if (success) {
        toast({
          title: 'Success',
          description: 'User has been promoted to admin',
        });
        
        // Update the local state
        setUsers(users.map(user => 
          user.id === userId ? { ...user, is_admin: true } : user
        ));
      } else {
        throw new Error('Failed to promote user');
      }
    } catch (error) {
      console.error('Error making admin:', error);
      toast({
        title: 'Error',
        description: 'Failed to promote user to admin',
        variant: 'destructive',
      });
    }
  };

  const searchUser = async () => {
    if (!email.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .ilike('email', `%${email}%`);

      if (error) throw error;

      if (data.length === 0) {
        toast({
          title: 'Not found',
          description: 'No users found with that email',
        });
        return;
      }

      // Get admin status for each user
      const usersWithRoles = await Promise.all(
        data.map(async (profile) => {
          const { data: isAdmin } = await supabase.rpc('has_role', {
            _user_id: profile.id,
            _role: 'admin'
          });

          return {
            id: profile.id,
            email: profile.email,
            full_name: profile.full_name,
            is_admin: isAdmin || false,
            created_at: profile.created_at
          };
        })
      );

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error searching:', error);
      toast({
        title: 'Error',
        description: 'Failed to search for users',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] p-4">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">
          Manage users and system settings
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>User Management</CardTitle>
          <CardDescription>Search for users and manage their roles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <Label htmlFor="email-search">Search by email</Label>
              <div className="flex mt-2">
                <Input
                  id="email-search"
                  placeholder="user@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={searchUser} className="ml-2">
                  Search
                </Button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center my-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-ocean-500"></div>
            </div>
          ) : (
            <div className="rounded-md border">
              <div className="grid grid-cols-12 p-4 font-medium border-b">
                <div className="col-span-4">User</div>
                <div className="col-span-3">Email</div>
                <div className="col-span-2">Role</div>
                <div className="col-span-3">Actions</div>
              </div>
              {users.length > 0 ? (
                users.map((user) => (
                  <div key={user.id} className="grid grid-cols-12 p-4 border-b last:border-b-0">
                    <div className="col-span-4 truncate">
                      {user.full_name || 'No name'}
                    </div>
                    <div className="col-span-3 truncate">{user.email}</div>
                    <div className="col-span-2">
                      {user.is_admin ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          User
                        </span>
                      )}
                    </div>
                    <div className="col-span-3">
                      {!user.is_admin && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleMakeAdmin(user.id)}
                        >
                          Make Admin
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  No users found
                </div>
              )}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between"></CardFooter>
      </Card>
    </div>
  );
}
