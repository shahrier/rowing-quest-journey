import { JourneyProgress } from '@/components/journey/JourneyProgress';

export default function JourneyMapPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Journey Map</h1>
        <p className="text-muted-foreground">
          Track your team's progress from Boston to Rotterdam
        </p>
      </div>
      
      <JourneyProgress />
    </div>
  );
}