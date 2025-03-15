import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Badge, BadgeTier } from '@/lib/supabase-types';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const REQUIREMENT_TYPES = [
  { value: 'rowing_distance', label: 'Rowing Distance (meters)' },
  { value: 'strength_sessions', label: 'Strength Training Sessions' },
];

const BADGE_TIERS: { value: BadgeTier; label: string }[] = [
  { value: 'bronze', label: 'Bronze' },
  { value: 'silver', label: 'Silver' },
  { value: 'gold', label: 'Gold' },
];

export function BadgeManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [badgeName, setBadgeName] = useState('');
  const [description, setDescription] = useState('');
  const [requirementType, setRequirementType] = useState('');
  const [requirementValue, setRequirementValue] = useState('');
  const [tier, setTier] = useState<BadgeTier>('bronze');
  const [isGlobalBadge, setIsGlobalBadge] = useState(false);

  const handleCreateBadge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!badgeName.trim() || !requirementType || !requirementValue) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);

      // Get user's team and role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('team_id, role')
        .eq('user_id', user?.id)
        .single();

      if (profileError) throw profileError;

      // Check if user has permission to create badge
      if (isGlobalBadge && profile.role !== 'admin') {
        toast({
          title: 'Error',
          description: 'Only admins can create global badges',
          variant: 'destructive',
        });
        return;
      }

      if (!isGlobalBadge && profile.role !== 'team_manager' && profile.role !== 'admin') {
        toast({
          title: 'Error',
          description: 'Only team managers can create team badges',
          variant: 'destructive',
        });
        return;
      }

      // Create the badge
      const { error: badgeError } = await supabase
        .from('badges')
        .insert({
          name: badgeName,
          description,
          requirement_type: requirementType,
          requirement_value: parseInt(requirementValue),
          tier,
          team_id: isGlobalBadge ? null : profile.team_id,
          created_by: user?.id,
        });

      if (badgeError) throw badgeError;

      toast({
        title: 'Success',
        description: 'Badge created successfully',
      });

      // Reset form
      setBadgeName('');
      setDescription('');
      setRequirementType('');
      setRequirementValue('');
      setTier('bronze');
    } catch (error) {
      console.error('Error creating badge:', error);
      toast({
        title: 'Error',
        description: 'Failed to create badge',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Badge</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreateBadge} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="badgeName">Badge Name</Label>
            <Input
              id="badgeName"
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              placeholder="Enter badge name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter badge description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirementType">Requirement Type</Label>
            <Select value={requirementType} onValueChange={setRequirementType}>
              <SelectTrigger>
                <SelectValue placeholder="Select requirement type" />
              </SelectTrigger>
              <SelectContent>
                {REQUIREMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="requirementValue">Requirement Value</Label>
            <Input
              id="requirementValue"
              type="number"
              value={requirementValue}
              onChange={(e) => setRequirementValue(e.target.value)}
              placeholder="Enter requirement value"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tier">Badge Tier</Label>
            <Select value={tier} onValueChange={(value) => setTier(value as BadgeTier)}>
              <SelectTrigger>
                <SelectValue placeholder="Select badge tier" />
              </SelectTrigger>
              <SelectContent>
                {BADGE_TIERS.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={isGlobalBadge}
                onChange={(e) => setIsGlobalBadge(e.target.checked)}
                className="form-checkbox"
              />
              <span>Create as Global Badge (Admin only)</span>
            </Label>
          </div>

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Badge'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
