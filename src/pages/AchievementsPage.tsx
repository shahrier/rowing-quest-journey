
import { Award, CheckCircle, Circle } from "lucide-react";
import { achievements, currentUser } from "@/data/mockData";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AchievementsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Milestones and achievements you can unlock during your journey
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {achievements.map((achievement) => {
          const isUnlocked = currentUser.achievements.includes(achievement.id);
          
          return (
            <Card key={achievement.id} className={`${isUnlocked ? 'bg-ocean-50' : 'bg-card'}`}>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <div className={`p-3 rounded-full ${
                      isUnlocked ? 'bg-ocean-100 text-ocean-700' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Award className="h-5 w-5" />
                    </div>
                    <CardTitle className="text-xl">{achievement.name}</CardTitle>
                  </div>
                  {isUnlocked ? (
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  ) : (
                    <Circle className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <CardDescription>{achievement.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mt-2 text-sm">
                  <p><strong>Requirement:</strong> {achievement.condition}</p>
                  <p className="mt-1"><strong>Status:</strong> {isUnlocked ? 'Unlocked' : 'Not yet achieved'}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;
