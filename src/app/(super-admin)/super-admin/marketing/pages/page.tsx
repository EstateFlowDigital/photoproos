import { Suspense } from "react";
import Link from "next/link";
import { getMarketingPages } from "@/lib/actions/marketing-cms";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, ExternalLink, Search } from "lucide-react";
import type { MarketingPage } from "@prisma/client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Page type badge colors
const pageTypeColors: Record<string, string> = {
  homepage: "bg-blue-500/10 text-blue-500",
  about: "bg-purple-500/10 text-purple-500",
  pricing: "bg-green-500/10 text-green-500",
  features: "bg-orange-500/10 text-orange-500",
  industries: "bg-cyan-500/10 text-cyan-500",
  legal: "bg-gray-500/10 text-gray-400",
  blog_index: "bg-pink-500/10 text-pink-500",
  contact: "bg-yellow-500/10 text-yellow-500",
  custom: "bg-indigo-500/10 text-indigo-500",
};

// Status badge
function StatusBadge({ status }: { status: string }) {
  const statusConfig = {
    draft: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    published: "bg-green-500/10 text-green-600 dark:text-green-400",
    archived: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  };

  return (
    <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium", statusConfig[status as keyof typeof statusConfig])}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

// Page row
function PageRow({ page }: { page: MarketingPage }) {
  const publicUrl = page.slug === "homepage" ? "/" : `/${page.slug.replace(/^(features|industries|legal)\//, "$1/")}`;

  return (
    <Link
      href={`/super-admin/marketing/${page.slug}`}
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg",
        "bg-[var(--card)] border border-[var(--border)]",
        "hover:border-[var(--border-hover)] hover:bg-[var(--background-elevated)]",
        "transition-all duration-200",
        "group"
      )}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-[var(--foreground)]">{page.title}</span>
          <span className={cn("text-xs px-2 py-0.5 rounded-full", pageTypeColors[page.pageType])}>
            {page.pageType.replace("_", " ")}
          </span>
          <StatusBadge status={page.status} />
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-[var(--foreground-muted)]">/{page.slug}</span>
          <a
            href={publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="text-[var(--foreground-muted)] hover:text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="View live page"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 transition-opacity" />
    </Link>
  );
}

// Pages list content
async function PagesContent() {
  const result = await getMarketingPages();
  const pages = result.success ? result.data : [];

  // Group pages by type
  const groupedPages = pages.reduce((acc, page) => {
    const type = page.pageType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(page);
    return acc;
  }, {} as Record<string, MarketingPage[]>);

  // Order of page types to display
  const typeOrder = ["homepage", "about", "pricing", "features", "industries", "legal", "blog_index", "contact", "custom"];

  return (
    <div className="space-y-8">
      {typeOrder.map((type) => {
        const typePages = groupedPages[type];
        if (!typePages || typePages.length === 0) return null;

        return (
          <section key={type}>
            <h2 className="text-sm font-semibold text-[var(--foreground-muted)] uppercase tracking-wider mb-3">
              {type.replace("_", " ")} Pages ({typePages.length})
            </h2>
            <div className="space-y-2">
              {typePages.map((page) => (
                <PageRow key={page.id} page={page} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

export default function MarketingPagesListPage() {
  return (
    <div className="space-y-6" data-element="marketing-pages-list">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors"
            aria-label="Back to Marketing CMS"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-[var(--foreground)]">Marketing Pages</h1>
            <p className="text-sm text-[var(--foreground-muted)]">Edit page content, SEO metadata, and more</p>
          </div>
        </div>
      </div>

      {/* Pages List */}
      <Suspense fallback={<LoadingSkeleton />}>
        <PagesContent />
      </Suspense>
    </div>
  );
}
