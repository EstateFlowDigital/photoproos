import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Year in Review | PhotoProOS",
  description: "View your annual business summary.",
};

export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/clerk";
import { getYearInReview } from "@/lib/actions/gamification";
import { PageHeader } from "@/components/dashboard";
import { ArrowLeft, TrendingUp, TrendingDown, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import type { YearHighlight } from "@/lib/gamification/year-in-review";

export default async function YearInReviewPage({
  searchParams,
}: {
  searchParams: Promise<{ year?: string }>;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const params = await searchParams;
  const yearParam = params.year ? parseInt(params.year) : undefined;
  const result = await getYearInReview(yearParam);

  if (!result.success) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">Unable to load Year in Review</h2>
        <p className="mt-2 text-foreground-muted">Please try again later.</p>
      </div>
    );
  }

  const data = result.data;

  return (
    <div className="flex flex-col gap-6" data-element="year-in-review-page">
      {/* Back link */}
      <Link
        href="/progress"
        className="inline-flex items-center gap-2 text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Progress
      </Link>

      <PageHeader
        title={`${data.year} Year in Review`}
        subtitle={data.encouragementMessage}
      />

      {/* Highlights Banner */}
      {data.highlights.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-gradient-to-br from-[var(--primary)]/10 to-[var(--ai)]/10 p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
            <Award className="h-5 w-5 text-[var(--ai)]" />
            Your {data.year} Highlights
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.highlights.map((highlight) => (
              <HighlightCard key={highlight.id} highlight={highlight} />
            ))}
          </div>
        </div>
      )}

      {/* Main Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Revenue Card */}
        <StatCard
          title="Revenue"
          icon="💰"
          stats={[
            {
              label: "Total Earned",
              value: `$${Math.round(data.totalRevenueCents / 100).toLocaleString()}`,
              highlight: true,
            },
            {
              label: "Payments Received",
              value: data.paymentsReceived.toString(),
            },
            {
              label: "Average Payment",
              value: `$${Math.round(data.averagePaymentCents / 100).toLocaleString()}`,
            },
            {
              label: "Best Month",
              value: `${data.bestMonthName} ($${Math.round(data.bestMonthRevenueCents / 100).toLocaleString()})`,
            },
          ]}
          comparison={data.comparisons.revenueVsLastYear}
          comparisonLabel="vs last year"
        />

        {/* Galleries Card */}
        <StatCard
          title="Galleries"
          icon="📸"
          stats={[
            {
              label: "Galleries Created",
              value: data.galleriesCreated.toString(),
            },
            {
              label: "Galleries Delivered",
              value: data.galleriesDelivered.toString(),
              highlight: true,
            },
            {
              label: "Photos Shared",
              value: data.photosShared.toLocaleString(),
            },
          ]}
          comparison={data.comparisons.galleriesVsLastYear}
          comparisonLabel="vs last year"
        />

        {/* Clients Card */}
        <StatCard
          title="Clients"
          icon="👥"
          stats={[
            {
              label: "New Clients",
              value: data.newClients.toString(),
              highlight: true,
            },
            {
              label: "Total Clients",
              value: data.totalClients.toString(),
            },
            {
              label: "Repeat Clients",
              value: data.repeatClients.toString(),
            },
          ]}
          comparison={data.comparisons.clientsVsLastYear}
          comparisonLabel="vs last year"
        />

        {/* Bookings Card */}
        <StatCard
          title="Bookings"
          icon="📅"
          stats={[
            {
              label: "Completed Bookings",
              value: data.bookingsCompleted.toString(),
              highlight: true,
            },
            {
              label: "Total Hours Worked",
              value: `${data.totalBookingHours} hrs`,
            },
            {
              label: "Full Work Days",
              value: `${Math.round(data.totalBookingHours / 8)} days`,
            },
          ]}
        />

        {/* Progress Card */}
        <StatCard
          title="Progress"
          icon="🏆"
          stats={[
            {
              label: "Milestones Unlocked",
              value: data.achievementsUnlocked.toString(),
              highlight: true,
            },
            {
              label: "Level Progress",
              value: `${data.startLevel} → ${data.endLevel}`,
            },
          ]}
        />

        {/* Consistency Card */}
        <StatCard
          title="Consistency"
          icon="🔥"
          stats={[
            {
              label: "Longest Streak",
              value: `${data.longestLoginStreak} days`,
              highlight: true,
            },
            {
              label: "Total Days Active",
              value: `${data.totalDaysActive} days`,
            },
          ]}
        />
      </div>

      {/* Fun Facts */}
      {data.funFacts.length > 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-4">
            Fun Facts
          </h2>
          <ul className="space-y-3">
            {data.funFacts.map((fact, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-[var(--foreground-secondary)]"
              >
                <span className="text-lg">✨</span>
                <span>{fact}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Year selector */}
      <div className="flex items-center justify-center gap-4 py-8">
        <span className="text-sm text-[var(--foreground-muted)]">View other years:</span>
        <div className="flex gap-2">
          {[2024, 2025, 2026].map((year) => (
            <Link
              key={year}
              href={`/progress/year-in-review?year=${year}`}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                year === data.year
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--background-secondary)] text-[var(--foreground-muted)] hover:text-[var(--foreground)]"
              )}
            >
              {year}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

function HighlightCard({ highlight }: { highlight: YearHighlight }) {
  return (
    <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-4">
      <div className="flex items-start gap-3">
        <span className="text-2xl">{highlight.icon}</span>
        <div>
          <h3 className="font-semibold text-[var(--foreground)]">{highlight.title}</h3>
          <p className="text-sm text-[var(--foreground-muted)]">{highlight.description}</p>
        </div>
      </div>
    </div>
  );
}

interface StatItem {
  label: string;
  value: string;
  highlight?: boolean;
}

function StatCard({
  title,
  icon,
  stats,
  comparison,
  comparisonLabel,
}: {
  title: string;
  icon: string;
  stats: StatItem[];
  comparison?: number | null;
  comparisonLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-5">
      <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <h3 className="font-semibold text-[var(--foreground)]">{title}</h3>
        </div>
        {comparison !== null && comparison !== undefined && (
          <div
            className={cn(
              "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
              comparison >= 0
                ? "bg-[var(--success)]/15 text-[var(--success)]"
                : "bg-[var(--error)]/15 text-[var(--error)]"
            )}
          >
            {comparison >= 0 ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {comparison >= 0 ? "+" : ""}
            {comparison}%
            {comparisonLabel && <span className="opacity-75 ml-1">{comparisonLabel}</span>}
          </div>
        )}
      </div>
      <div className="space-y-3">
        {stats.map((stat, index) => (
          <div key={index} className="flex items-start justify-between gap-4 flex-wrap">
            <span className="text-sm text-[var(--foreground-muted)]">{stat.label}</span>
            <span
              className={cn(
                "font-semibold",
                stat.highlight ? "text-[var(--foreground)]" : "text-[var(--foreground-secondary)]"
              )}
            >
              {stat.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
