import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getCurrentJourneyPosition,
  getTeamTotalDistance,
} from "@/data/mockData";
import { MapPin, Navigation } from "lucide-react";

export function JourneyMap() {
  const currentPosition = getCurrentJourneyPosition();
  const totalDistance = getTeamTotalDistance();

  // In a real app, this would be a real map implementation
  // For now, we'll create a simplified visual representation

  return (
    <Card data-oid="2fee_7s">
      <CardHeader data-oid="kkr4nbo">
        <CardTitle className="text-lg" data-oid="o4-5y.p">
          Journey Tracker
        </CardTitle>
        <CardDescription data-oid="53_g0l5">
          Boston to Rotterdam progress
        </CardDescription>
      </CardHeader>
      <CardContent data-oid="yp3yyb4">
        <div
          className="relative h-64 bg-ocean-50 dark:bg-ocean-950 rounded-md overflow-hidden"
          data-oid="9rtrsa8"
        >
          {/* Simplified map representation */}
          <div
            className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1577315734214-4b3dec92d9ad?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80')] bg-cover bg-center opacity-30"
            data-oid="sc:t:k_"
          ></div>

          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
            data-oid="g73yjqy"
          >
            <div className="animate-pulse-slow mb-3" data-oid="pm8zpse">
              <Navigation
                className="h-10 w-10 text-energy-500"
                data-oid="x4.lgxx"
              />
            </div>

            <h3 className="text-xl font-semibold" data-oid="nujdspo">
              Currently near
            </h3>
            <div className="flex items-center gap-1 mb-2" data-oid="dv4jbte">
              <MapPin className="h-4 w-4 text-primary" data-oid="pq3nvkn" />
              <span className="font-medium" data-oid="v7dcehr">
                {currentPosition.name}
              </span>
            </div>

            <p
              className="text-sm text-muted-foreground mb-4"
              data-oid="kqdy26p"
            >
              {totalDistance.toLocaleString()} km traveled so far
            </p>

            {"nextPointName" in currentPosition && (
              <div
                className="bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm"
                data-oid=":aus3ud"
              >
                <span className="font-medium" data-oid="s5-v7k:">
                  {currentPosition.distanceToNextPoint} km
                </span>
                <span className="text-muted-foreground" data-oid="bqw0b.0">
                  {" "}
                  to reach {currentPosition.nextPointName}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
