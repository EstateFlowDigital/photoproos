import { PageHeader } from "@/components/dashboard";
import { AchievementsPageSkeleton } from "@/components/gamification";

export default function AchievementsLoading() {
  return (
    <div className="flex flex-col density-gap-section">
      <PageHeader
        title="Achievements"
        subtitle="Track your progress and unlock achievements as you use the platform."
      />
      <AchievementsPageSkeleton />
    </div>
  );
}
