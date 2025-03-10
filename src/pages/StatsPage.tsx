
import { BarChart, BarChartHorizontal, LineChart, PieChart } from "lucide-react";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { mockUsers, getTeamTotalDistance, TOTAL_JOURNEY_DISTANCE_KM } from "@/data/mockData";
import { ProgressBar } from "@/components/dashboard/ProgressBar";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart as RechartsBarChart, Bar, Cell } from "recharts";

const StatsPage = () => {
  const totalDistanceRowedKm = getTeamTotalDistance();
  const totalRowingDistanceM = mockUsers.reduce((sum, user) => sum + user.rowingDistanceM, 0);
  const avgDistancePerPersonM = totalRowingDistanceM / mockUsers.length;
  const totalStrengthSessions = mockUsers.reduce((sum, user) => sum + user.strengthSessions, 0);
  const avgStrengthPerPerson = totalStrengthSessions / mockUsers.length;
  
  // Create sample data for charts
  const monthlyProgress = [
    { name: "Jan", distance: 550 },
    { name: "Feb", distance: 1200 },
    { name: "Mar", distance: 1800 },
    { name: "Apr", distance: 2100 },
    { name: "May", distance: 2600 },
    { name: "Jun", distance: totalDistanceRowedKm },
  ];
  
  const userContributions = mockUsers.map(user => ({
    name: user.name.split(' ')[0],
    distance: user.rowingDistanceM / 1000,
    color: `hsl(${Math.random() * 360}, 80%, 50%)`,
  })).sort((a, b) => b.distance - a.distance).slice(0, 10);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Statistics</h1>
        <p className="text-muted-foreground">
          Detailed performance metrics and team analytics
        </p>
      </div>
      
      <ProgressBar />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          title="Team Distance"
          value={`${totalRowingDistanceM.toLocaleString()} m`}
          description={`${Math.round(avgDistancePerPersonM).toLocaleString()} m per person average`}
          icon={BarChart}
        />
        <StatsCard
          title="Completion"
          value={`${Math.round((totalDistanceRowedKm / TOTAL_JOURNEY_DISTANCE_KM) * 100)}%`}
          description={`${(TOTAL_JOURNEY_DISTANCE_KM - totalDistanceRowedKm).toLocaleString()} km remaining`}
          icon={PieChart}
        />
        <StatsCard
          title="Strength Training"
          value={totalStrengthSessions.toString()}
          description={`${avgStrengthPerPerson.toFixed(1)} sessions per person`}
          icon={BarChartHorizontal}
        />
      </div>
      
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">Monthly Progress</TabsTrigger>
          <TabsTrigger value="contributions">Top Contributors</TabsTrigger>
        </TabsList>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle>Distance Progression</CardTitle>
              <CardDescription>Total distance rowed over time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyProgress}>
                    <defs>
                      <linearGradient id="colorDistance" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--ocean-500))" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="hsl(var(--ocean-500))" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} km`, 'Distance']}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="distance" 
                      stroke="hsl(var(--ocean-600))" 
                      fillOpacity={1} 
                      fill="url(#colorDistance)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="contributions">
          <Card>
            <CardHeader>
              <CardTitle>Top Contributors</CardTitle>
              <CardDescription>Individual rowing distances</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    layout="vertical"
                    data={userContributions}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 50,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis type="category" dataKey="name" />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toLocaleString()} km`, 'Distance']}
                    />
                    <Bar dataKey="distance">
                      {userContributions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StatsPage;
