export const dynamic = "force-dynamic";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import { redirect } from "next/navigation";
import { getGalleryCounts } from "@/lib/actions/galleries";
import { GalleriesPageClient } from "./galleries-page-client";

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

  // Fetch galleries, counts, and clients in parallel
  const [galleries, counts, clients] = await Promise.all([
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
  ]);

  // Map galleries to the format expected by GalleriesPageClient
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

  // Map clients to the format expected by CreateGalleryModal
  const mappedClients = clients.map((c) => ({
    id: c.id,
    name: c.company || c.fullName || "Unknown",
    email: c.email,
  }));

  return (
    <div className="space-y-6">
      <GalleriesPageClient
        galleries={mappedGalleries}
        clients={mappedClients}
        filter={filter}
        counts={counts}
      />
    </div>
  );
}
