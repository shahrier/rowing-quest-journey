
import { BarChart2, MapPin, Ship, Users, Dumbbell, Award } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { TeamRanking } from "@/components/dashboard/TeamRanking";
import { JourneyMap } from "@/components/dashboard/JourneyMap";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { LogDistanceForm } from "@/components/forms/LogDistanceForm";
import { LogStrengthForm } from "@/components/forms/LogStrengthForm";
import { TOTAL_JOURNEY_DISTANCE, currentUser, getTeamCompletionPercentage, getTeamTotalDistance, mockUsers } from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Index = () => {
  const totalDistanceRowed = getTeamTotalDistance();
  const completionPercentage = getTeamCompletionPercentage();
  const totalStrengthSessions = mockUsers.reduce((total, user) => total + user.strengthSessions, 0);
  const remainingDistance = TOTAL_JOURNEY_DISTANCE - totalDistanceRowed;
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Welcome back, {currentUser.name}</h1>
        <p className="text-muted-foreground">
          Track your team's rowing journey from Boston to Rotterdam
        </p>
      </div>
      
      <ProgressBar />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Total Distance"
          value={`${totalDistanceRowed.toLocaleString()} km`}
          description={`${(totalDistanceRowed / 12).toFixed(1)} km per person average`}
          icon={Ship}
          trend={{ value: 12, isPositive: true }}
        />
        <StatsCard
          title="Distance Remaining"
          value={`${remainingDistance.toLocaleString()} km`}
          description={`${completionPercentage}% of journey completed`}
          icon={MapPin}
        />
        <StatsCard
          title="Strength Sessions"
          value={totalStrengthSessions}
          description={`${(totalStrengthSessions / 12).toFixed(1)} sessions per person`}
          icon={Dumbbell}
          trend={{ value: 8, isPositive: true }}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <JourneyMap />
          <RecentAchievements />
        </div>
        
        <div className="space-y-6">
          <TeamRanking />
          
          <Tabs defaultValue="rowing">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="rowing">Rowing</TabsTrigger>
              <TabsTrigger value="strength">Strength</TabsTrigger>
            </TabsList>
            <TabsContent value="rowing">
              <LogDistanceForm />
            </TabsContent>
            <TabsContent value="strength">
              <LogStrengthForm />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
