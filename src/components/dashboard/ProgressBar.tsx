import { Progress } from "@/components/ui/progress";
import {
  TOTAL_JOURNEY_DISTANCE_KM,
  getTeamCompletionPercentage,
  getTeamTotalDistance,
} from "@/data/mockData";

export function ProgressBar() {
  const completionPercentage = getTeamCompletionPercentage();
  const totalDistanceKm = getTeamTotalDistance();
  const totalDistanceM = totalDistanceKm * 1000;

  return (
    <div className="space-y-2" data-oid="1hcs:8-">
      <div className="flex justify-between text-sm" data-oid="v:bojnc">
        <span className="text-muted-foreground" data-oid="n_u83t-">
          Team Progress
        </span>
        <span className="font-medium" data-oid="4fb932_">
          {completionPercentage}%
        </span>
      </div>
      <Progress
        value={completionPercentage}
        className="h-2.5 progress-gradient"
        data-oid="7:wwit9"
      />

      <div
        className="flex justify-between text-xs text-muted-foreground"
        data-oid="iz27uw7"
      >
        <span data-oid="tg0ow3g">Boston</span>
        <span data-oid="63rnkk3">
          {totalDistanceM.toLocaleString()} of{" "}
          {(TOTAL_JOURNEY_DISTANCE_KM * 1000).toLocaleString()} m
        </span>
        <span data-oid="wl06oby">Rotterdam</span>
      </div>
    </div>
  );
}
