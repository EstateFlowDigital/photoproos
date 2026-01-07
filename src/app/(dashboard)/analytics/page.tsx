export const dynamic = "force-dynamic";

import { Suspense } from "react";
import { getDashboardAnalytics, getRevenueForecast, getClientLTVMetrics } from "@/lib/actions/analytics";
import { AnalyticsDashboardClient } from "./analytics-dashboard-client";
import { Skeleton } from "@/components/ui/skeleton";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

export default async function AnalyticsPage() {
  const [dashboardResult, forecastResult, ltvResult, walkthroughPreferenceResult] = await Promise.all([
    getDashboardAnalytics(),
    getRevenueForecast(),
    getClientLTVMetrics(),
    getWalkthroughPreference("analytics"),
  ]);

  const dashboardData = dashboardResult.success && dashboardResult.data ? dashboardResult.data : null;
  const forecastData = forecastResult.success && forecastResult.data ? forecastResult.data : null;
  const ltvData = ltvResult.success && ltvResult.data ? ltvResult.data : null;
  const walkthroughState = walkthroughPreferenceResult.success && walkthroughPreferenceResult.data
    ? walkthroughPreferenceResult.data.state
    : "open";

  return (
    <>
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="analytics"
        initialState={walkthroughState}
      />

      <Suspense fallback={<AnalyticsSkeleton />}>
        <AnalyticsDashboardClient
          dashboardData={dashboardData}
          forecastData={forecastData}
          ltvData={ltvData}
        />
      </Suspense>
    </>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80" />
        <Skeleton className="h-80" />
      </div>
    </div>
  );
}
