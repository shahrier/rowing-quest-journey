import { ActivityLogger } from "@/components/activities/ActivityLogger";
import { BadgeGrid } from "@/components/badges/BadgeGrid";

export default function TrainingPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Training</h1>
        <p className="text-muted-foreground">
          Log your rowing and strength training activities
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="md:col-span-2">
          <ActivityLogger />
        </div>

        <div className="md:col-span-2">
          <BadgeGrid />
        </div>
      </div>
    </div>
  );
}
