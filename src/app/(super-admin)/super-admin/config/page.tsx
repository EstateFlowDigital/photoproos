import { Suspense } from "react";
import { ConfigPageClient } from "./config-client";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-48 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function ConfigPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Platform Configuration
        </h1>
        <p className="text-[var(--foreground-muted)]">
          System-wide settings and feature flags
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <ConfigPageClient />
      </Suspense>
    </div>
  );
}
