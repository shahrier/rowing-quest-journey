import { useAuth } from '@/contexts/AuthContext';
import { JourneyProgress } from '@/components/journey/JourneyProgress';
import { ActivityLogger } from '@/components/activities/ActivityLogger';
import { Leaderboard } from '@/components/leaderboard/Leaderboard';
import { MediaUpload } from '@/components/media/MediaUpload';
import { TeamManagement } from '@/components/teams/TeamManagement';
import { BadgeManagement } from '@/components/badges/BadgeManagement';
import { DataExport } from '@/components/admin/DataExport';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Map, Activity, Trophy, Image, Users, Award, FileSpreadsheet } from 'lucide-react';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserProfile {
  role: string;
  team_id: string | null;
}

export function DashboardLayout() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const { data, error } = await supabase
          .from('profiles')
          .select('role, team_id')
          .eq('user_id', user.id)
          .single();

        if (!error && data) {
          setProfile(data);
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (!user || !profile) {
    return <div>Loading...</div>;
  }

  const isAdmin = profile.role === 'admin';
  const isTeamManager = profile.role === 'team_manager';
  const hasTeam = !!profile.team_id;

  return (
    <div className="container mx-auto p-4 space-y-6">
      {!hasTeam && !isAdmin && (
        <div className="text-center p-6 bg-yellow-50 rounded-lg">
          <h2 className="text-lg font-semibold text-yellow-800">Welcome to RowQuest!</h2>
          <p className="text-yellow-700">Please join or create a team to start tracking your progress.</p>
        </div>
      )}

      <Tabs defaultValue="journey" className="space-y-4">
        <TabsList className="grid grid-cols-2 lg:grid-cols-7 gap-2">
          <TabsTrigger value="journey">
            <Map className="w-4 h-4 mr-2" />
            Journey
          </TabsTrigger>
          <TabsTrigger value="activities">
            <Activity className="w-4 h-4 mr-2" />
            Activities
          </TabsTrigger>
          <TabsTrigger value="leaderboard">
            <Trophy className="w-4 h-4 mr-2" />
            Leaderboard
          </TabsTrigger>
          <TabsTrigger value="media">
            <Image className="w-4 h-4 mr-2" />
            Media
          </TabsTrigger>
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="team">
              <Users className="w-4 h-4 mr-2" />
              Team
            </TabsTrigger>
          )}
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="badges">
              <Award className="w-4 h-4 mr-2" />
              Badges
            </TabsTrigger>
          )}
          {(isAdmin || isTeamManager) && (
            <TabsTrigger value="export">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Export
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="journey" className="space-y-4">
          <JourneyProgress />
        </TabsContent>

        <TabsContent value="activities" className="space-y-4">
          <ActivityLogger />
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-4">
          <Leaderboard />
        </TabsContent>

        <TabsContent value="media" className="space-y-4">
          <MediaUpload />
        </TabsContent>

        {(isAdmin || isTeamManager) && (
          <TabsContent value="team" className="space-y-4">
            <TeamManagement />
          </TabsContent>
        )}

        {(isAdmin || isTeamManager) && (
          <TabsContent value="badges" className="space-y-4">
            <BadgeManagement />
          </TabsContent>
        )}

        {(isAdmin || isTeamManager) && (
          <TabsContent value="export" className="space-y-4">
            <DataExport />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
