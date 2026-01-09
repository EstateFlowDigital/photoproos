import { Suspense } from "react";
import { getMarketingPages, getBlogPosts, getTestimonials, getFAQs, getTeamMembers } from "@/lib/actions/marketing-cms";
import { MarketingDashboardClient } from "./marketing-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
          <div className="h-4 w-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
            <div className="h-8 w-16 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>

      {/* Cards skeleton */}
      <div className="grid grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]"
          >
            <div className="h-6 w-32 bg-[var(--background-tertiary)] rounded animate-pulse mb-4" />
            <div className="space-y-2">
              {[...Array(4)].map((_, j) => (
                <div
                  key={j}
                  className="h-4 w-full bg-[var(--background-tertiary)] rounded animate-pulse"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Data fetcher component
async function MarketingLoader() {
  // Fetch all data with error handling for missing tables
  let pagesResult, postsResult, testimonialsResult, faqsResult, teamResult;

  try {
    [pagesResult, postsResult, testimonialsResult, faqsResult, teamResult] = await Promise.all([
      getMarketingPages(),
      getBlogPosts({ limit: 10 }),
      getTestimonials({ visibleOnly: false }),
      getFAQs({ visibleOnly: false }),
      getTeamMembers({ visibleOnly: false }),
    ]);
  } catch (error) {
    console.error("Error fetching marketing data (tables may not exist):", error);
    // Return empty data if database tables don't exist yet
    return (
      <MarketingDashboardClient
        pages={[]}
        posts={[]}
        testimonials={[]}
        faqs={[]}
        team={[]}
      />
    );
  }

  // Safely extract data with fallbacks - ensure we always pass arrays
  const pages = (pagesResult?.success && Array.isArray(pagesResult.data)) ? pagesResult.data : [];
  const posts = (postsResult?.success && Array.isArray(postsResult.data)) ? postsResult.data : [];
  const testimonials = (testimonialsResult?.success && Array.isArray(testimonialsResult.data)) ? testimonialsResult.data : [];
  const faqs = (faqsResult?.success && Array.isArray(faqsResult.data)) ? faqsResult.data : [];
  const team = (teamResult?.success && Array.isArray(teamResult.data)) ? teamResult.data : [];

  return (
    <MarketingDashboardClient
      pages={pages}
      posts={posts}
      testimonials={testimonials}
      faqs={faqs}
      team={team}
    />
  );
}

export default function MarketingPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <MarketingLoader />
    </Suspense>
  );
}
