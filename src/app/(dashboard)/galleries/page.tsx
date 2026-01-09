export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getGalleryCounts } from "@/lib/actions/galleries";
import { GalleriesPageClient } from "./galleries-page-client";
import { formatCurrency } from "@/lib/utils/units";
import { Prisma } from "@prisma/client";
import { WalkthroughWrapper } from "@/components/walkthrough";
import { getWalkthroughPreference } from "@/lib/actions/walkthrough";

type FilterTab = "all" | "delivered" | "pending" | "draft";

interface GalleriesPageProps {
  searchParams: Promise<{ filter?: string }>;
}

const GALLERY_ADDON_STATUSES: ("pending" | "quoted" | "approved" | "in_progress")[] = ["pending", "quoted", "approved", "in_progress"];

const galleryListInclude = {
  client: { select: { fullName: true, company: true } },
  _count: {
    select: {
      assets: true,
      galleryAddonRequests: {
        where: { status: { in: GALLERY_ADDON_STATUSES } },
      },
    },
  },
  assets: {
    take: 1,
    orderBy: { createdAt: "desc" },
    select: { thumbnailUrl: true, originalUrl: true },
  },
  services: {
    include: {
      service: {
        select: { id: true, name: true, category: true },
      },
    },
    orderBy: { isPrimary: "desc" },
  },
} satisfies Prisma.ProjectInclude;

export default async function GalleriesPage({ searchParams }: GalleriesPageProps) {
  const params = await searchParams;
  const filter = (params.filter || "all") as FilterTab;

  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const organization = await prisma.organization.findUnique({
    where: { id: auth.organizationId },
  });

  if (!organization) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-semibold text-foreground">No organization found</h2>
          <p className="mt-2 text-foreground-muted">Please create an organization to get started.</p>
        </div>
      </div>
    );
  }

  // Build filter query
  const statusFilter = filter === "all" ? undefined : filter;

  // Fetch galleries, counts, clients, and services in parallel with error handling
  type GalleryWithIncludes = Prisma.ProjectGetPayload<{ include: typeof galleryListInclude }>;
  let galleries: GalleryWithIncludes[] = [];
  let counts = { all: 0, draft: 0, pending: 0, delivered: 0, archived: 0 };
  let clients: { id: string; fullName: string | null; company: string | null; email: string }[] = [];
  let services: { id: string; name: string; category: string }[] = [];

  try {
    // Primary query - galleries (critical)
    galleries = await prisma.project.findMany({
      where: {
        organizationId: organization.id,
        ...(statusFilter ? { status: statusFilter } : {}),
      },
      include: galleryListInclude,
      orderBy: { createdAt: "desc" },
    });
  } catch (error) {
    console.error("[Galleries] Failed to fetch galleries:", error);
    // Re-throw to trigger error boundary for critical failure
    throw new Error("Failed to load galleries. Please try again.");
  }

  // Secondary queries - can fail gracefully
  try {
    [counts, clients, services] = await Promise.all([
      getGalleryCounts(),
      prisma.client.findMany({
        where: { organizationId: organization.id },
        select: {
          id: true,
          fullName: true,
          company: true,
          email: true,
        },
        orderBy: { createdAt: "desc" },
        take: 50,
      }),
      prisma.service.findMany({
        where: { organizationId: organization.id, isActive: true },
        select: { id: true, name: true, category: true },
        orderBy: { name: "asc" },
      }),
    ]);
  } catch (error) {
    console.error("[Galleries] Failed to fetch secondary data:", error);
    // Continue with defaults - these aren't critical for viewing galleries
  }

  // Get walkthrough preference
  const walkthroughResult = await getWalkthroughPreference("galleries");
  const walkthroughState = walkthroughResult.success && walkthroughResult.data
    ? walkthroughResult.data.state
    : "open";

  // Map galleries to the format expected by GalleriesPageClient
  const mappedGalleries = galleries.map((gallery) => ({
    id: gallery.id,
    name: gallery.name,
    client: gallery.client?.company || gallery.client?.fullName || "No client",
    photos: gallery._count.assets,
    status: gallery.status as "delivered" | "pending" | "draft" | "archived",
    revenue: gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : undefined,
    thumbnailUrl: gallery.coverImageUrl || gallery.assets[0]?.thumbnailUrl || gallery.assets[0]?.originalUrl || undefined,
    createdAt: gallery.createdAt.toISOString(),
    views: gallery.viewCount,
    downloads: gallery.downloadCount,
    pendingAddonRequests: gallery._count.galleryAddonRequests,
    services: (gallery.services || []).map((ps) => ({
      id: ps.service.id,
      name: ps.service.name,
      category: ps.service.category,
      isPrimary: ps.isPrimary,
    })),
  }));

  // Map services for filter dropdown
  const mappedServices = services.map((s) => ({
    id: s.id,
    name: s.name,
    category: s.category,
  }));

  // Map clients to the format expected by CreateGalleryModal
  const mappedClients = clients.map((c) => ({
    id: c.id,
    name: c.company || c.fullName || "Unknown",
    email: c.email,
  }));

  return (
    <div className="space-y-6" data-element="galleries-page">
      {/* Page Walkthrough */}
      <WalkthroughWrapper
        pageId="galleries"
        initialState={walkthroughState}
      />

      <GalleriesPageClient
        galleries={mappedGalleries}
        clients={mappedClients}
        filter={filter}
        counts={counts}
        availableServices={mappedServices}
      />
    </div>
  );
}
