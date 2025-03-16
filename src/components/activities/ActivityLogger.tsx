import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RowingIcon, Dumbbell, Clock, CalendarIcon, Trash2 } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';

interface Activity {
  id: string;
  activity_type: 'rowing' | 'strength';
  distance: number | null;
  duration: number | null;
  notes: string | null;
  created_at: string;
}

export function ActivityLogger() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'rowing' | 'strength'>('rowing');
  
  // Form states
  const [rowingDistance, setRowingDistance] = useState('');
  const [rowingDuration, setRowingDuration] = useState('');
  const [rowingNotes, setRowingNotes] =useState('');
  const [rowingDate, setRowingDate] = useState<Date>(new Date());
  const [isRowingDateOpen, setIsRowingDateOpen] = useState(false);
  
  const [strengthDuration, setStrengthDuration] = useState('');
  const [strengthNotes, setStrengthNotes] = useState('');
  const [strengthDate, setStrengthDate] = useState<Date>(new Date());
  const [isStrengthDateOpen, setIsStrengthDateOpen] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchActivities();
    }
  }, [user]);

  const fetchActivities = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error('Error fetching activities:', error);
      toast({
        title: 'Error',
        description: 'Failed to load your activities',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogRowing = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rowingDistance) {
      toast({
        title: 'Missing information',
        description: 'Please enter a distance',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create activity
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          activity_type: 'rowing',
          distance: parseFloat(rowingDistance),
          duration: rowingDuration ? parseFloat(rowingDuration) : null,
          notes: rowingNotes || null,
          created_at: rowingDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Update team's total distance
      await updateTeamDistance(parseFloat(rowingDistance));

      // Check for badge achievements
      await checkForBadges('rowing', parseFloat(rowingDistance));

      toast({
        title: 'Activity logged',
        description: `You've logged ${rowingDistance}m of rowing`,
      });

      // Reset form
      setRowingDistance('');
      setRowingDuration('');
      setRowingNotes('');
      setRowingDate(new Date());
      
      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error('Error logging rowing activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to log your activity',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogStrength = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!strengthDuration) {
      toast({
        title: 'Missing information',
        description: 'Please enter a duration',
        variant: 'destructive',
      });
      return;
    }
    
    setIsSubmitting(true);
    try {
      // Create activity
      const { data, error } = await supabase
        .from('activities')
        .insert({
          user_id: user?.id,
          activity_type: 'strength',
          distance: null,
          duration: parseFloat(strengthDuration),
          notes: strengthNotes || null,
          created_at: strengthDate.toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      // Check for badge achievements
      await checkForBadges('strength');

      toast({
        title: 'Activity logged',
        description: `You've logged ${strengthDuration} minutes of strength training`,
      });

      // Reset form
      setStrengthDuration('');
      setStrengthNotes('');
      setStrengthDate(new Date());
      
      // Refresh activities
      fetchActivities();
    } catch (error) {
      console.error('Error logging strength activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to log your activity',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteActivity = async () => {
    if (!activityToDelete) return;
    
    try {
      // Get the activity details first to handle team distance updates
      const { data: activity, error: fetchError } = await supabase
        .from('activities')
        .select('*')
        .eq('id', activityToDelete)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Delete the activity
      const { error } = await supabase
        .from('activities')
        .delete()
        .eq('id', activityToDelete);

      if (error) throw error;
      
      // If it was a rowing activity, update team distance
      if (activity.activity_type === 'rowing' && activity.distance) {
        await updateTeamDistance(-activity.distance); // Subtract the distance
      }

      toast({
        title: 'Activity deleted',
        description: 'Your activity has been deleted',
      });
      
      // Refresh activities
      fetchActivities();
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete your activity',
        variant: 'destructive',
      });
    }
  };

  const updateTeamDistance = async (distanceChange: number) => {
    try {
      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('user_id', user?.id)
        .single();

      if (profileError || !profile.team_id) return;

      // Update team's current distance
      const { error } = await supabase.rpc('update_team_distance', {
        team_id_param: profile.team_id,
        distance_change: distanceChange / 1000, // Convert meters to km
      });

      if (error) {
        console.error('Error updating team distance:', error);
      }
    } catch (error) {
      console.error('Error in updateTeamDistance:', error);
    }
  };

  const checkForBadges = async (activityType: 'rowing' | 'strength', distance?: number) => {
    try {
      // Get user's team
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id')
        .eq('user_id', user?.id)
        .single();

      if (profileError) return;

      // Get relevant badges based on activity type
      let query = supabase.from('badges').select('*');
      
      if (activityType === 'rowing') {
        query = query.eq('requirement_type', 'rowing_distance');
      } else if (activityType === 'strength') {
        query = query.eq('requirement_type', 'strength_sessions');
      }
      
      // Filter to include global badges and team-specific badges
      query = query.or(`team_id.is.null,team_id.eq.${profile.team_id || 'null'}`);
      
      const { data: badges, error: badgesError } = await query;
      
      if (badgesError || !badges || badges.length === 0) return;
      
      // Check each badge requirement
      for (const badge of badges) {
        if (activityType === 'rowing' && badge.requirement_type === 'rowing_distance') {
          // For rowing distance badges, check if this single activity meets the requirement
          if (distance && distance >= badge.requirement_value) {
            await awardBadge(badge.id);
          }
        } else if (activityType === 'strength' && badge.requirement_type === 'strength_sessions') {
          // For strength session badges, count total sessions
          const { count, error: countError } = await supabase
            .from('activities')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', user?.id)
            .eq('activity_type', 'strength');
            
          if (!countError && count && count >= badge.requirement_value) {
            await awardBadge(badge.id);
          }
        }
      }
    } catch (error) {
      console.error('Error checking for badges:', error);
    }
  };

  const awardBadge = async (badgeId: string) => {
    try {
      // Check if user already has this badge
      const { count, error: countError } = await supabase
        .from('user_badges')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user?.id)
        .eq('badge_id', badgeId);
        
      if (countError || count) return; // Already has badge or error
      
      // Award the badge
      const { error } = await supabase
        .from('user_badges')
        .insert({
          user_id: user?.id,
          badge_id: badgeId,
        });
        
      if (error) {
        console.error('Error awarding badge:', error);
        return;
      }
      
      // Get badge details for notification
      const { data: badge, error: badgeError } = await supabase
        .from('badges')
        .select('name, tier')
        .eq('id', badgeId)
        .single();
        
      if (badgeError) return;
      
      // Notify user
      toast({
        title: '🏆 New Badge Earned!',
        description: `You've earned the ${badge.tier} badge: ${badge.name}`,
      });
    } catch (error) {
      console.error('Error in awardBadge:', error);
    }
  };

  const confirmDelete = (activityId: string) => {
    setActivityToDelete(activityId);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Log Your Activities</CardTitle>
        <CardDescription>
          Track your rowing and strength training progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'rowing' | 'strength')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="rowing">
              <RowingIcon className="h-4 w-4 mr-2" />
              Rowing
            </TabsTrigger>
            <TabsTrigger value="strength">
              <Dumbbell className="h-4 w-4 mr-2" />
              Strength Training
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="rowing" className="space-y-4">
            <form onSubmit={handleLogRowing} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="rowing-distance">Distance (meters)</Label>
                  <Input
                    id="rowing-distance"
                    type="number"
                    placeholder="Enter distance in meters"
                    value={rowingDistance}
                    onChange={(e) => setRowingDistance(e.target.value)}
                    min="1"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="rowing-duration">Duration (minutes)</Label>
                  <Input
                    id="rowing-duration"
                    type="number"
                    placeholder="Optional"
                    value={rowingDuration}
                    onChange={(e) => setRowingDuration(e.target.value)}
                    min="1"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rowing-date">Date</Label>
                <Popover open={isRowingDateOpen} onOpenChange={setIsRowingDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rowingDate ? format(rowingDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={rowingDate}
                      onSelect={(date) => {
                        setRowingDate(date || new Date());
                        setIsRowingDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="rowing-notes">Notes</Label>
                <Textarea
                  id="rowing-notes"
                  placeholder="Optional notes about your rowing session"
                  value={rowingNotes}
                  onChange={(e) => setRowingNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Log Rowing Activity'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="strength" className="space-y-4">
            <form onSubmit={handleLogStrength} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="strength-duration">Duration (minutes)</Label>
                <Input
                  id="strength-duration"
                  type="number"
                  placeholder="Enter duration in minutes"
                  value={strengthDuration}
                  onChange={(e) => setStrengthDuration(e.target.value)}
                  min="1"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strength-date">Date</Label>
                <Popover open={isStrengthDateOpen} onOpenChange={setIsStrengthDateOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {strengthDate ? format(strengthDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={strengthDate}
                      onSelect={(date) => {
                        setStrengthDate(date || new Date());
                        setIsStrengthDateOpen(false);
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="strength-notes">Notes</Label>
                <Textarea
                  id="strength-notes"
                  placeholder="Describe your strength training (e.g., kettlebell swings, core workouts)"
                  value={strengthNotes}
                  onChange={(e) => setStrengthNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Logging...' : 'Log Strength Activity'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8">
          <h3 className="text-lg font-medium mb-4">Recent Activities</h3>
          {isLoading ? (
            <div className="text-center py-4">Loading activities...</div>
          ) : activities.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              You haven't logged any activities yet
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Details</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {activity.activity_type === 'rowing' ? (
                          <span className="flex items-center">
                            <RowingIcon className="h-4 w-4 mr-2" />
                            Rowing
                          </span>
                        ) : (
                          <span className="flex items-center">
                            <Dumbbell className="h-4 w-4 mr-2" />
                            Strength
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {activity.activity_type === 'rowing' ? (
                          <div>
                            <div>{activity.distance}m</div>
                            {activity.duration && (
                              <div className="text-sm text-muted-foreground flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {activity.duration} min
                              </div>
                            )}
                          </div>
                        ) : (
                          <div>
                            <div>{activity.duration} min</div>
                            {activity.notes && (
                              <div className="text-sm text-muted-foreground">
                                {activity.notes}
                              </div>
                            )}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => confirmDelete(activity.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Activity</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this activity? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteActivity}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}