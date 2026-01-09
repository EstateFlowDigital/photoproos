import { Suspense } from "react";
import {
  getPublicRoadmap,
  getPendingFeatureRequests,
  getApprovedFeatureRequests,
} from "@/lib/actions/feature-voting";
import { RoadmapAdminClient } from "./roadmap-admin-client";

async function RoadmapAdminLoader() {
  const [roadmapResult, pendingResult, approvedResult] = await Promise.all([
    getPublicRoadmap(),
    getPendingFeatureRequests(),
    getApprovedFeatureRequests({ status: "approved" }),
  ]);

  const roadmap = roadmapResult.success ? roadmapResult.data || [] : [];
  const pending = pendingResult.success ? pendingResult.data || [] : [];
  const approved = approvedResult.success ? approvedResult.data || [] : [];

  return (
    <RoadmapAdminClient
      roadmap={roadmap}
      pendingFeatures={pending}
      approvedFeatures={approved}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Stats skeleton */}
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="h-96 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse" />
    </div>
  );
}

export default function RoadmapAdminPage() {
  return (
    <div data-element="super-admin-roadmap-page">
      <div className="mb-8" data-element="super-admin-roadmap-header">
        <h1 className="text-2xl font-bold text-[var(--foreground)]" data-element="super-admin-roadmap-title">
          Roadmap Admin
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Manage feature requests and roadmap phases
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <RoadmapAdminLoader />
      </Suspense>
    </div>
  );
}
