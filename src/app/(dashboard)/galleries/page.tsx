export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import { GalleryListClient } from "./gallery-list-client";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo mode flag
const DEMO_MODE = true;

// Demo data for galleries
const demoGalleries = [
  { id: "1", name: "Downtown Luxury Listing", client: "Premier Realty", photos: 48, status: "delivered" as const, revenue: "$4,250", thumbnailUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", createdAt: "2024-12-20T10:00:00Z" },
  { id: "2", name: "Oceanfront Estate", client: "Berkshire Properties", photos: 64, status: "delivered" as const, revenue: "$5,800", thumbnailUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", createdAt: "2024-12-18T14:30:00Z" },
  { id: "3", name: "Corporate Headshots Q4", client: "Tech Solutions Inc", photos: 24, status: "pending" as const, revenue: "$2,180", thumbnailUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop", createdAt: "2024-12-22T09:15:00Z" },
  { id: "4", name: "Restaurant Grand Opening", client: "Bella Cucina", photos: 86, status: "delivered" as const, revenue: "$1,890", thumbnailUrl: "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=400&h=300&fit=crop", createdAt: "2024-12-15T16:00:00Z" },
  { id: "5", name: "Modern Office Space", client: "Design Studio Pro", photos: 32, status: "draft" as const, revenue: undefined, thumbnailUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", createdAt: "2024-12-24T11:30:00Z" },
  { id: "6", name: "Wedding - Sarah & Michael", client: "Sarah M.", photos: 156, status: "delivered" as const, revenue: "$3,500", thumbnailUrl: "https://images.unsplash.com/photo-1519741497674-611481863552?w=400&h=300&fit=crop", createdAt: "2024-12-10T13:00:00Z" },
  { id: "7", name: "Product Launch Event", client: "Innovate Tech", photos: 42, status: "pending" as const, revenue: "$1,200", thumbnailUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=400&h=300&fit=crop", createdAt: "2024-12-23T08:45:00Z" },
  { id: "8", name: "Penthouse Suite Tour", client: "Luxury Living Realty", photos: 38, status: "draft" as const, revenue: undefined, thumbnailUrl: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", createdAt: "2024-12-25T10:00:00Z" },
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

  // Demo mode - use static data
  if (DEMO_MODE) {
    const countsMap = {
      delivered: demoGalleries.filter(g => g.status === "delivered").length,
      pending: demoGalleries.filter(g => g.status === "pending").length,
      draft: demoGalleries.filter(g => g.status === "draft").length,
    };
    const totalCount = demoGalleries.length;

    const tabs: { id: FilterTab; label: string; count: number }[] = [
      { id: "all", label: "All", count: totalCount },
      { id: "delivered", label: "Delivered", count: countsMap.delivered },
      { id: "pending", label: "Pending", count: countsMap.pending },
      { id: "draft", label: "Drafts", count: countsMap.draft },
    ];

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

        {/* Demo Mode Banner */}
        <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
          <p className="text-sm text-[var(--primary)]">
            <strong>Demo Mode:</strong> Viewing sample gallery data.
          </p>
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

        {/* Gallery List with Search, Sort, View Toggle */}
        <GalleryListClient galleries={demoGalleries} filter={filter} />
      </div>
    );
  }

  // Database mode
  const { prisma } = await import("@/lib/db");

  // Get organization (later from auth)
  const organization = await prisma.organization.findFirst({
    orderBy: { createdAt: "asc" },
  });

  if (!organization) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
        <p className="mt-2 text-foreground-muted">Please run the seed script to populate demo data.</p>
      </div>
    );
  }

  // Build filter query
  const statusFilter = filter === "all" ? undefined : filter;

  // Fetch galleries with counts
  const [galleries, counts] = await Promise.all([
    prisma.project.findMany({
      where: {
        organizationId: organization.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: {
        client: { select: { fullName: true, company: true } },
        assets: { select: { id: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.project.groupBy({
      by: ["status"],
      where: { organizationId: organization.id },
      _count: { id: true },
    }),
  ]);

  // Process counts
  const countsMap = counts.reduce((acc, item) => {
    acc[item.status] = item._count.id;
    return acc;
  }, {} as Record<string, number>);

  const totalCount = Object.values(countsMap).reduce((a, b) => a + b, 0);

  const tabs: { id: FilterTab; label: string; count: number }[] = [
    { id: "all", label: "All", count: totalCount },
    { id: "delivered", label: "Delivered", count: countsMap.delivered || 0 },
    { id: "pending", label: "Pending", count: countsMap.pending || 0 },
    { id: "draft", label: "Drafts", count: countsMap.draft || 0 },
  ];

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

      {/* Gallery List with Search, Sort, View Toggle */}
      <GalleryListClient
        galleries={galleries.map((gallery) => ({
          id: gallery.id,
          name: gallery.name,
          client: gallery.client?.company || gallery.client?.fullName || "No client",
          photos: gallery.assets.length,
          status: gallery.status as "delivered" | "pending" | "draft",
          revenue: gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : undefined,
          thumbnailUrl: gallery.coverImageUrl || undefined,
          createdAt: gallery.createdAt.toISOString(),
        }))}
        filter={filter}
      />
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
