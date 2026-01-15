import { Suspense } from "react";
import { getNavigation } from "@/lib/actions/marketing-cms";
import { NavigationEditorClient } from "./navigation-client";

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-[var(--background-tertiary)] rounded animate-pulse" />
      <div className="space-y-4">
        <div className="h-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
        <div className="h-64 bg-[var(--background-tertiary)] rounded animate-pulse" />
      </div>
    </div>
  );
}

// Navigation content loader
async function NavigationLoader() {
  const [navbarResult, footerResult] = await Promise.all([
    getNavigation("navbar"),
    getNavigation("footer"),
  ]);

  const navbar = navbarResult.success ? navbarResult.data : null;
  const footer = footerResult.success ? footerResult.data : null;

  return <NavigationEditorClient navbar={navbar} footer={footer} />;
}

export default function NavigationPage() {
  return (
    <Suspense fallback={<LoadingSkeleton />}>
      <NavigationLoader />
    </Suspense>
  );
}
