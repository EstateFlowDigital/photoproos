export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { GalleryListClient } from "./gallery-list-client";
import { prisma } from "@/lib/db";
import { getGalleryCounts } from "@/lib/actions/galleries";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Main tabs for the galleries section
const mainTabs = [
  { id: "galleries", label: "Galleries", href: "/galleries" },
  { id: "services", label: "Services", href: "/galleries/services" },
];

// Helper to format currency
function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

type FilterTab = "all" | "delivered" | "pending" | "draft";

interface GalleriesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

export default async function GalleriesPage({ searchParams }: GalleriesPageProps) {
  const params = await searchParams;
  const filter = (params.filter || "all") as FilterTab;

  // Get organization (later from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Galleries"
          subtitle="Manage and deliver your photo galleries"
          actions={
            <Link
              href="/galleries/new"
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              New Gallery
            </Link>
          }
        />
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
          <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
        </div>
      </div>
    );
  }

  // Build filter query
  const statusFilter = filter === "all" ? undefined : filter;

  // Fetch galleries and counts in parallel
  const [galleries, counts] = await Promise.all([
    prisma.project.findMany({
      where: {
        organizationId: organization.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        client: { select: { fullName: true, company: true } },
        _count: { select: { assets: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getGalleryCounts(),
  ]);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: counts.all },
    { id: "delivered", label: "Delivered", count: counts.delivered },
    { id: "pending", label: "Pending", count: counts.pending },
    { id: "draft", label: "Drafts", count: counts.draft },
  ];

  // Map galleries to the format expected by GalleryListClient
  const mappedGalleries = galleries.map((gallery) => ({
    id: gallery.id,
    name: gallery.name,
    client: gallery.client?.company || gallery.client?.fullName || "No client",
    photos: gallery._count.assets,
    status: gallery.status as "delivered" | "pending" | "draft",
    revenue: gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : undefined,
    thumbnailUrl: gallery.coverImageUrl || undefined,
    createdAt: gallery.createdAt.toISOString(),
    views: gallery.viewCount,
    downloads: gallery.downloadCount,
  }));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Galleries"
        subtitle="Manage and deliver your photo galleries"
        actions={
          <Link
            href="/galleries/new"
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
          >
            <PlusIcon className="h-4 w-4" />
            New Gallery
          </Link>
        }
      />

      {/* Main Section Tabs */}
      <div className="flex border-b border-[var(--card-border)]">
        {mainTabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.href}
            className={cn(
              "relative px-4 py-2.5 text-sm font-medium transition-colors",
              tab.id === "galleries"
                ? "text-foreground"
                : "text-foreground-muted hover:text-foreground"
            )}
          >
            {tab.label}
            {tab.id === "galleries" && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)]" />
            )}
          </Link>
        ))}
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <Link
            key={tab.id}
            href={tab.id === "all" ? "/galleries" : `/galleries?filter=${tab.id}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === tab.id
                ? "bg-[var(--primary)] text-white"
                : "bg-[var(--card)] text-foreground-secondary hover:bg-[var(--background-hover)] hover:text-foreground"
            )}
          >
            {tab.label}
            <span
              className={cn(
                "rounded-full px-1.5 py-0.5 text-xs",
                filter === tab.id
                  ? "bg-white/20"
                  : "bg-[var(--background-secondary)]"
              )}
            >
              {tab.count}
            </span>
          </Link>
        ))}
      </div>

      {/* Empty State */}
      {mappedGalleries.length === 0 && (
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <GalleryIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-semibold text-foreground">
            {filter === "all" ? "No galleries yet" : `No ${filter} galleries`}
          </h3>
          <p className="mt-2 text-sm text-foreground-muted max-w-md mx-auto">
            {filter === "all"
              ? "Create your first gallery to start delivering photos to your clients."
              : `You don't have any ${filter} galleries at the moment.`}
          </p>
          {filter === "all" && (
            <Link
              href="/galleries/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Gallery
            </Link>
          )}
        </div>
      )}

      {/* Gallery List with Search, Sort, View Toggle */}
      {mappedGalleries.length > 0 && (
        <GalleryListClient galleries={mappedGalleries} filter={filter} />
      )}
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
    </svg>
  );
}

function GalleryIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
    </svg>
  );
}
