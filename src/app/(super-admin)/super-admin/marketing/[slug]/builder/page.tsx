import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/actions/marketing-cms";
import { PageBuilderClient } from "./builder-client";
import type { PageComponentInstance } from "@/lib/cms/page-builder-utils";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="h-[calc(100vh-64px)] grid grid-cols-[280px_1fr_350px] gap-0">
      <div className="border-r border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-8 w-32 bg-[var(--background-tertiary)] rounded animate-pulse mb-4" />
        <div className="space-y-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
          ))}
        </div>
      </div>
      <div className="bg-[var(--background-tertiary)] p-6">
        <div className="h-12 bg-[var(--card)] rounded animate-pulse mb-4" />
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-[var(--card)] rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
      <div className="border-l border-[var(--border)] bg-[var(--card)] p-4">
        <div className="h-8 w-24 bg-[var(--background-tertiary)] rounded animate-pulse mb-4" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-[var(--background-tertiary)] rounded animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}

// Page builder content
async function PageBuilderContent({ slug }: { slug: string }) {
  const result = await getMarketingPage(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;
  const components = (page.components as PageComponentInstance[]) || [];

  return (
    <PageBuilderClient
      page={page}
      initialComponents={components}
    />
  );
}

export default async function PageBuilderPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <div className="h-[calc(100vh-64px)] -m-6 -mt-8">
      <Suspense fallback={<LoadingSkeleton />}>
        <PageBuilderContent slug={slug} />
      </Suspense>
    </div>
  );
}
