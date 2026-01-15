import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Analytics | PhotoProOS",
  description: "View order trends and product performance.",
};

export const dynamic = "force-dynamic";
import { PageHeader, PageContextNav } from "@/components/dashboard";
import { getSqftAnalytics, getOrderStats } from "@/lib/actions/orders";
import { SqftAnalyticsClient } from "./sqft-analytics-client";

export default async function OrdersAnalyticsPage() {
  const [sqftResult, stats] = await Promise.all([
    getSqftAnalytics(),
    getOrderStats(),
  ]);

  return (
    <div className="space-y-6" data-element="orders-analytics-page">
      <PageHeader
        title="Order Analytics"
        subtitle="Square footage and pricing insights"
      />

      {/* Context Navigation */}
      <PageContextNav
        items={[
          { label: "All Orders", href: "/orders", icon: <ShoppingCartIcon className="h-4 w-4" /> },
          { label: "Sqft Analytics", href: "/orders/analytics", icon: <ChartIcon className="h-4 w-4" /> },
          { label: "Order Pages", href: "/order-pages", icon: <GlobeIcon className="h-4 w-4" /> },
        ]}
      />

      {sqftResult.success && sqftResult.data ? (
        <SqftAnalyticsClient
          analytics={sqftResult.data}
          totalOrders={stats.totalOrders}
        />
      ) : (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No sqft data yet
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Square footage analytics will appear here once you have orders with sqft-based pricing.
          </p>
        </div>
      )}
    </div>
  );
}

function ShoppingCartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M6 5v1H4.667a1.75 1.75 0 0 0-1.743 1.598l-.826 9.5A1.75 1.75 0 0 0 3.84 19H16.16a1.75 1.75 0 0 0 1.743-1.902l-.826-9.5A1.75 1.75 0 0 0 15.333 6H14V5a4 4 0 0 0-8 0Zm4-2.5A2.5 2.5 0 0 0 7.5 5v1h5V5A2.5 2.5 0 0 0 10 2.5ZM7.5 10a2.5 2.5 0 0 0 5 0V8.75a.75.75 0 0 1 1.5 0V10a4 4 0 0 1-8 0V8.75a.75.75 0 0 1 1.5 0V10Z" clipRule="evenodd" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-1.5 0a6.5 6.5 0 1 1-11-4.69v.001a2.75 2.75 0 0 0 1.5 2.439V9.25a.75.75 0 0 0 .75.75h.75v.75c0 .415.336.75.75.75h.75v1.25a.75.75 0 0 0 .22.53l1.5 1.5a.75.75 0 0 0 .53.22h.25a.75.75 0 0 0 .75-.75v-3.25a.75.75 0 0 0-.22-.53l-.5-.5a.75.75 0 0 0-.53-.22H9.81a.75.75 0 0 0-.53.22l-.5.5a.75.75 0 0 1-1.06-1.06l.5-.5a.75.75 0 0 0 .22-.53V7.25a.75.75 0 0 0-.75-.75H6.5v-.5a.75.75 0 0 0-.39-.659 1.25 1.25 0 0 1 1.14-2.226A6.475 6.475 0 0 1 16.5 10Z" clipRule="evenodd" />
    </svg>
  );
}
