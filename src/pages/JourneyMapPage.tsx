import { JourneyProgress } from "@/components/journey/JourneyProgress";

export default function JourneyMapPage() {
  return (
    <div className="space-y-6" data-oid="5770--r">
      <div data-oid=".p2rre5">
        <h1 className="text-3xl font-bold mb-2" data-oid="h.pkwlu">
          Journey Map
        </h1>
        <p className="text-muted-foreground" data-oid="0wyw.dg">
          Track your team's progress from Boston to Rotterdam
        </p>
      </div>

      <JourneyProgress data-oid="jzgjjea" />
    </div>
  );
}
