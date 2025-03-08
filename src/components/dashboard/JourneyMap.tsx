
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentJourneyPosition, getTeamTotalDistance } from "@/data/mockData";
import { MapPin, Navigation } from "lucide-react";

export function JourneyMap() {
  const currentPosition = getCurrentJourneyPosition();
  const totalDistance = getTeamTotalDistance();
  
  // In a real app, this would be a real map implementation
  // For now, we'll create a simplified visual representation
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Journey Tracker</CardTitle>
        <CardDescription>Boston to Rotterdam progress</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="relative h-64 bg-ocean-50 dark:bg-ocean-950 rounded-md overflow-hidden">
          {/* Simplified map representation */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577315734214-4b3dec92d9ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30"></div>
          
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-6">
            <div className="animate-pulse-slow mb-3">
              <Navigation className="h-10 w-10 text-energy-500" />
            </div>
            
            <h3 className="text-xl font-semibold">Currently near</h3>
            <div className="flex items-center gap-1 mb-2">
              <MapPin className="h-4 w-4 text-primary" />
              <span className="font-medium">{currentPosition.name}</span>
            </div>
            
            <p className="text-sm text-muted-foreground mb-4">
              {totalDistance.toLocaleString()} km traveled so far
            </p>
            
            {'nextPointName' in currentPosition && (
              <div className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm">
                <span className="font-medium">{currentPosition.distanceToNextPoint} km</span>
                <span className="text-muted-foreground"> to reach {currentPosition.nextPointName}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
