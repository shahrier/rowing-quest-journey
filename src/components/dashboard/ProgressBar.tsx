
import { Progress } from "@/components/ui/progress";
import { TOTAL_JOURNEY_DISTANCE, getTeamCompletionPercentage, getTeamTotalDistance } from "@/data/mockData";

export function ProgressBar() {
  const completionPercentage = getTeamCompletionPercentage();
  const totalDistance = getTeamTotalDistance();
  
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="text-muted-foreground">Team Progress</span>
        <span className="font-medium">{completionPercentage}%</span>
      </div>
      <Progress 
        value={completionPercentage} 
        className="h-2.5 progress-gradient"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Boston</span>
        <span>{totalDistance.toLocaleString()} of {TOTAL_JOURNEY_DISTANCE.toLocaleString()} km</span>
        <span>Rotterdam</span>
      </div>
    </div>
  );
}
