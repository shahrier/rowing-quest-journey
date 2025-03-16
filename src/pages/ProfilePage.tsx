import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Ship, Dumbbell, Award } from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [totalDistance, setTotalDistance] = useState(0);
  const [strengthSessions, setStrengthSessions] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isTeamManager, setIsTeamManager] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchStats();
      fetchUserRole();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('user_id', user?.id)
        .single();

      if (error) throw error;
      
      setFullName(data.full_name || '');
      setEmail(data.email || '');
      setAvatarUrl(data.avatar_url);
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to load profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      // Get total rowing distance
      const { data: distanceData, error: distanceError } = await supabase
        .from('activities')
        .select('distance')
        .eq('user_id', user?.id)
        .eq('activity_type', 'rowing');
        
      if (distanceError) throw distanceError;
      
      const totalDist = distanceData?.reduce((sum, activity) => {
        return sum + (activity.distance || 0);
      }, 0) || 0;
      
      setTotalDistance(totalDist);
      
      // Get strength sessions count
      const { count: strengthCount, error: strengthError } = await supabase
        .from('activities')
        .select('*', { count: 'exact', head: true})
        .eq('user_id', user?.id)
        .eq('activity_type', 'strength');
        
      if (strengthError) throw strengthError;
      
      setStrengthSessions(strengthCount || 0);
      
      // Get badge count
      const { count: badgesCount, error: badgesError } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true})
        .eq('user_id', user?.id);
        
      if (badgesError) throw badgesError;
      
      setBadgeCount(badgesCount || 0);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchUserRole = async () => {
    // Fetch user role from user_roles
    const { data, error } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      setIsAdmin(false);
      setIsTeamManager(false);
      return;
    }

    // Check if the role is valid
    if (!data || !data.role) {
      console.error('No role found for user:', user.id);
      setIsAdmin(false);
      setIsTeamManager(false);
      return;
    }

    // Set admin and team manager status
    const isAdmin = ['admin', 'team_manager'].includes(data.role);
    setIsAdmin(isAdmin);
    setIsTeamManager(data.role === 'team_manager');
    console.log('User role:', data.role, 'Is Admin:', isAdmin);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!fullName) {
      toast({
        title: 'Missing information',
        description: 'Please enter your full name',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
        })
        .eq('user_id', user?.id);

      if (error) throw error;
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    
    // Check file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload an image file',
        variant: 'destructive',
      });
      return;
    }
    
    // Check file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 2MB',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Upload to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `avatar-${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });
        
      if (uploadError) throw uploadError;
      
      // Get the public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      if (!urlData.publicUrl) throw new Error('Failed to get public URL');
      
      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          avatar_url: urlData.publicUrl,
        })
        .eq('user_id', user.id);
        
      if (updateError) throw updateError;
      
      setAvatarUrl(urlData.publicUrl);
      
      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated',
      });
    } catch (error) {
      console.error('Error updating avatar:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile picture',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div>Loading profile...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">My Profile</h1>
        <p className="text-muted-foreground">
          View and update your personal information
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>
              Update your personal details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-4 sm:flex-row">
                  <div className="relative">
                    <Avatar className="h-24 w-24">
                      <AvatarImage src={avatarUrl || undefined} alt={fullName} />
                      <AvatarFallback className="text-2xl">
                        {fullName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="avatar-upload" 
                      className="absolute -bottom-2 -right-2 rounded-full bg-primary p-1.5 text-primary-foreground cursor-pointer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                      </svg>
                      <span className="sr-only">Change avatar</span>
                      <input 
                        id="avatar-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange}
                        disabled={isSubmitting}
                      />
                    </label>
                  </div>
                  <div className="space-y-1 text-center sm:text-left">
                    <h3 className="font-medium text-lg">{fullName}</h3>
                    <p className="text-sm text-muted-foreground">{email}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="full-name">Full Name</Label>
                  <Input
                    id="full-name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed
                  </p>
                </div>
              </div>
              
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Activity Summary</CardTitle>
            <CardDescription>
              Your rowing and training statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full">
                  <Ship className="h-6 w-6 text-blue-700 dark:text-blue-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Distance Rowed</p>
                  <h3 className="text-2xl font-bold">{totalDistance.toLocaleString()} m</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full">
                  <Dumbbell className="h-6 w-6 text-green-700 dark:text-green-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Strength Training Sessions</p>
                  <h3 className="text-2xl font-bold">{strengthSessions}</h3>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="bg-amber-100 dark:bg-amber-900 p-3 rounded-full">
                  <Award className="h-6 w-6 text-amber-700 dark:text-amber-300" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Badges Earned</p>
                  <h3 className="text-2xl font-bold">{badgeCount}</h3>
                </div>
              </div>
              
              <div className="pt-4">
                <Button variant="outline" className="w-full" asChild>
                  <a href="/achievements">View All Achievements</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}