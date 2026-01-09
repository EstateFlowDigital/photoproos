import { Suspense } from "react";
import { getTeamMembers } from "@/lib/actions/marketing-cms";
import { TeamClient } from "./team-client";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
          <div className="space-y-2">
            <div className="h-7 w-40 bg-[var(--background-tertiary)] rounded animate-pulse" />
            <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        </div>
        <div className="h-10 w-36 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-[var(--background-tertiary)] animate-pulse" />
              <div className="space-y-2">
                <div className="h-5 w-24 bg-[var(--background-tertiary)] rounded animate-pulse" />
                <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse" />
              </div>
            </div>
            <div className="h-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function TeamLoader() {
  const result = await getTeamMembers({ visibleOnly: false });
  const members = result.success ? result.data : [];
  return <TeamClient members={members} />;
}

export default function TeamPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TeamLoader />
    </Suspense>
  );
}
