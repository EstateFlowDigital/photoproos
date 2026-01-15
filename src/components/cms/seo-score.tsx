"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  FileText,
  Image,
  Link2,
  Type,
  Hash,
  Globe,
} from "lucide-react";

// SEO check result types
type CheckStatus = "pass" | "warning" | "fail";

interface SEOCheck {
  id: string;
  label: string;
  description: string;
  status: CheckStatus;
  value?: string | number;
  recommendation?: string;
  icon: React.ElementType;
}

interface SEOScoreProps {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  content: Record<string, unknown>;
  slug: string;
  ogImage?: string;
  className?: string;
}

// Score thresholds
const SCORE_THRESHOLDS = {
  excellent: 90,
  good: 70,
  fair: 50,
};

// Character limits
const META_TITLE_MIN = 30;
const META_TITLE_MAX = 60;
const _META_TITLE_OPTIMAL = 55; // Reserved for future optimization hints
const META_DESC_MIN = 120;
const META_DESC_MAX = 160;
const _META_DESC_OPTIMAL = 155; // Reserved for future optimization hints

/**
 * Calculates SEO score and provides recommendations
 */
export function useSEOScore({
  title,
  metaTitle,
  metaDescription,
  content,
  slug,
  ogImage,
}: Omit<SEOScoreProps, "className">) {
  return useMemo(() => {
    const checks: SEOCheck[] = [];

    // 1. Meta Title Check
    const effectiveTitle = metaTitle || title;
    const titleLength = effectiveTitle?.length || 0;

    if (titleLength === 0) {
      checks.push({
        id: "meta-title",
        label: "Meta Title",
        description: "No meta title set",
        status: "fail",
        value: titleLength,
        recommendation: `Add a meta title between ${META_TITLE_MIN}-${META_TITLE_MAX} characters`,
        icon: Type,
      });
    } else if (titleLength < META_TITLE_MIN) {
      checks.push({
        id: "meta-title",
        label: "Meta Title",
        description: `Too short (${titleLength} chars)`,
        status: "warning",
        value: titleLength,
        recommendation: `Add ${META_TITLE_MIN - titleLength} more characters for better visibility`,
        icon: Type,
      });
    } else if (titleLength > META_TITLE_MAX) {
      checks.push({
        id: "meta-title",
        label: "Meta Title",
        description: `Too long (${titleLength} chars)`,
        status: "warning",
        value: titleLength,
        recommendation: `Remove ${titleLength - META_TITLE_MAX} characters to prevent truncation`,
        icon: Type,
      });
    } else {
      checks.push({
        id: "meta-title",
        label: "Meta Title",
        description: `Good length (${titleLength} chars)`,
        status: "pass",
        value: titleLength,
        icon: Type,
      });
    }

    // 2. Meta Description Check
    const descLength = metaDescription?.length || 0;

    if (descLength === 0) {
      checks.push({
        id: "meta-description",
        label: "Meta Description",
        description: "No meta description set",
        status: "fail",
        value: descLength,
        recommendation: `Add a meta description between ${META_DESC_MIN}-${META_DESC_MAX} characters`,
        icon: FileText,
      });
    } else if (descLength < META_DESC_MIN) {
      checks.push({
        id: "meta-description",
        label: "Meta Description",
        description: `Too short (${descLength} chars)`,
        status: "warning",
        value: descLength,
        recommendation: `Add ${META_DESC_MIN - descLength} more characters for better CTR`,
        icon: FileText,
      });
    } else if (descLength > META_DESC_MAX) {
      checks.push({
        id: "meta-description",
        label: "Meta Description",
        description: `Too long (${descLength} chars)`,
        status: "warning",
        value: descLength,
        recommendation: `Remove ${descLength - META_DESC_MAX} characters to prevent truncation`,
        icon: FileText,
      });
    } else {
      checks.push({
        id: "meta-description",
        label: "Meta Description",
        description: `Good length (${descLength} chars)`,
        status: "pass",
        value: descLength,
        icon: FileText,
      });
    }

    // 3. OG Image Check
    if (!ogImage) {
      checks.push({
        id: "og-image",
        label: "Social Image",
        description: "No Open Graph image set",
        status: "warning",
        recommendation: "Add an OG image (1200x630px) for better social sharing",
        icon: Image,
      });
    } else {
      checks.push({
        id: "og-image",
        label: "Social Image",
        description: "Open Graph image set",
        status: "pass",
        icon: Image,
      });
    }

    // 4. URL/Slug Check
    const slugIssues: string[] = [];
    if (slug.includes("_")) slugIssues.push("contains underscores");
    if (slug.includes(" ")) slugIssues.push("contains spaces");
    if (/[A-Z]/.test(slug)) slugIssues.push("contains uppercase letters");
    if (slug.length > 75) slugIssues.push("too long");

    if (slugIssues.length > 0) {
      checks.push({
        id: "url-structure",
        label: "URL Structure",
        description: `Issues: ${slugIssues.join(", ")}`,
        status: "warning",
        recommendation: "Use lowercase, hyphens, and keep URLs concise",
        icon: Link2,
      });
    } else {
      checks.push({
        id: "url-structure",
        label: "URL Structure",
        description: "Clean URL structure",
        status: "pass",
        icon: Link2,
      });
    }

    // 5. Content Check - Hero/Headline
    const heroContent = content?.hero as Record<string, unknown> | undefined;
    const headline = heroContent?.headline as string | undefined;

    if (!headline || headline.length < 10) {
      checks.push({
        id: "headline",
        label: "Page Headline",
        description: "Missing or too short headline",
        status: "fail",
        recommendation: "Add a compelling headline that includes your target keyword",
        icon: Hash,
      });
    } else if (headline.length > 100) {
      checks.push({
        id: "headline",
        label: "Page Headline",
        description: "Headline may be too long",
        status: "warning",
        value: headline.length,
        recommendation: "Consider shortening for better readability",
        icon: Hash,
      });
    } else {
      checks.push({
        id: "headline",
        label: "Page Headline",
        description: "Good headline present",
        status: "pass",
        value: headline.length,
        icon: Hash,
      });
    }

    // 6. Content Depth Check
    const contentString = JSON.stringify(content);
    const wordCount = contentString.split(/\s+/).length;

    if (wordCount < 100) {
      checks.push({
        id: "content-depth",
        label: "Content Depth",
        description: "Limited content detected",
        status: "warning",
        value: wordCount,
        recommendation: "Add more descriptive content for better SEO",
        icon: Search,
      });
    } else {
      checks.push({
        id: "content-depth",
        label: "Content Depth",
        description: `Good content depth (~${wordCount} words)`,
        status: "pass",
        value: wordCount,
        icon: Search,
      });
    }

    // 7. Keyword in Title Check (basic)
    const keywordsInTitle = effectiveTitle?.toLowerCase().includes("photo") ||
                           effectiveTitle?.toLowerCase().includes("photographer");

    if (!keywordsInTitle && slug !== "homepage") {
      checks.push({
        id: "keyword-title",
        label: "Keyword Presence",
        description: "Target keyword may be missing from title",
        status: "warning",
        recommendation: "Include your primary keyword in the meta title",
        icon: Globe,
      });
    } else {
      checks.push({
        id: "keyword-title",
        label: "Keyword Presence",
        description: "Relevant keywords detected",
        status: "pass",
        icon: Globe,
      });
    }

    // Calculate overall score
    const passCount = checks.filter(c => c.status === "pass").length;
    const warningCount = checks.filter(c => c.status === "warning").length;
    const failCount = checks.filter(c => c.status === "fail").length;

    // Score: pass=100%, warning=50%, fail=0%
    const maxScore = checks.length * 100;
    const actualScore = (passCount * 100) + (warningCount * 50);
    const score = Math.round((actualScore / maxScore) * 100);

    // Determine grade
    let grade: "excellent" | "good" | "fair" | "poor";
    if (score >= SCORE_THRESHOLDS.excellent) grade = "excellent";
    else if (score >= SCORE_THRESHOLDS.good) grade = "good";
    else if (score >= SCORE_THRESHOLDS.fair) grade = "fair";
    else grade = "poor";

    return {
      score,
      grade,
      checks,
      summary: {
        pass: passCount,
        warning: warningCount,
        fail: failCount,
        total: checks.length,
      },
    };
  }, [title, metaTitle, metaDescription, content, slug, ogImage]);
}

/**
 * SEO Score Display Component
 */
export function SEOScore({
  title,
  metaTitle,
  metaDescription,
  content,
  slug,
  ogImage,
  className,
}: SEOScoreProps) {
  const { score, grade, checks, summary } = useSEOScore({
    title,
    metaTitle,
    metaDescription,
    content,
    slug,
    ogImage,
  });

  const gradeColors = {
    excellent: "text-green-500",
    good: "text-blue-500",
    fair: "text-yellow-500",
    poor: "text-red-500",
  };

  const gradeLabels = {
    excellent: "Excellent",
    good: "Good",
    fair: "Needs Work",
    poor: "Poor",
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--foreground)]">
          SEO Score
        </h3>
        <div className="flex items-center gap-2">
          <span className={cn("text-2xl font-bold", gradeColors[grade])}>
            {score}
          </span>
          <span className="text-sm text-[var(--foreground-muted)]">/ 100</span>
        </div>
      </div>

      {/* Score Bar */}
      <div className="space-y-2">
        <div className="h-2 bg-[var(--background)] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              grade === "excellent" && "bg-green-500",
              grade === "good" && "bg-blue-500",
              grade === "fair" && "bg-yellow-500",
              grade === "poor" && "bg-red-500"
            )}
            style={{ width: `${score}%` }}
            role="progressbar"
            aria-valuenow={score}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`SEO score: ${score} out of 100`}
          />
        </div>
        <p className={cn("text-sm font-medium", gradeColors[grade])}>
          {gradeLabels[grade]}
        </p>
      </div>

      {/* Summary Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <CheckCircle className="w-4 h-4 text-green-500" aria-hidden="true" />
          <span className="text-[var(--foreground-secondary)]">{summary.pass} passed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-yellow-500" aria-hidden="true" />
          <span className="text-[var(--foreground-secondary)]">{summary.warning} warnings</span>
        </div>
        <div className="flex items-center gap-1.5">
          <XCircle className="w-4 h-4 text-red-500" aria-hidden="true" />
          <span className="text-[var(--foreground-secondary)]">{summary.fail} issues</span>
        </div>
      </div>

      {/* Checks List */}
      <div className="space-y-2">
        {checks.map((check) => (
          <SEOCheckItem key={check.id} check={check} />
        ))}
      </div>
    </div>
  );
}

/**
 * Individual SEO Check Item
 */
function SEOCheckItem({ check }: { check: SEOCheck }) {
  const statusIcons = {
    pass: CheckCircle,
    warning: AlertTriangle,
    fail: XCircle,
  };

  const statusColors = {
    pass: "text-green-500",
    warning: "text-yellow-500",
    fail: "text-red-500",
  };

  const StatusIcon = statusIcons[check.status];
  const Icon = check.icon;

  return (
    <div
      className={cn(
        "p-3 rounded-lg border",
        check.status === "pass" && "bg-green-500/5 border-green-500/20",
        check.status === "warning" && "bg-yellow-500/5 border-yellow-500/20",
        check.status === "fail" && "bg-red-500/5 border-red-500/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex items-center gap-2 shrink-0">
          <Icon className="w-4 h-4 text-[var(--foreground-muted)]" aria-hidden="true" />
          <StatusIcon
            className={cn("w-4 h-4", statusColors[check.status])}
            aria-hidden="true"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-medium text-[var(--foreground)]">
              {check.label}
            </p>
            {check.value !== undefined && (
              <span className="text-xs text-[var(--foreground-muted)] shrink-0">
                {check.value}
              </span>
            )}
          </div>
          <p className="text-xs text-[var(--foreground-secondary)] mt-0.5">
            {check.description}
          </p>
          {check.recommendation && (
            <p className="text-xs text-[var(--foreground-muted)] mt-1 italic">
              {check.recommendation}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact SEO Score Badge
 */
export function SEOScoreBadge({
  score,
  grade,
  className,
}: {
  score: number;
  grade: "excellent" | "good" | "fair" | "poor";
  className?: string;
}) {
  const gradeColors = {
    excellent: "bg-green-500/10 text-green-500 border-green-500/20",
    good: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    fair: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    poor: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium border",
        gradeColors[grade],
        className
      )}
    >
      <Search className="w-3 h-3" aria-hidden="true" />
      <span>SEO: {score}</span>
    </div>
  );
}

/**
 * SEO Score Panel for page editor sidebar
 */
export function SEOScorePanel({
  title,
  metaTitle,
  metaDescription,
  content,
  slug,
  ogImage,
  className,
}: SEOScoreProps) {
  const { score, grade, checks, summary } = useSEOScore({
    title,
    metaTitle,
    metaDescription,
    content,
    slug,
    ogImage,
  });

  // Filter to show only issues and warnings first
  const issues = checks.filter(c => c.status === "fail");
  const warnings = checks.filter(c => c.status === "warning");
  const passed = checks.filter(c => c.status === "pass");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Score Circle */}
      <div className="flex items-center justify-center py-4">
        <div className="relative">
          <svg className="w-24 h-24 transform -rotate-90" aria-hidden="true">
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke="var(--background-tertiary)"
              strokeWidth="8"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              fill="none"
              stroke={
                grade === "excellent" ? "#22c55e" :
                grade === "good" ? "#3b82f6" :
                grade === "fair" ? "#f97316" : "#ef4444"
              }
              strokeWidth="8"
              strokeDasharray={`${(score / 100) * 251.2} 251.2`}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-bold text-[var(--foreground)]">
              {score}
            </span>
            <span className="text-xs text-[var(--foreground-muted)]">
              / 100
            </span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="p-2 rounded-lg bg-green-500/10">
          <p className="text-lg font-bold text-green-500">{summary.pass}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Passed</p>
        </div>
        <div className="p-2 rounded-lg bg-yellow-500/10">
          <p className="text-lg font-bold text-yellow-500">{summary.warning}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Warnings</p>
        </div>
        <div className="p-2 rounded-lg bg-red-500/10">
          <p className="text-lg font-bold text-red-500">{summary.fail}</p>
          <p className="text-xs text-[var(--foreground-muted)]">Issues</p>
        </div>
      </div>

      {/* Issues First */}
      {issues.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-red-500 uppercase tracking-wider">
            Issues to Fix
          </h4>
          {issues.map((check) => (
            <SEOCheckItem key={check.id} check={check} />
          ))}
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-yellow-500 uppercase tracking-wider">
            Recommendations
          </h4>
          {warnings.map((check) => (
            <SEOCheckItem key={check.id} check={check} />
          ))}
        </div>
      )}

      {/* Passed (collapsible in future) */}
      {passed.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-green-500 uppercase tracking-wider">
            Passed Checks
          </h4>
          {passed.map((check) => (
            <SEOCheckItem key={check.id} check={check} />
          ))}
        </div>
      )}
    </div>
  );
}
