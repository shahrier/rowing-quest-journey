
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogDistanceForm } from "@/components/forms/LogDistanceForm";
import { LogStrengthForm } from "@/components/forms/LogStrengthForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/data/mockData";

const TrainingPage = () => {
  // Mock training history
  const trainingHistory = [
    { date: '2023-06-20', type: 'rowing', distance: 5000, duration: 25 },
    { date: '2023-06-18', type: 'strength', duration: 45 },
    { date: '2023-06-16', type: 'rowing', distance: 7500, duration: 35 },
    { date: '2023-06-14', type: 'strength', duration: 30 },
    { date: '2023-06-12', type: 'rowing', distance: 10000, duration: 45 },
  ];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Training</h1>
        <p className="text-muted-foreground">
          Log your workouts and track your training history
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Training History</CardTitle>
              <CardDescription>Your recent workouts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="grid grid-cols-10 p-4 font-medium border-b">
                  <div className="col-span-2">Date</div>
                  <div className="col-span-2">Type</div>
                  <div className="col-span-3">Distance</div>
                  <div className="col-span-3">Duration</div>
                </div>
                {trainingHistory.map((session, index) => (
                  <div key={index} className="grid grid-cols-10 p-4 border-b last:border-0">
                    <div className="col-span-2">
                      {new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                    <div className="col-span-2 capitalize">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        session.type === 'rowing' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-purple-100 text-purple-800'
                      }`}>
                        {session.type}
                      </span>
                    </div>
                    <div className="col-span-3">
                      {session.distance ? `${session.distance.toLocaleString()} m` : 'N/A'}
                    </div>
                    <div className="col-span-3">
                      {session.duration} minutes
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
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

export default TrainingPage;
