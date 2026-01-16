import { Suspense } from "react";
import { getFAQs } from "@/lib/actions/marketing-cms";
import { FAQsClient } from "./faqs-client";

export const dynamic = "force-dynamic";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="h-8 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-10 w-28 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="p-4 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="h-5 w-3/4 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
            <div className="h-4 w-1/2 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function FAQsLoader() {
  try {
    const result = await getFAQs({ visibleOnly: false });
    const faqs = (result?.success && Array.isArray(result.data)) ? result.data : [];
    return <FAQsClient faqs={faqs} />;
  } catch (error) {
    console.error("Error fetching FAQs (table may not exist):", error);
    return <FAQsClient faqs={[]} />;
  }
}

export default function FAQsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <FAQsLoader />
    </Suspense>
  );
}
