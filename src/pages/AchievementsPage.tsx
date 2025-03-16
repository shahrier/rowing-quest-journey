import { BadgeGrid } from '@/components/badges/BadgeGrid';

export default function AchievementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Achievements</h1>
        <p className="text-muted-foreground">
          Track your progress and earn badges for your rowing and strength training
        </p>
      </div>
      
      <BadgeGrid />
    </div>
  );
}