"use client";

import { useRouter } from "next/navigation";
import { PageBuilder } from "@/components/cms/page-builder";
import type { MarketingPage } from "@prisma/client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";
import { ArrowLeft, Eye, Settings2, LayoutGrid } from "lucide-react";
import Link from "next/link";

interface PageBuilderClientProps {
  page: MarketingPage;
  initialComponents: PageComponentInstance[];
}

export function PageBuilderClient({ page, initialComponents }: PageBuilderClientProps) {
  const router = useRouter();

  return (
    <div className="h-full flex flex-col">
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] bg-[var(--card)]">
        <div className="flex items-center gap-3">
          <Link
            href={`/super-admin/marketing/${page.slug}`}
            className="flex items-center gap-2 text-sm text-[var(--foreground-secondary)] hover:text-[var(--foreground)] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Editor
          </Link>
          <span className="text-[var(--border)]">|</span>
          <div className="flex items-center gap-2">
            <LayoutGrid className="w-4 h-4 text-[var(--primary)]" />
            <span className="font-medium">{page.title}</span>
            <span className="px-2 py-0.5 text-xs bg-[var(--primary)]/10 text-[var(--primary)] rounded">
              Page Builder
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/super-admin/marketing/${page.slug}`}
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg hover:bg-[var(--background-hover)] transition-colors"
          >
            <Settings2 className="w-4 h-4" />
            Content Editor
          </Link>
          <Link
            href={`/p/${page.slug}`}
            target="_blank"
            className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 transition-colors"
          >
            <Eye className="w-4 h-4" />
            View Page
          </Link>
        </div>
      </div>

      {/* Page Builder */}
      <div className="flex-1 overflow-hidden">
        <PageBuilder
          page={page}
          initialComponents={initialComponents}
          className="h-full"
        />
      </div>
    </div>
  );
}
