import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getBlogPostById } from "@/lib/actions/marketing-cms";
import { BlogEditorClient } from "./blog-editor-client";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="h-10 w-10 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-8 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="h-12 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          <div className="h-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Blog editor content
async function BlogEditorContent({ id }: { id: string }) {
  const result = await getBlogPostById(id);

  if (!result.success || !result.data) {
    notFound();
  }

  return <BlogEditorClient post={result.data} />;
}

export default async function BlogEditorPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BlogEditorContent id={id} />
    </Suspense>
  );
}
