import { Suspense } from "react";
import {
  getRevenueWidgetData,
  getKeyMetricsWidgetData,
} from "@/lib/actions/widget-data";
import { RevenueWidget } from "./revenue-widget";
import { KeyMetricsWidget } from "./key-metrics-widget";
import { WidgetContainer, WidgetContainerSkeleton } from "./widget-container";

// ============================================================================
// Types
// ============================================================================

type WidgetSize = "small" | "medium" | "large" | "full";

interface WidgetWrapperProps {
  size?: WidgetSize;
  onRemove?: () => void;
}

// ============================================================================
// Widget Skeletons
// ============================================================================

function WidgetSkeleton({ title, size }: { title: string; size?: WidgetSize }) {
  return <WidgetContainerSkeleton title={title} size={size} />;
}

// ============================================================================
// Revenue Widget with Data
// ============================================================================

async function RevenueWidgetDataFetcher() {
  const result = await getRevenueWidgetData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center p-8 text-foreground-muted">
        Unable to load revenue data
      </div>
    );
  }

  return (
    <RevenueWidget
      currentMonthRevenue={result.data.currentMonthRevenue}
      previousMonthRevenue={result.data.previousMonthRevenue}
      yearToDateRevenue={result.data.yearToDateRevenue}
      monthlyGoal={result.data.monthlyGoal}
    />
  );
}

export function RevenueWidgetWithData({
  size = "medium",
  onRemove,
}: WidgetWrapperProps) {
  return (
    <WidgetContainer
      id="revenue"
      title="Revenue"
      size={size}
      onRemove={onRemove}
    >
      <Suspense fallback={<WidgetSkeleton title="Revenue" size={size} />}>
        <RevenueWidgetDataFetcher />
      </Suspense>
    </WidgetContainer>
  );
}

// ============================================================================
// Key Metrics Widget with Data
// ============================================================================

async function KeyMetricsWidgetDataFetcher() {
  const result = await getKeyMetricsWidgetData();

  if (!result.success || !result.data) {
    return (
      <div className="flex items-center justify-center p-8 text-foreground-muted">
        Unable to load metrics
      </div>
    );
  }

  return (
    <KeyMetricsWidget
      revenue={{
        current: result.data.revenue.current,
        previous: 0,
      }}
      galleries={{
        active: result.data.galleries,
        previous: 0,
      }}
      clients={{
        total: result.data.clients,
        previous: 0,
      }}
      invoices={{
        pending: result.data.pendingInvoices.total,
      }}
    />
  );
}

export function KeyMetricsWidgetWithData({
  size = "large",
  onRemove,
}: WidgetWrapperProps) {
  return (
    <WidgetContainer
      id="key-metrics"
      title="Key Metrics"
      size={size}
      onRemove={onRemove}
    >
      <Suspense fallback={<WidgetSkeleton title="Key Metrics" size={size} />}>
        <KeyMetricsWidgetDataFetcher />
      </Suspense>
    </WidgetContainer>
  );
}

// ============================================================================
// Export All Widget Wrappers
// ============================================================================

export const WidgetDataWrappers = {
  revenue: RevenueWidgetWithData,
  "key-metrics": KeyMetricsWidgetWithData,
};
