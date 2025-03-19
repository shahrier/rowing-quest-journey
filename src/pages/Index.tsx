import { BarChart2, MapPin, Ship, Users, Dumbbell, Award } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { TeamRanking } from "@/components/dashboard/TeamRanking";
import { JourneyMap } from "@/components/dashboard/JourneyMap";
import { RecentAchievements } from "@/components/dashboard/RecentAchievements";
import { LogDistanceForm } from "@/components/forms/LogDistanceForm";
import { LogStrengthForm } from "@/components/forms/LogStrengthForm";
import {
  TOTAL_JOURNEY_DISTANCE_KM,
  currentUser,
  getTeamCompletionPercentage,
  getTeamTotalDistance,
  mockUsers,
} from "@/data/mockData";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAdminCheck } from "@/hooks/use-admin-check";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

const Index = () => {
  // Check and fix admin status for shahrier@gmail.com
  useAdminCheck();

  const totalDistanceRowedKm = getTeamTotalDistance();
  const completionPercentage = getTeamCompletionPercentage();
  const totalStrengthSessions = mockUsers.reduce(
    (total, user) => total + user.strengthSessions,
    0,
  );
  const remainingDistanceKm = TOTAL_JOURNEY_DISTANCE_KM - totalDistanceRowedKm;
  const totalDistanceRowedM = totalDistanceRowedKm * 1000;

  return (
    <div className="space-y-6" data-oid="pocqsrj">
      <div data-oid="kx0t59l">
        <h1 className="text-3xl font-bold mb-2" data-oid="1ttegd6">
          Welcome back, {currentUser.name}
        </h1>
        <p className="text-muted-foreground" data-oid="ed2.jgs">
          Track your team's rowing journey from Boston to Rotterdam
        </p>
      </div>

      <ProgressBar data-oid="cs36hbl" />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4" data-oid="27:qcl9">
        <StatsCard
          title="Total Distance"
          value={`${totalDistanceRowedM.toLocaleString()} m`}
          description={`${Math.round(totalDistanceRowedM / mockUsers.length).toLocaleString()} m per person average`}
          icon={Ship}
          trend={{ value: 12, isPositive: true }}
          data-oid="xjbn55h"
        />

        <StatsCard
          title="Distance Remaining"
          value={`${(remainingDistanceKm * 1000).toLocaleString()} m`}
          description={`${completionPercentage}% of journey completed`}
          icon={MapPin}
          data-oid="lil0bie"
        />

        <StatsCard
          title="Strength Sessions"
          value={totalStrengthSessions}
          description={`${(totalStrengthSessions / mockUsers.length).toFixed(1)} sessions per person`}
          icon={Dumbbell}
          trend={{ value: 8, isPositive: true }}
          data-oid="s02zl5i"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" data-oid="71isorj">
        <div className="lg:col-span-2 space-y-6" data-oid="m7-ylax">
          <JourneyMap data-oid=".7op6la" />
          <RecentAchievements data-oid="r5c9si9" />
        </div>

        <div className="space-y-6" data-oid="xj318mt">
          <TeamRanking data-oid="r_lg.lm" />

          <Tabs defaultValue="rowing" data-oid="g96p:px">
            <TabsList className="grid grid-cols-2 mb-4" data-oid="3pqw54-">
              <TabsTrigger value="rowing" data-oid="muqf.36">
                Rowing
              </TabsTrigger>
              <TabsTrigger value="strength" data-oid="_.5jlgw">
                Strength
              </TabsTrigger>
            </TabsList>
            <TabsContent value="rowing" data-oid="keuvxs:">
              <LogDistanceForm data-oid="7nt:fbl" />
            </TabsContent>
            <TabsContent value="strength" data-oid="vrp10b8">
              <LogStrengthForm data-oid="lgy7c7i" />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Index;
