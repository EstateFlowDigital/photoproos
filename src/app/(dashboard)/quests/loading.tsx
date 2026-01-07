import { PageHeader } from "@/components/dashboard";
import { QuestCardSkeleton, GamificationWidgetSkeleton } from "@/components/gamification";

export default function QuestsLoading() {
  return (
    <div className="flex flex-col density-gap-section">
      <PageHeader
        title="Your Journey"
        subtitle="Complete quests to master the platform and earn XP rewards."
      />

      {/* Stats Overview Skeleton */}
      <div className="grid gap-4 md:grid-cols-3">
        <GamificationWidgetSkeleton />
        <GamificationWidgetSkeleton />
        <GamificationWidgetSkeleton />
      </div>

      {/* Quest Cards Skeleton */}
      <div className="space-y-8">
        <div>
          <div className="h-6 w-32 rounded bg-[var(--background-elevated)] mb-4" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <QuestCardSkeleton />
            <QuestCardSkeleton />
            <QuestCardSkeleton />
          </div>
        </div>
      </div>
    </div>
  );
}
