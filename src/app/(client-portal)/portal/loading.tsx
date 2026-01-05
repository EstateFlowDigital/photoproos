import { Skeleton } from "@/components/ui/skeleton";

export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {/* Header Skeleton */}
      <header className="border-b border-[#262626] bg-[#141414]">
        <div className="mx-auto max-w-7xl px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton variant="default" className="h-9 w-9 rounded-lg" />
              <Skeleton variant="text" className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <Skeleton variant="text" className="h-4 w-24" />
                <Skeleton variant="text" className="mt-1 h-3 w-32" />
              </div>
              <Skeleton variant="circular" width={40} height={40} />
              <Skeleton variant="default" className="h-9 w-24 rounded-lg" />
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-6 py-8">
        {/* Welcome Skeleton */}
        <div className="mb-8">
          <Skeleton variant="text" className="h-8 w-48" />
          <Skeleton variant="text" className="mt-2 h-5 w-72" />
        </div>

        {/* Stats Skeleton */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-xl border border-[#262626] bg-[#141414] p-4">
              <Skeleton variant="text" className="h-4 w-16" />
              <Skeleton variant="text" className="mt-2 h-8 w-12" />
            </div>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6 flex items-center gap-2 border-b border-[#262626] pb-3">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} variant="default" className="h-8 w-24 rounded-md" />
          ))}
        </div>

        {/* Content Skeleton - Property cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-[#262626] bg-[#141414]">
              <Skeleton variant="image" className="aspect-video w-full" />
              <div className="p-4">
                <Skeleton variant="text" className="h-5 w-24" />
                <Skeleton variant="text" className="mt-2 h-4 w-full" />
                <Skeleton variant="text" className="mt-1 h-4 w-32" />
                <div className="mt-4 flex items-center gap-4">
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="text" className="h-3 w-16" />
                  <Skeleton variant="text" className="h-3 w-16" />
                </div>
                <Skeleton variant="default" className="mt-4 h-10 w-full rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <footer className="mt-auto border-t border-[#262626] py-6">
        <div className="mx-auto max-w-7xl px-6">
          <Skeleton variant="text" className="mx-auto h-4 w-32" />
        </div>
      </footer>
    </div>
  );
}
