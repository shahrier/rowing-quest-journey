import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { UserPlus, Mail, UserMinus, Crown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: string;
  total_distance: number;
  strength_sessions: number;
  joined_at: string;
}

export function TeamManagement() {
  const { user, teamId, isAdmin, isTeamManager } = useAuth();
  const { toast } = useToast();
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoteDialogOpen, setIsPromoteDialogOpen] = useState(false);
  const [memberToPromote, setMemberToPromote] = useState<TeamMember | null>(null);

  useEffect(() => {
    if (user && teamId) {
      fetchTeamMembers();
    } else {
      setIsLoading(false);
    }
  }, [user, teamId]);

  const fetchTeamMembers = async () => {
    try {
      setIsLoading(true);
      
      // Get team members
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, role, created_at')
        .eq('team_id', teamId)
        .order('full_name');

      if (profilesError) throw profilesError;
      
      // Get activity stats for each member
      const membersWithStats = await Promise.all(profiles.map(async (profile) => {
        // Get total rowing distance
        const { data: distanceData, error: distanceError } = await supabase
          .from('activities')
          .select('distance')
          .eq('user_id', profile.user_id)
          .eq('activity_type', 'rowing');
          
        if (distanceError) console.error('Error fetching distance:', distanceError);
        
        const totalDistance = distanceData?.reduce((sum, activity) => {
          return sum + (activity.distance || 0);
        }, 0) || 0;
        
        // Get strength sessions count
        const { count: strengthSessions, error: strengthError } = await supabase
          .from('activities')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', profile.user_id)
          .eq('activity_type', 'strength');
          
        if (strengthError) console.error('Error fetching strength sessions:', strengthError);
        
        return {
          ...profile,
          total_distance: totalDistance,
          strength_sessions: strengthSessions || 0,
          joined_at: new Date(profile.created_at).toLocaleDateString(),
        };
      }));
      
      setMembers(membersWithStats);
    } catch (error) {
      console.error('Error fetching team members:', error);
      toast({
        title: 'Error',
        description: 'Failed to load team members',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inviteEmail) {
      toast({
        title: 'Missing email',
        description: 'Please enter an email address',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Check if user exists
      const { data: existingUser, error: userError } = await supabase
        .from('profiles')
        .select('user_id, team_id')
        .eq('email', inviteEmail)
        .single();
        
      if (userError && userError.code !== 'PGRST116') {
        // PGRST116 is "no rows returned" - that's expected if user doesn't exist
        throw userError;
      }
      
      if (existingUser) {
        if (existingUser.team_id) {
          toast({
            title: 'User already in a team',
            description: 'This user is already a member of a team',
            variant: 'destructive',
          });
          return;
        }
        
        // Update existing user's team
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ team_id: teamId })
          .eq('user_id', existingUser.user_id);
          
        if (updateError) throw updateError;
        
        toast({
          title: 'User added to team',
          description: `${inviteEmail} has been added to your team`,
        });
      } else {
        // In a real app, you would send an email invitation
        // For now, just show a message
        toast({
          title: 'Invitation sent',
          description: `An invitation has been sent to ${inviteEmail}`,
        });
      }
      
      // Reset form and close dialog
      setInviteEmail('');
      setIsInviteDialogOpen(false);
      
      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error('Error inviting user:', error);
      toast({
        title: 'Error',
        description: 'Failed to invite user',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ team_id: null })
        .eq('user_id', memberId);
        
      if (error) throw error;
      
      toast({
        title: 'Member removed',
        description: 'The member has been removed from your team',
      });
      
      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error('Error removing member:', error);
      toast({
        title: 'Error',
        description: 'Failed to remove member',
        variant: 'destructive',
      });
    }
  };

  const handlePromoteMember = (member: TeamMember) => {
    setMemberToPromote(member);
    setIsPromoteDialogOpen(true);
  };

  const confirmPromoteMember = async (role: string) => {
    if (!memberToPromote) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('user_id', memberToPromote.user_id);
        
      if (error) throw error;
      
      toast({
        title: 'Role updated',
        description: `${memberToPromote.full_name} is now a ${role === 'team_manager' ? 'Team Manager' : 'User'}`,
      });
      
      // Reset and close dialog
      setMemberToPromote(null);
      setIsPromoteDialogOpen(false);
      
      // Refresh members
      fetchTeamMembers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    }
  };

  if (!isTeamManager && !isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage your team members and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>You need to be a team manager to access this section.</p>
        </CardContent>
      </Card>
    );
  }

  if (!teamId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Team Management</CardTitle>
          <CardDescription>
            Manage your team members and settings
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center py-8">
          <p>You need to be part of a team to manage members.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Team Management</CardTitle>
            <CardDescription>
              Manage your team members and settings
            </CardDescription>
          </div>
          <Button onClick={() => setIsInviteDialogOpen(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Member
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">Loading team members...</div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Distance</TableHead>
                  <TableHead>Strength</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      No team members found
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.user_id}>
                      <TableCell className="font-medium">{member.full_name}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          member.role === 'admin' 
                            ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                            : member.role === 'team_manager'
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {member.role === 'admin' 
                            ? 'Admin' 
                            : member.role === 'team_manager' 
                            ? 'Team Manager' 
                            : 'User'}
                        </span>
                      </TableCell>
                      <TableCell>{member.total_distance.toLocaleString()} m</TableCell>
                      <TableCell>{member.strength_sessions} sessions</TableCell>
                      <TableCell>{member.joined_at}</TableCell>
                      <TableCell className="text-right">
                        {member.user_id !== user?.id && (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handlePromoteMember(member)}
                              title="Change role"
                            >
                              <Crown className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMember(member.user_id)}
                              title="Remove from team"
                            >
                              <UserMinus className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>

      {/* Invite Member Dialog */}
      <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Enter the email address of the person you want to invite to your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleInviteUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <div className="flex">
                <span className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </span>
                <Input
                  id="invite-email"
                  type="email"
                  className="rounded-l-none"
                  placeholder="Enter email address"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Change Role Dialog */}
      <Dialog open={isPromoteDialogOpen} onOpenChange={setIsPromoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              {memberToPromote && `Select a new role for ${memberToPromote.full_name}`}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                defaultValue={memberToPromote?.role} 
                onValueChange={(value) => confirmPromoteMember(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="team_manager">Team Manager</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsPromoteDialogOpen(false)}>
                Cancel
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}