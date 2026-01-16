"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/lib/utils";
import {
  checkContentGovernance,
  checkMarketingPageGovernance,
  getGovernanceDashboardData,
  toggleGovernancePolicyActive,
  type ContentToCheck,
  type GovernanceCheckResult,
  type PolicySummary,
  type GovernanceStats,
} from "@/lib/actions/cms-governance";
import type { GovernancePolicyType, GovernanceAction } from "@prisma/client";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Shield,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Eye,
  EyeOff,
  FileText,
  MessageSquare,
  Accessibility,
  Search,
  Clock,
  Calendar,
  Users,
} from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface GovernanceCheckProps {
  pageId?: string;
  content?: ContentToCheck;
  onCheckComplete?: (canPublish: boolean) => void;
  className?: string;
}

interface GovernanceResultsPanelProps {
  results: GovernanceCheckResult[];
  onResolve?: (violationId: string, resolution: "fixed" | "overridden" | "dismissed") => void;
  className?: string;
}

interface GovernanceDashboardProps {
  className?: string;
}

interface PolicyCardProps {
  policy: PolicySummary;
  onToggle?: (policyId: string, isActive: boolean) => void;
  onClick?: (policyId: string) => void;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

const POLICY_TYPE_LABELS: Record<GovernancePolicyType, string> = {
  brand_voice: "Brand Voice",
  legal_compliance: "Legal",
  accessibility: "Accessibility",
  seo: "SEO",
  freshness: "Freshness",
  approval_gates: "Approval",
  publishing_windows: "Publishing",
};

const POLICY_TYPE_ICONS: Record<GovernancePolicyType, React.ReactNode> = {
  brand_voice: <MessageSquare className="w-4 h-4" />,
  legal_compliance: <FileText className="w-4 h-4" />,
  accessibility: <Accessibility className="w-4 h-4" />,
  seo: <Search className="w-4 h-4" />,
  freshness: <Clock className="w-4 h-4" />,
  approval_gates: <Users className="w-4 h-4" />,
  publishing_windows: <Calendar className="w-4 h-4" />,
};

const ACTION_COLORS: Record<GovernanceAction, string> = {
  warn: "text-yellow-500",
  block: "text-red-500",
  require_override: "text-orange-500",
};

function getSeverityIcon(severity: string) {
  switch (severity) {
    case "error":
      return <XCircle className="w-4 h-4 text-red-500" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    default:
      return <Info className="w-4 h-4 text-blue-500" />;
  }
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "error":
      return "bg-red-500/10 border-red-500/20 text-red-400";
    case "warning":
      return "bg-yellow-500/10 border-yellow-500/20 text-yellow-400";
    default:
      return "bg-blue-500/10 border-blue-500/20 text-blue-400";
  }
}

// ============================================================================
// GOVERNANCE CHECK COMPONENT
// ============================================================================

export function GovernanceCheck({
  pageId,
  content,
  onCheckComplete,
  className,
}: GovernanceCheckProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<GovernanceCheckResult[] | null>(null);
  const [canPublish, setCanPublish] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true);

  const runCheck = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let result;
      if (pageId) {
        result = await checkMarketingPageGovernance(pageId);
      } else if (content) {
        result = await checkContentGovernance(content);
      } else {
        setError("No content to check");
        return;
      }

      if (result.success && result.data) {
        setResults(result.data.results);
        setCanPublish(result.data.canPublish);
        onCheckComplete?.(result.data.canPublish);
      } else {
        setError(result.error || "Failed to run governance check");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setIsLoading(false);
    }
  }, [pageId, content, onCheckComplete]);

  useEffect(() => {
    if (pageId || content) {
      runCheck();
    }
  }, [pageId, content, runCheck]);

  const failedResults = results?.filter((r) => !r.passed) || [];
  const passedResults = results?.filter((r) => r.passed) || [];
  const errors = failedResults.filter((r) => r.severity === "error");
  const warnings = failedResults.filter((r) => r.severity === "warning");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-left"
        >
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-foreground-secondary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-foreground-secondary" />
          )}
          <Shield className="w-4 h-4 text-foreground-secondary" />
          <h3 className="font-semibold">Governance Check</h3>
        </button>

        <div className="flex items-center gap-3">
          {/* Status Badge */}
          {results && (
            <div
              className={cn(
                "px-3 py-1 rounded-full text-sm font-medium",
                canPublish
                  ? "bg-green-500/10 text-green-500"
                  : "bg-red-500/10 text-red-500"
              )}
            >
              {canPublish ? (
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Ready to Publish
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  Issues Found
                </span>
              )}
            </div>
          )}

          {/* Refresh Button */}
          <button
            onClick={runCheck}
            disabled={isLoading}
            className="p-2 hover:bg-[var(--background-hover)] rounded-lg transition-colors"
            title="Re-run check"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 text-foreground-secondary",
                isLoading && "animate-spin"
              )}
            />
          </button>
        </div>
      </div>

      {/* Content */}
      {isExpanded && (
        <>
          {/* Loading State */}
          {isLoading && !results && (
            <div className="p-4 text-center text-foreground-secondary">
              <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2" />
              Running governance checks...
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              {/* Summary Stats */}
              <div className="flex items-center gap-4 text-sm">
                <span className="text-foreground-secondary">
                  {results.length} policies checked
                </span>
                {errors.length > 0 && (
                  <span className="text-red-500">
                    {errors.length} error{errors.length !== 1 ? "s" : ""}
                  </span>
                )}
                {warnings.length > 0 && (
                  <span className="text-yellow-500">
                    {warnings.length} warning{warnings.length !== 1 ? "s" : ""}
                  </span>
                )}
                {passedResults.length > 0 && (
                  <span className="text-green-500">
                    {passedResults.length} passed
                  </span>
                )}
              </div>

              {/* Blocking Issues */}
              {errors.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-red-500 flex items-center gap-1">
                    <ShieldAlert className="w-4 h-4" />
                    Blocking Issues ({errors.length})
                  </p>
                  {errors.map((result) => (
                    <PolicyViolationCard key={result.policyId} result={result} />
                  ))}
                </div>
              )}

              {/* Warnings */}
              {warnings.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-yellow-500 flex items-center gap-1">
                    <AlertTriangle className="w-4 h-4" />
                    Warnings ({warnings.length})
                  </p>
                  {warnings.map((result) => (
                    <PolicyViolationCard key={result.policyId} result={result} />
                  ))}
                </div>
              )}

              {/* All Passed */}
              {failedResults.length === 0 && (
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-green-500" />
                    <p className="text-sm font-medium text-green-500">
                      All governance checks passed
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============================================================================
// POLICY VIOLATION CARD
// ============================================================================

function PolicyViolationCard({ result }: { result: GovernanceCheckResult }) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "p-3 border rounded-lg",
        getSeverityColor(result.severity)
      )}
    >
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left"
      >
        <div className="flex items-start gap-2">
          {getSeverityIcon(result.severity)}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">{result.policyName}</p>
              <span className="text-xs px-2 py-0.5 rounded bg-[var(--background)] text-foreground-secondary">
                {POLICY_TYPE_LABELS[result.policyType]}
              </span>
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              {result.violations.length} issue
              {result.violations.length !== 1 ? "s" : ""} found
            </p>
          </div>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4 text-foreground-secondary shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 text-foreground-secondary shrink-0" />
          )}
        </div>
      </button>

      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[var(--border)] space-y-2">
          {result.violations.map((violation, i) => (
            <div
              key={i}
              className="text-sm bg-[var(--background)]/50 rounded p-2"
            >
              <p className="font-medium text-foreground">{violation.message}</p>
              {violation.field && (
                <p className="text-xs text-foreground-muted mt-1">
                  Field: <code className="bg-[var(--background)] px-1 rounded">{violation.field}</code>
                </p>
              )}
              {violation.value && (
                <p className="text-xs text-foreground-muted">
                  Value: <code className="bg-[var(--background)] px-1 rounded">{String(violation.value)}</code>
                </p>
              )}
              {violation.snippet && (
                <p className="text-xs text-foreground-muted mt-1 italic">
                  "{violation.snippet}"
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GOVERNANCE BADGE
// ============================================================================

interface GovernanceBadgeProps {
  canPublish: boolean;
  errorCount?: number;
  warningCount?: number;
  className?: string;
}

export function GovernanceBadge({
  canPublish,
  errorCount = 0,
  warningCount = 0,
  className,
}: GovernanceBadgeProps) {
  if (canPublish && errorCount === 0 && warningCount === 0) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-green-500/10 text-green-500",
          className
        )}
      >
        <ShieldCheck className="w-3 h-3" />
        OK
      </div>
    );
  }

  if (!canPublish || errorCount > 0) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-red-500/10 text-red-500",
          className
        )}
      >
        <ShieldAlert className="w-3 h-3" />
        {errorCount} error{errorCount !== 1 ? "s" : ""}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500",
        className
      )}
    >
      <AlertTriangle className="w-3 h-3" />
      {warningCount} warning{warningCount !== 1 ? "s" : ""}
    </div>
  );
}

// ============================================================================
// GOVERNANCE RESULTS PANEL
// ============================================================================

export function GovernanceResultsPanel({
  results,
  onResolve: _onResolve,
  className,
}: GovernanceResultsPanelProps) {
  const failed = results.filter((r) => !r.passed);
  const passed = results.filter((r) => r.passed);

  if (results.length === 0) {
    return (
      <div className={cn("text-center text-foreground-secondary py-8", className)}>
        No governance policies configured
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Failed Checks */}
      {failed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground-secondary">
            Issues Found ({failed.length})
          </h4>
          {failed.map((result) => (
            <PolicyViolationCard key={result.policyId} result={result} />
          ))}
        </div>
      )}

      {/* Passed Checks */}
      {passed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground-secondary">
            Passed ({passed.length})
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {passed.map((result) => (
              <div
                key={result.policyId}
                className="flex items-center gap-2 p-2 bg-green-500/5 border border-green-500/10 rounded text-sm"
              >
                <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                <span className="truncate">{result.policyName}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// GOVERNANCE DASHBOARD
// ============================================================================

export function GovernanceDashboard({ className }: GovernanceDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<GovernanceStats | null>(null);
  const [policies, setPolicies] = useState<PolicySummary[]>([]);
  const [recentViolations, setRecentViolations] = useState<
    Array<{
      id: string;
      policyName: string;
      entityType: string;
      entityId: string;
      severity: string;
      createdAt: Date;
    }>
  >([]);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      const result = await getGovernanceDashboardData();
      if (result.success && result.data) {
        setStats(result.data.stats);
        setPolicies(result.data.policies);
        setRecentViolations(result.data.recentViolations);
      }
      setIsLoading(false);
    }
    loadData();
  }, []);

  const handleTogglePolicy = async (policyId: string, isActive: boolean) => {
    const result = await toggleGovernancePolicyActive(policyId, isActive);
    if (result.success) {
      setPolicies((prev) =>
        prev.map((p) => (p.id === policyId ? { ...p, isActive } : p))
      );
    }
  };

  if (isLoading) {
    return (
      <div className={cn("space-y-6", className)}>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--background-tertiary)] rounded w-1/4" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-24 bg-[var(--background-tertiary)] rounded" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Content Governance</h2>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            label="Active Policies"
            value={stats.activePolicies}
            total={stats.totalPolicies}
            icon={<Shield className="w-5 h-5" />}
            color="text-[var(--primary)]"
          />
          <StatCard
            label="Unresolved Issues"
            value={stats.unresolvedViolations}
            icon={<AlertTriangle className="w-5 h-5" />}
            color={stats.unresolvedViolations > 0 ? "text-yellow-500" : "text-green-500"}
          />
          <StatCard
            label="Blocked Publishes"
            value={stats.blockedPublishes}
            icon={<XCircle className="w-5 h-5" />}
            color={stats.blockedPublishes > 0 ? "text-red-500" : "text-foreground-secondary"}
          />
          <StatCard
            label="Total Violations"
            value={stats.totalViolations}
            icon={<FileText className="w-5 h-5" />}
            color="text-foreground-secondary"
          />
        </div>
      )}

      {/* Policies List */}
      <div className="space-y-4">
        <h3 className="font-semibold">Policies</h3>
        <div className="grid gap-3">
          {policies.map((policy) => (
            <PolicyCard
              key={policy.id}
              policy={policy}
              onToggle={handleTogglePolicy}
            />
          ))}
          {policies.length === 0 && (
            <div className="text-center text-foreground-secondary py-8 border border-dashed border-[var(--border)] rounded-lg">
              No governance policies configured yet
            </div>
          )}
        </div>
      </div>

      {/* Recent Violations */}
      {recentViolations.length > 0 && (
        <div className="space-y-4">
          <h3 className="font-semibold">Recent Issues</h3>
          <div className="space-y-2">
            {recentViolations.map((violation) => (
              <div
                key={violation.id}
                className="flex items-center justify-between p-3 bg-[var(--card)] border border-[var(--card-border)] rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getSeverityIcon(violation.severity)}
                  <div>
                    <p className="text-sm font-medium">{violation.policyName}</p>
                    <p className="text-xs text-foreground-secondary">
                      {violation.entityType} · {violation.entityId}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-foreground-muted">
                  {new Date(violation.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// STAT CARD
// ============================================================================

function StatCard({
  label,
  value,
  total,
  icon,
  color,
}: {
  label: string;
  value: number;
  total?: number;
  icon: React.ReactNode;
  color: string;
}) {
  return (
    <div className="p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className={cn("opacity-75", color)}>{icon}</span>
      </div>
      <div className="text-2xl font-bold">
        {value}
        {total !== undefined && (
          <span className="text-sm text-foreground-secondary font-normal">
            /{total}
          </span>
        )}
      </div>
      <p className="text-sm text-foreground-secondary">{label}</p>
    </div>
  );
}

// ============================================================================
// POLICY CARD
// ============================================================================

function PolicyCard({ policy, onToggle, onClick: _onClick }: PolicyCardProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 bg-[var(--card)] border border-[var(--card-border)] rounded-lg",
        !policy.isActive && "opacity-60"
      )}
    >
      <div className="flex items-center gap-3">
        <div
          className={cn(
            "p-2 rounded-lg",
            policy.isActive ? "bg-[var(--primary)]/10" : "bg-[var(--background-tertiary)]"
          )}
        >
          {POLICY_TYPE_ICONS[policy.type]}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="font-medium">{policy.name}</p>
            <span
              className={cn(
                "text-xs px-2 py-0.5 rounded",
                ACTION_COLORS[policy.action],
                policy.action === "block"
                  ? "bg-red-500/10"
                  : policy.action === "require_override"
                  ? "bg-orange-500/10"
                  : "bg-yellow-500/10"
              )}
            >
              {policy.action === "require_override" ? "Override" : policy.action}
            </span>
          </div>
          <p className="text-sm text-foreground-secondary">
            {policy.ruleCount} rule{policy.ruleCount !== 1 ? "s" : ""} ·{" "}
            {policy.targetTypes.join(", ")}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3">
        {policy.violationCount > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-red-500/10 text-red-500">
            {policy.violationCount} violation{policy.violationCount !== 1 ? "s" : ""}
          </span>
        )}
        <button
          onClick={() => onToggle?.(policy.id, !policy.isActive)}
          className={cn(
            "p-2 rounded-lg transition-colors",
            policy.isActive
              ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
              : "bg-[var(--background-tertiary)] text-foreground-secondary hover:bg-[var(--background-hover)]"
          )}
          title={policy.isActive ? "Disable policy" : "Enable policy"}
        >
          {policy.isActive ? (
            <Eye className="w-4 h-4" />
          ) : (
            <EyeOff className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export type {
  GovernanceCheckProps,
  GovernanceResultsPanelProps,
  GovernanceDashboardProps,
  GovernanceBadgeProps,
};
