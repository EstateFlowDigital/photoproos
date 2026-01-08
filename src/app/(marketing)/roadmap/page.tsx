import { Suspense } from "react";
import { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import {
  getPublicRoadmap,
  getApprovedFeatureRequests,
} from "@/lib/actions/feature-voting";
import { prisma } from "@/lib/db";
import { RoadmapPageClient } from "./roadmap-client";

export const metadata: Metadata = {
  title: "Product Roadmap | ListingLens",
  description:
    "See what we're building next and vote for the features you want most",
};

async function RoadmapLoader() {
  const { userId: clerkUserId } = await auth();

  // Get user ID if authenticated
  let internalUserId: string | undefined;
  if (clerkUserId) {
    const user = await prisma.user.findUnique({
      where: { clerkUserId },
      select: { id: true },
    });
    internalUserId = user?.id;
  }

  // Load data in parallel
  const [roadmapResult, featuresResult] = await Promise.all([
    getPublicRoadmap(),
    getApprovedFeatureRequests({ userId: internalUserId }),
  ]);

  const roadmap = roadmapResult.success ? roadmapResult.data : [];
  const features = featuresResult.success ? featuresResult.data : [];

  return (
    <RoadmapPageClient
      roadmap={roadmap}
      features={features}
      isAuthenticated={!!clerkUserId}
      userId={internalUserId}
    />
  );
}

function LoadingSkeleton() {
  return (
    <main className="relative min-h-screen bg-background">
      {/* Hero skeleton */}
      <section className="relative overflow-hidden border-b border-[var(--card-border)]">
        <div className="relative z-10 mx-auto max-w-[1512px] px-6 py-20 lg:px-[124px] lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded-full mx-auto mb-4 animate-pulse" />
            <div className="h-12 w-80 bg-[var(--background-tertiary)] rounded-lg mx-auto mb-4 animate-pulse" />
            <div className="h-6 w-96 bg-[var(--background-tertiary)] rounded-lg mx-auto mb-8 animate-pulse" />
            <div className="h-10 w-64 bg-[var(--background-tertiary)] rounded-lg mx-auto animate-pulse" />
          </div>
        </div>
      </section>

      {/* Content skeleton */}
      <section className="py-16 lg:py-24">
        <div className="mx-auto max-w-[1512px] px-6 lg:px-[124px]">
          <div className="mx-auto max-w-4xl space-y-8">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-8"
              >
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-10 w-10 rounded-full bg-[var(--background-tertiary)] animate-pulse" />
                  <div>
                    <div className="h-4 w-20 bg-[var(--background-tertiary)] rounded animate-pulse mb-2" />
                    <div className="h-6 w-40 bg-[var(--background-tertiary)] rounded animate-pulse" />
                  </div>
                </div>
                <div className="grid gap-2 md:grid-cols-2">
                  {[1, 2, 3, 4].map((j) => (
                    <div
                      key={j}
                      className="h-12 bg-[var(--background-tertiary)] rounded-lg animate-pulse"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <RoadmapLoader />
    </Suspense>
  );
}
