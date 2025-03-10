
import { JourneyMap } from "@/components/dashboard/JourneyMap";
import { journeyPoints, getTeamTotalDistance } from "@/data/mockData";

const JourneyMapPage = () => {
  const totalDistanceRowed = getTeamTotalDistance();
  const nextPoint = journeyPoints.find(point => point.distanceFromStart > totalDistanceRowed);
  const lastPoint = nextPoint ? journeyPoints[journeyPoints.indexOf(nextPoint) - 1] : journeyPoints[0];
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Journey Map</h1>
        <p className="text-muted-foreground">
          Track your team's progress from Boston to Rotterdam
        </p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="bg-card rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Current Position</h2>
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-lg font-medium">{lastPoint.name}</p>
              <p className="text-muted-foreground">{lastPoint.description}</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-medium">{totalDistanceRowed.toLocaleString()} km rowed</p>
              {nextPoint && (
                <p className="text-muted-foreground">
                  {(nextPoint.distanceFromStart - totalDistanceRowed).toLocaleString()} km to {nextPoint.name}
                </p>
              )}
            </div>
          </div>
          
          <JourneyMap />
        </div>
      </div>
    </div>
  );
};

export default JourneyMapPage;
