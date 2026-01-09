import { Suspense } from "react";
import { getTestimonials } from "@/lib/actions/marketing-cms";
import { TestimonialsClient } from "./testimonials-client";

function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-8 w-40 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-10 w-36 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-6 rounded-lg bg-[var(--card)] border border-[var(--border)]">
            <div className="h-20 bg-[var(--background-tertiary)] rounded animate-pulse mb-4" />
            <div className="h-4 w-32 bg-[var(--background-tertiary)] rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function TestimonialsLoader() {
  try {
    const result = await getTestimonials({ visibleOnly: false });
    const testimonials = (result?.success && Array.isArray(result.data)) ? result.data : [];
    return <TestimonialsClient testimonials={testimonials} />;
  } catch (error) {
    console.error("Error fetching testimonials (table may not exist):", error);
    return <TestimonialsClient testimonials={[]} />;
  }
}

export default function TestimonialsPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <TestimonialsLoader />
    </Suspense>
  );
}
