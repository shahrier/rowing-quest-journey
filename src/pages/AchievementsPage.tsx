import { BadgeGrid } from "@/components/badges/BadgeGrid";

export default function AchievementsPage() {
  return (
    <div className="space-y-6" data-oid="i3y:hfl">
      <div data-oid="ud99.9f">
        <h1 className="text-3xl font-bold mb-2" data-oid="4:eouph">
          Achievements
        </h1>
        <p className="text-muted-foreground" data-oid="lt3xj.u">
          Track your progress and earn badges for your rowing and strength
          training
        </p>
      </div>

      <BadgeGrid data-oid="s6tp:s5" />
    </div>
  );
}
