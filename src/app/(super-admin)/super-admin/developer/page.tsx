import { Suspense } from "react";
import { DeveloperPageClient } from "./developer-client";
import {
  getSubscriptionPlans,
  getPricingExperiments,
} from "@/lib/actions/subscription-plans";

async function DeveloperLoader() {
  const [plansResult, experimentsResult] = await Promise.all([
    getSubscriptionPlans(),
    getPricingExperiments(),
  ]);

  const plans = plansResult.success ? plansResult.data || [] : [];
  const experiments = experimentsResult.success ? experimentsResult.data || [] : [];

  return (
    <DeveloperPageClient
      initialPlans={plans}
      initialExperiments={experiments}
    />
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-[var(--card)] border border-[var(--border)] animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

export default function DeveloperPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Developer Tools
        </h1>
        <p className="text-[var(--foreground-muted)]">
          Platform-wide development utilities and configuration
        </p>
      </div>

      <Suspense fallback={<LoadingSkeleton />}>
        <DeveloperLoader />
      </Suspense>
    </div>
  );
}
