"use client";

import { useMemo } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  FileText,
  Calendar,
  Clock,
  BarChart3,
  Search,
  Eye,
  EyeOff,
  Archive,
  AlertOctagon,
} from "lucide-react";
import type { MarketingPage } from "@prisma/client";

interface ContentHealthProps {
  pages: MarketingPage[];
  className?: string;
}

interface HealthMetric {
  id: string;
  label: string;
  value: number;
  total?: number;
  status: "good" | "warning" | "critical";
  icon: React.ElementType;
  description?: string;
}

interface ContentIssue {
  id: string;
  pageId: string;
  pageTitle: string;
  pageSlug: string;
  issue: string;
  severity: "error" | "warning" | "info";
  field?: string;
}

/**
 * Calculate content health metrics from pages
 */
function useContentHealth(pages: MarketingPage[]) {
  return useMemo(() => {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const ninetyDaysAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    // Status counts
    const published = pages.filter(p => p.status === "published");
    const drafts = pages.filter(p => p.status === "draft");
    const archived = pages.filter(p => p.status === "archived");

    // Pages with drafts (unpublished changes)
    const withDrafts = pages.filter(p => p.hasDraft);

    // Scheduled pages
    const scheduled = pages.filter(p => p.scheduledPublishAt);

    // Recently updated (last 30 days)
    const recentlyUpdated = pages.filter(
      p => new Date(p.updatedAt) > thirtyDaysAgo
    );

    // Stale content (not updated in 90 days)
    const staleContent = published.filter(
      p => new Date(p.updatedAt) < ninetyDaysAgo
    );

    // Missing SEO
    const missingSEO = pages.filter(
      p => !p.metaTitle || !p.metaDescription
    );

    // Missing OG Image
    const missingOgImage = pages.filter(p => !p.ogImage);

    // Calculate issues
    const issues: ContentIssue[] = [];

    // Add stale content issues
    staleContent.forEach(page => {
      const daysSinceUpdate = Math.floor(
        (now.getTime() - new Date(page.updatedAt).getTime()) / (1000 * 60 * 60 * 24)
      );
      issues.push({
        id: `stale-${page.id}`,
        pageId: page.id,
        pageTitle: page.title,
        pageSlug: page.slug,
        issue: `Not updated in ${daysSinceUpdate} days`,
        severity: daysSinceUpdate > 180 ? "error" : "warning",
      });
    });

    // Add missing SEO issues
    missingSEO.forEach(page => {
      if (!page.metaTitle) {
        issues.push({
          id: `meta-title-${page.id}`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          issue: "Missing meta title",
          severity: "error",
          field: "metaTitle",
        });
      }
      if (!page.metaDescription) {
        issues.push({
          id: `meta-desc-${page.id}`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          issue: "Missing meta description",
          severity: "error",
          field: "metaDescription",
        });
      }
    });

    // Add missing OG image issues
    missingOgImage.forEach(page => {
      issues.push({
        id: `og-image-${page.id}`,
        pageId: page.id,
        pageTitle: page.title,
        pageSlug: page.slug,
        issue: "Missing social sharing image",
        severity: "warning",
        field: "ogImage",
      });
    });

    // Add unpublished draft issues
    withDrafts.forEach(page => {
      const daysSinceDraft = page.lastEditedAt
        ? Math.floor(
            (now.getTime() - new Date(page.lastEditedAt).getTime()) / (1000 * 60 * 60 * 24)
          )
        : 0;

      if (daysSinceDraft > 7) {
        issues.push({
          id: `draft-${page.id}`,
          pageId: page.id,
          pageTitle: page.title,
          pageSlug: page.slug,
          issue: `Unpublished draft for ${daysSinceDraft} days`,
          severity: daysSinceDraft > 30 ? "warning" : "info",
        });
      }
    });

    // Sort issues by severity
    const severityOrder = { error: 0, warning: 1, info: 2 };
    issues.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

    // Calculate metrics
    const metrics: HealthMetric[] = [
      {
        id: "published",
        label: "Published",
        value: published.length,
        total: pages.length,
        status: published.length > pages.length * 0.7 ? "good" : "warning",
        icon: Eye,
        description: "Pages live on the site",
      },
      {
        id: "drafts",
        label: "Drafts",
        value: drafts.length,
        status: drafts.length > 5 ? "warning" : "good",
        icon: EyeOff,
        description: "Pages pending review",
      },
      {
        id: "with-pending-drafts",
        label: "Pending Changes",
        value: withDrafts.length,
        status: withDrafts.length > 3 ? "warning" : "good",
        icon: FileText,
        description: "Published pages with unpublished changes",
      },
      {
        id: "scheduled",
        label: "Scheduled",
        value: scheduled.length,
        status: "good",
        icon: Calendar,
        description: "Pages scheduled for future publishing",
      },
      {
        id: "recently-updated",
        label: "Recent Updates",
        value: recentlyUpdated.length,
        total: pages.length,
        status: recentlyUpdated.length > pages.length * 0.3 ? "good" : "warning",
        icon: Clock,
        description: "Updated in the last 30 days",
      },
      {
        id: "stale",
        label: "Stale Content",
        value: staleContent.length,
        status: staleContent.length > 5 ? "critical" : staleContent.length > 0 ? "warning" : "good",
        icon: AlertTriangle,
        description: "Not updated in 90+ days",
      },
      {
        id: "missing-seo",
        label: "Missing SEO",
        value: missingSEO.length,
        status: missingSEO.length > 0 ? "critical" : "good",
        icon: Search,
        description: "Missing meta title or description",
      },
      {
        id: "missing-og",
        label: "Missing Social Image",
        value: missingOgImage.length,
        status: missingOgImage.length > 5 ? "warning" : "good",
        icon: BarChart3,
        description: "Missing Open Graph image",
      },
    ];

    // Calculate overall score
    const errorCount = issues.filter(i => i.severity === "error").length;
    const warningCount = issues.filter(i => i.severity === "warning").length;

    let overallScore = 100;
    overallScore -= errorCount * 5;
    overallScore -= warningCount * 2;
    overallScore = Math.max(0, Math.min(100, overallScore));

    let overallStatus: "good" | "warning" | "critical";
    if (overallScore >= 80) overallStatus = "good";
    else if (overallScore >= 60) overallStatus = "warning";
    else overallStatus = "critical";

    return {
      metrics,
      issues,
      overallScore,
      overallStatus,
      summary: {
        total: pages.length,
        published: published.length,
        drafts: drafts.length,
        archived: archived.length,
        withDrafts: withDrafts.length,
        scheduled: scheduled.length,
        stale: staleContent.length,
        missingMeta: missingSEO.length,
        errors: errorCount,
        warnings: warningCount,
      },
    };
  }, [pages]);
}

/**
 * Content Health Dashboard Component
 */
export function ContentHealthDashboard({ pages, className }: ContentHealthProps) {
  const health = useContentHealth(pages);

  const statusColors = {
    good: "text-green-500",
    warning: "text-yellow-500",
    critical: "text-red-500",
  };

  const statusBgColors = {
    good: "bg-green-500",
    warning: "bg-yellow-500",
    critical: "bg-red-500",
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Overall Health Score */}
      <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-[var(--foreground)]">
              Content Health
            </h2>
            <p className="text-sm text-[var(--foreground-muted)] mt-1">
              Overall status of your marketing content
            </p>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2">
              <span className={cn("text-4xl font-bold", statusColors[health.overallStatus])}>
                {health.overallScore}
              </span>
              <span className="text-lg text-[var(--foreground-muted)]">/ 100</span>
            </div>
            <p className={cn("text-sm font-medium", statusColors[health.overallStatus])}>
              {health.overallStatus === "good" && "Healthy"}
              {health.overallStatus === "warning" && "Needs Attention"}
              {health.overallStatus === "critical" && "Critical Issues"}
            </p>
          </div>
        </div>

        {/* Score Bar */}
        <div className="mt-4 h-3 bg-[var(--background-tertiary)] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              statusBgColors[health.overallStatus]
            )}
            style={{ width: `${health.overallScore}%` }}
            role="progressbar"
            aria-valuenow={health.overallScore}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Content health score: ${health.overallScore} out of 100`}
          />
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {health.metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      {/* Issues List */}
      {health.issues.length > 0 && (
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[var(--foreground)]">
              Issues to Address
            </h3>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1">
                <XCircle className="w-3.5 h-3.5 text-red-500" />
                {health.summary.errors} errors
              </span>
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-yellow-500" />
                {health.summary.warnings} warnings
              </span>
            </div>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {health.issues.slice(0, 20).map((issue) => (
              <IssueItem key={issue.id} issue={issue} />
            ))}
            {health.issues.length > 20 && (
              <p className="text-sm text-[var(--foreground-muted)] text-center py-2">
                + {health.issues.length - 20} more issues
              </p>
            )}
          </div>
        </div>
      )}

      {/* No Issues */}
      {health.issues.length === 0 && (
        <div className="bg-green-500/5 border border-green-500/20 rounded-lg p-6 text-center">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-green-500">
            All Content Healthy
          </h3>
          <p className="text-sm text-[var(--foreground-muted)] mt-1">
            No issues detected across your marketing pages
          </p>
        </div>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <QuickStat
          label="Total Pages"
          value={health.summary.total}
          icon={FileText}
        />
        <QuickStat
          label="Published"
          value={health.summary.published}
          icon={Eye}
          color="green"
        />
        <QuickStat
          label="Drafts"
          value={health.summary.drafts}
          icon={EyeOff}
          color="yellow"
        />
        <QuickStat
          label="Archived"
          value={health.summary.archived}
          icon={Archive}
          color="gray"
        />
        <QuickStat
          label="Scheduled"
          value={health.summary.scheduled}
          icon={Calendar}
          color="blue"
        />
      </div>
    </div>
  );
}

/**
 * Individual metric card
 */
function MetricCard({ metric }: { metric: HealthMetric }) {
  const statusColors = {
    good: "text-green-500 bg-green-500/10 border-green-500/20",
    warning: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    critical: "text-red-500 bg-red-500/10 border-red-500/20",
  };

  const Icon = metric.icon;

  return (
    <div
      className={cn(
        "p-4 rounded-lg border transition-colors",
        statusColors[metric.status]
      )}
    >
      <div className="flex items-start justify-between">
        <Icon className="w-5 h-5 opacity-60" aria-hidden="true" />
        <div className="text-right">
          <p className="text-2xl font-bold">
            {metric.value}
            {metric.total !== undefined && (
              <span className="text-sm font-normal opacity-60">
                /{metric.total}
              </span>
            )}
          </p>
        </div>
      </div>
      <p className="text-sm font-medium mt-2">{metric.label}</p>
      {metric.description && (
        <p className="text-xs opacity-60 mt-0.5">{metric.description}</p>
      )}
    </div>
  );
}

/**
 * Issue list item
 */
function IssueItem({ issue }: { issue: ContentIssue }) {
  const severityConfig = {
    error: {
      icon: XCircle,
      color: "text-red-500",
      bg: "bg-red-500/10 border-red-500/20",
    },
    warning: {
      icon: AlertTriangle,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10 border-yellow-500/20",
    },
    info: {
      icon: AlertOctagon,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
    },
  };

  const config = severityConfig[issue.severity];
  const Icon = config.icon;

  return (
    <Link
      href={`/super-admin/marketing/${issue.pageSlug}`}
      className={cn(
        "flex items-start gap-3 p-3 rounded-lg border transition-colors hover:opacity-80",
        config.bg
      )}
    >
      <Icon className={cn("w-4 h-4 shrink-0 mt-0.5", config.color)} aria-hidden="true" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--foreground)] truncate">
          {issue.pageTitle}
        </p>
        <p className="text-xs text-[var(--foreground-muted)]">
          {issue.issue}
        </p>
      </div>
      <span className="text-xs text-[var(--foreground-muted)] shrink-0">
        /{issue.pageSlug}
      </span>
    </Link>
  );
}

/**
 * Quick stat card
 */
function QuickStat({
  label,
  value,
  icon: Icon,
  color = "default",
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color?: "default" | "green" | "yellow" | "blue" | "gray";
}) {
  const colorClasses = {
    default: "text-[var(--foreground)]",
    green: "text-green-500",
    yellow: "text-yellow-500",
    blue: "text-blue-500",
    gray: "text-gray-500",
  };

  return (
    <div className="bg-[var(--card)] border border-[var(--border)] rounded-lg p-4 text-center">
      <Icon
        className={cn("w-5 h-5 mx-auto mb-2", colorClasses[color])}
        aria-hidden="true"
      />
      <p className={cn("text-2xl font-bold", colorClasses[color])}>{value}</p>
      <p className="text-xs text-[var(--foreground-muted)] mt-1">{label}</p>
    </div>
  );
}

/**
 * Compact health badge for dashboards
 */
export function ContentHealthBadge({
  pages,
  className,
}: {
  pages: MarketingPage[];
  className?: string;
}) {
  const health = useContentHealth(pages);

  const statusConfig = {
    good: {
      icon: CheckCircle,
      color: "bg-green-500/10 text-green-500 border-green-500/20",
      label: "Healthy",
    },
    warning: {
      icon: AlertTriangle,
      color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
      label: "Needs Attention",
    },
    critical: {
      icon: XCircle,
      color: "bg-red-500/10 text-red-500 border-red-500/20",
      label: "Critical",
    },
  };

  const config = statusConfig[health.overallStatus];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium",
        config.color,
        className
      )}
    >
      <Icon className="w-4 h-4" aria-hidden="true" />
      <span>{health.overallScore}</span>
      <span className="hidden sm:inline">- {config.label}</span>
    </div>
  );
}

export { useContentHealth };
