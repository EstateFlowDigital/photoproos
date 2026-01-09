import { Suspense } from "react";
import { getBlogPosts } from "@/lib/actions/marketing-cms";
import { BlogListClient } from "./blog-list-client";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="space-y-2">
          <div className="h-8 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
      <div className="rounded-lg border border-[var(--border)] overflow-x-auto">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 border-b border-[var(--border)] last:border-b-0">
            <div className="flex items-center gap-4">
              <div className="h-4 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
              <div className="h-4 w-24 bg-[var(--background-tertiary)] rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function BlogLoader() {
  try {
    const result = await getBlogPosts();
    const posts = (result?.success && Array.isArray(result.data)) ? result.data : [];
    return <BlogListClient posts={posts} />;
  } catch (error) {
    console.error("Error fetching blog posts (table may not exist):", error);
    return <BlogListClient posts={[]} />;
  }
}

export default function BlogPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <BlogLoader />
    </Suspense>
  );
}
