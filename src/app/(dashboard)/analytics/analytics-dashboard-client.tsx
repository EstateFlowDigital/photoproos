"use client";

import { useState } from "react";
import { PageHeader } from "@/components/dashboard";
import { cn } from "@/lib/utils";
import { generateAnalyticsReportPdf } from "@/lib/actions/analytics-report";
import { useToast } from "@/components/ui/toast";
import { formatCurrencyWhole as formatCurrency } from "@/lib/utils/units";

interface DashboardData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    ytd: number;
    change: number;
  };
  projects: {
    thisMonth: number;
    lastMonth: number;
    change: number;
  };
  clients: {
    newThisMonth: number;
  };
  invoices: {
    pending: {
      count: number;
      total: number;
    };
    overdue: {
      count: number;
      total: number;
    };
  };
}

interface ForecastData {
  expectedFromPending: number;
  pendingInvoicesCount: number;
  paymentRate: number;
  monthlyRevenue: Array<{ month: string; revenue: number }>;
  projectedMonths: Array<{ month: string; projected: number; isProjection: boolean }>;
  monthlyGrowthRate: number;
}

interface LTVData {
  summary: {
    totalClients: number;
    totalRevenue: number;
    avgLTV: number;
    repeatRate: number;
    repeatClients: number;
  };
  topClients: Array<{
    id: string;
    name: string | null;
    email: string;
    totalRevenue: number;
    avgOrderValue: number;
    projectCount: number;
    tenureMonths: number;
    isRepeat: boolean;
  }>;
  atRiskClients: Array<{
    id: string;
    name: string | null;
    email: string;
    totalRevenue: number;
    lastPayment: Date | null;
  }>;
}

interface AnalyticsDashboardClientProps {
  dashboardData?: DashboardData | null;
  forecastData?: ForecastData | null;
  ltvData?: LTVData | null;
}

export function AnalyticsDashboardClient({
  dashboardData,
  forecastData,
  ltvData,
}: AnalyticsDashboardClientProps) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadReport = async () => {
    setIsDownloading(true);
    try {
      const result = await generateAnalyticsReportPdf();

      if (!result.success || !result.pdfBase64) {
        throw new Error(result.error || "Failed to generate report");
      }

      // Convert base64 to blob and download
      const byteCharacters = atob(result.pdfBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: "application/pdf" });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = result.filename || "analytics-report.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
      showToast(error instanceof Error ? error.message : "Failed to download report", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!dashboardData && !forecastData && !ltvData) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Analytics"
          subtitle="Business performance insights"
        />
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
          <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            No data available
          </h3>
          <p className="mt-2 text-sm text-foreground-muted">
            Analytics will appear here once you start processing invoices and payments.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle="Business performance insights"
        actions={
          <button
            onClick={handleDownloadReport}
            disabled={isDownloading}
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDownloading ? (
              <>
                <SpinnerIcon className="h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <DownloadIcon className="h-4 w-4" />
                Export Report
              </>
            )}
          </button>
        }
      />

      {/* Revenue Overview */}
      {dashboardData && (
        <div className="auto-grid grid-min-200 grid-gap-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">This Month</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-foreground">
                {formatCurrency(dashboardData.revenue.thisMonth)}
              </p>
              {dashboardData.revenue.change !== 0 && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    dashboardData.revenue.change > 0
                      ? "text-[var(--success)]"
                      : "text-[var(--error)]"
                  )}
                >
                  {dashboardData.revenue.change > 0 ? (
                    <TrendUpIcon className="mr-0.5 h-3 w-3" />
                  ) : (
                    <TrendDownIcon className="mr-0.5 h-3 w-3" />
                  )}
                  {Math.abs(dashboardData.revenue.change)}%
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Year to Date</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
              {formatCurrency(dashboardData.revenue.ytd)}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">New Clients</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {dashboardData.clients.newThisMonth}
            </p>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Projects This Month</p>
            <div className="mt-2 flex items-baseline gap-2">
              <p className="text-2xl font-semibold text-foreground">
                {dashboardData.projects.thisMonth}
              </p>
              {dashboardData.projects.change !== 0 && (
                <span
                  className={cn(
                    "flex items-center text-xs font-medium",
                    dashboardData.projects.change > 0
                      ? "text-[var(--success)]"
                      : "text-[var(--error)]"
                  )}
                >
                  {dashboardData.projects.change > 0 ? "+" : ""}
                  {dashboardData.projects.change}%
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Invoice Status */}
      {dashboardData && (
        <div className="grid gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Pending Invoices</h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[var(--warning)]">
                  {dashboardData.invoices.pending.count}
                </p>
                <p className="text-sm text-foreground-muted">invoices</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(dashboardData.invoices.pending.total)}
                </p>
                <p className="text-sm text-foreground-muted">outstanding</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h3 className="text-sm font-semibold text-foreground">Overdue Invoices</h3>
            <div className="mt-4 flex items-center justify-between">
              <div>
                <p className="text-3xl font-bold text-[var(--error)]">
                  {dashboardData.invoices.overdue.count}
                </p>
                <p className="text-sm text-foreground-muted">invoices</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-semibold text-foreground">
                  {formatCurrency(dashboardData.invoices.overdue.total)}
                </p>
                <p className="text-sm text-foreground-muted">overdue</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Revenue Forecast */}
      {forecastData && forecastData.monthlyRevenue.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Revenue Trend</h3>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]" />
                Actual
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-[var(--primary)]/40" />
                Projected
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-end gap-2" style={{ height: "160px" }}>
            {forecastData.monthlyRevenue.map((month) => {
              const maxRevenue = Math.max(
                ...forecastData.monthlyRevenue.map((m) => m.revenue),
                ...forecastData.projectedMonths.map((m) => m.projected),
                1
              );
              const height = (month.revenue / maxRevenue) * 100;
              return (
                <div
                  key={month.month}
                  className="group relative flex-1 min-w-0"
                >
                  <div
                    className="w-full rounded-t bg-[var(--primary)] transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                    <div className="whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-foreground">{month.month}</p>
                      <p className="text-foreground-muted">{formatCurrency(month.revenue)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
            {forecastData.projectedMonths.map((month) => {
              const maxRevenue = Math.max(
                ...forecastData.monthlyRevenue.map((m) => m.revenue),
                ...forecastData.projectedMonths.map((m) => m.projected),
                1
              );
              const height = (month.projected / maxRevenue) * 100;
              return (
                <div
                  key={month.month}
                  className="group relative flex-1 min-w-0"
                >
                  <div
                    className="w-full rounded-t border-2 border-dashed border-[var(--primary)]/40 bg-[var(--primary)]/10 transition-colors"
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                  <div className="absolute bottom-full left-1/2 z-10 mb-2 hidden -translate-x-1/2 group-hover:block">
                    <div className="whitespace-nowrap rounded-lg border border-[var(--card-border)] bg-[var(--background-elevated)] px-3 py-2 text-xs shadow-lg">
                      <p className="font-medium text-foreground">{month.month}</p>
                      <p className="text-foreground-muted">{formatCurrency(month.projected)} (projected)</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Top Clients */}
      {ltvData && ltvData.topClients.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden">
          <div className="border-b border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-4">
            <h3 className="text-sm font-semibold text-foreground">Top Clients by Revenue</h3>
          </div>
          <div className="divide-y divide-[var(--card-border)]">
            {ltvData.topClients.slice(0, 5).map((client, index) => (
              <div
                key={client.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--background-secondary)] text-sm font-medium text-foreground-muted">
                  {index + 1}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium text-foreground">
                    {client.name || client.email}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span>{client.projectCount} project{client.projectCount !== 1 ? "s" : ""}</span>
                    {client.isRepeat && (
                      <span className="text-[var(--success)]">Repeat client</span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--success)]">
                    {formatCurrency(client.totalRevenue)}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {formatCurrency(client.avgOrderValue)} avg
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LTV Summary */}
      {ltvData && (
        <div className="auto-grid grid-min-200 grid-gap-4">
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Total Clients</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {ltvData.summary.totalClients}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Avg. Lifetime Value</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--primary)]">
              {formatCurrency(ltvData.summary.avgLTV)}
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Repeat Rate</p>
            <p className="mt-2 text-2xl font-semibold text-[var(--success)]">
              {ltvData.summary.repeatRate}%
            </p>
          </div>
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
            <p className="text-sm font-medium text-foreground-muted">Repeat Clients</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">
              {ltvData.summary.repeatClients}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function TrendUpIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M12.577 4.878a.75.75 0 0 1 .919-.53l4.78 1.281a.75.75 0 0 1 .531.919l-1.281 4.78a.75.75 0 0 1-1.449-.387l.81-3.022a19.407 19.407 0 0 0-5.594 5.203.75.75 0 0 1-1.139.093L7 10.06l-4.72 4.72a.75.75 0 0 1-1.06-1.061l5.25-5.25a.75.75 0 0 1 1.06 0l3.074 3.073a20.923 20.923 0 0 1 5.545-4.931l-3.042-.815a.75.75 0 0 1-.53-.919Z" clipRule="evenodd" />
    </svg>
  );
}

function TrendDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1.22 5.222a.75.75 0 0 1 1.06 0L7 9.942l3.768-3.769a.75.75 0 0 1 1.113.058 20.908 20.908 0 0 1 3.813 7.254l1.574-2.727a.75.75 0 0 1 1.3.75l-2.475 4.286a.75.75 0 0 1-1.025.275l-4.287-2.475a.75.75 0 0 1 .75-1.3l2.71 1.565a19.422 19.422 0 0 0-3.013-6.024L7.53 11.533a.75.75 0 0 1-1.06 0l-5.25-5.25a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function SpinnerIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className={className}>
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
