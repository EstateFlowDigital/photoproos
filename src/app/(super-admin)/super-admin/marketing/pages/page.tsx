import { Suspense } from "react";
import Link from "next/link";
import { getMarketingPages } from "@/lib/actions/marketing-cms";
import { ChevronLeft } from "lucide-react";
import type { MarketingPage } from "@prisma/client";
import { PagesListClient } from "./pages-list-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-10 w-full max-w-md bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
      <div className="flex gap-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-8 w-20 bg-[var(--background-tertiary)] rounded-full animate-pulse" />
        ))}
      </div>
      <div className="space-y-2">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-16 bg-[var(--background-tertiary)] rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

// Pages list content
async function PagesContent() {
  const result = await getMarketingPages();
  const pages = result.success ? result.data : [];

  return <PagesListClient pages={pages} />;
}

export default function MarketingPagesListPage() {
  return (
    <div className="space-y-6" data-element="marketing-pages-list">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link
            href="/super-admin/marketing"
            className="p-2 rounded-lg hover:bg-[var(--background-elevated)] transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]"
            aria-label="Back to Marketing CMS"
          >
            <ChevronLeft className="w-5 h-5 text-[var(--foreground-muted)]" aria-hidden="true" />
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
