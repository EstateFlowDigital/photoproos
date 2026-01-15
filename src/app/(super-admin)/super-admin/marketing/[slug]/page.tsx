import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getMarketingPage } from "@/lib/actions/marketing-cms";
import { PageEditorClient } from "./page-editor-client";

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="space-y-4">
        <div className="h-12 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
    </div>
  );
}

// Page editor content
async function PageEditorContent({ slug }: { slug: string }) {
  const result = await getMarketingPage(slug);

  if (!result.success || !result.data) {
    notFound();
  }

  const page = result.data;

  return <PageEditorClient page={page} />;
}

export default async function MarketingPageEditorPage({ params }: PageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <PageEditorContent slug={slug} />
    </Suspense>
  );
}
