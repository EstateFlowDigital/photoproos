export const dynamic = "force-dynamic";
import { PageHeader, Breadcrumb } from "@/components/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryDetailClient } from "./gallery-detail-client";
import { GalleryActions } from "./gallery-actions";
import { getGallery, deliverGallery } from "@/lib/actions/galleries";
import { getClientInvoices } from "@/lib/actions/invoices";
import { getGalleryDownloadAnalytics } from "@/lib/actions/download-tracking";

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;

  const gallery = await getGallery(id);

  if (!gallery) {
    notFound();
  }

  // Check if this is a real estate gallery
  const isRealEstateGallery = gallery.service?.category === "real_estate";
  const hasPropertyWebsite = !!gallery.propertyWebsite;

  // Fetch invoices and analytics in parallel
  const [invoices, analyticsResult] = await Promise.all([
    gallery.client?.id ? getClientInvoices(gallery.client.id) : Promise.resolve([]),
    gallery.status === "delivered" ? getGalleryDownloadAnalytics(id) : Promise.resolve(null),
  ]);

  // Map to the format expected by GalleryDetailClient
  const mappedGallery = {
    id: gallery.id,
    name: gallery.name,
    description: gallery.description || "",
    client: {
      id: gallery.client?.id,
      name: gallery.client?.company || gallery.client?.fullName || "No client",
      email: gallery.client?.email || "",
      phone: gallery.client?.phone || undefined,
    },
    status: gallery.status as "delivered" | "pending" | "draft",
    priceCents: gallery.priceCents,
    serviceId: gallery.service?.id,
    serviceCategory: gallery.service?.category,
    serviceDescription: gallery.service?.description || undefined,
    photos: gallery.photos.map((photo) => ({
      id: photo.id,
      url: photo.thumbnailUrl || photo.url,
      thumbnailUrl: photo.thumbnailUrl,
      mediumUrl: photo.mediumUrl,
      filename: photo.filename,
      collectionId: photo.collectionId ?? null,
      width: photo.width,
      height: photo.height,
      exifData: photo.exifData,
    })),
    deliveryLink: gallery.deliverySlug
      ? `${process.env.NEXT_PUBLIC_APP_URL || ""}/g/${gallery.deliverySlug}`
      : null,
    views: gallery.viewCount,
    downloads: gallery.downloadCount,
    createdAt: gallery.createdAt.toISOString().split("T")[0],
    deliveredAt: gallery.deliveredAt?.toISOString().split("T")[0] || null,
    activity: gallery.activityLogs.map((log) => ({
      id: log.id,
      type: mapActivityType(log.type),
      description: log.description,
      timestamp: log.createdAt.toISOString(),
      user: log.user?.fullName || undefined,
    })),
    settings: {
      watermarkEnabled: gallery.showWatermark,
      allowDownloads: gallery.allowDownloads,
      downloadResolution: (gallery.downloadResolution || "both") as "full" | "web" | "both",
      downloadRequiresPayment: gallery.downloadRequiresPayment ?? true,
      expirationDate: gallery.expiresAt?.toISOString() || null,
      passwordProtected: !!gallery.password,
      password: gallery.password || null,
      allowFavorites: gallery.allowFavorites ?? true,
      allowComments: gallery.allowComments ?? false,
      allowSelections: gallery.allowSelections ?? false,
      selectionLimit: gallery.selectionLimit ?? null,
    },
    propertyWebsite: gallery.propertyWebsite,
    // Comments from the database
    comments: gallery.comments.map((comment) => ({
      id: comment.id,
      author: comment.clientName || "Client",
      text: comment.content,
      timestamp: comment.createdAt.toISOString(),
      isClient: true,
    })),
    // Invoices for this client
    invoices: invoices.map((invoice) => ({
      id: invoice.id,
      invoiceNumber: invoice.invoiceNumber,
      status: invoice.status,
      amount: invoice.totalCents / 100,
      dueDate: invoice.dueDate?.toISOString() || null,
      createdAt: invoice.createdAt.toISOString(),
    })),
    // Analytics data (for delivered galleries)
    analytics: analyticsResult?.success && analyticsResult.data
      ? {
          totalViews: gallery.viewCount,
          uniqueVisitors: analyticsResult.data.uniqueClients,
          totalDownloads: analyticsResult.data.totalDownloads,
          photoDownloads: analyticsResult.data.topPhotos.map((p) => ({
            photoId: p.assetId,
            count: p.count,
          })),
          viewsByDay: analyticsResult.data.downloadsByDay.map((d) => ({
            date: d.date,
            views: d.count,
          })),
          avgTimeOnPage: 0, // Not tracked yet
          deviceBreakdown: [], // Not tracked yet
          topPhotos: analyticsResult.data.topPhotos.map((p) => ({
            photoId: p.assetId,
            views: 0,
            downloads: p.count,
          })),
        }
      : undefined,
    // Selection settings
    allowSelections: (gallery as any).allowSelections ?? false,
    selectionLimit: (gallery as any).selectionLimit ?? null,
    selectionsSubmitted: (gallery as any).selectionsSubmitted ?? false,
  };

  return (
    <div className="space-y-6">
      <Breadcrumb
        items={[
          { label: "Galleries", href: "/galleries" },
          { label: gallery.name },
        ]}
      />
      <PageHeader
        title={gallery.name}
        subtitle={
          <span className="flex items-center gap-2 flex-wrap">
            {gallery.photos.length} photos • Created {new Date(gallery.createdAt).toLocaleDateString()}
            {gallery.client && (
              <>
                <span className="text-foreground-muted">•</span>
                <Link
                  href={`/clients/${gallery.client.id}`}
                  className="text-[var(--primary)] hover:underline"
                >
                  {gallery.client.company || gallery.client.fullName}
                </Link>
              </>
            )}
          </span>
        }
        actions={
          <div className="flex flex-wrap items-center gap-2 md:gap-3">
            <Link
              href="/galleries"
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              title="Back"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              <span className="hidden md:inline">Back</span>
            </Link>
            <Link
              href={`/galleries/${id}/edit`}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
              title="Edit"
            >
              <EditIcon className="h-4 w-4" />
              <span className="hidden md:inline">Edit</span>
            </Link>
            <GalleryActions
              galleryId={id}
              galleryName={gallery.name}
              photoCount={gallery.photos.length}
              deliveryLink={mappedGallery.deliveryLink}
              hasFavorites={(gallery as { favoriteCount?: number }).favoriteCount ? (gallery as { favoriteCount?: number }).favoriteCount! > 0 : false}
            />
            {/* Property Website Button - Only for Real Estate Galleries */}
            {isRealEstateGallery && (
              hasPropertyWebsite ? (
                <Link
                  href={`/properties/${gallery.propertyWebsite?.id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--success)]/30 bg-[var(--success)]/10 p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-[var(--success)] transition-colors hover:bg-[var(--success)]/20"
                  title="View Property Website"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span className="hidden lg:inline">View Property Website</span>
                </Link>
              ) : (
                <Link
                  href={`/properties/new?galleryId=${id}`}
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-[var(--primary)] transition-colors hover:bg-[var(--primary)]/20"
                  title="Create Property Website"
                >
                  <HomeIcon className="h-4 w-4" />
                  <span className="hidden lg:inline">Create Property Website</span>
                </Link>
              )
            )}
            {gallery.status !== "delivered" && (
              <form
                action={async () => {
                  "use server";
                  await deliverGallery(id);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-[var(--primary)] p-2.5 md:px-4 md:py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                  title="Deliver Gallery"
                >
                  <SendIcon className="h-4 w-4" />
                  <span className="hidden md:inline">Deliver Gallery</span>
                </button>
              </form>
            )}
          </div>
        }
      />

      <GalleryDetailClient gallery={mappedGallery} />
    </div>
  );
}

// Map activity log types to UI-friendly types
function mapActivityType(type: string): "created" | "edited" | "photos_added" | "delivered" | "viewed" | "downloaded" | "payment" | "note" {
  switch (type) {
    case "gallery_created":
      return "created";
    case "gallery_updated":
      return "edited";
    case "gallery_delivered":
      return "delivered";
    case "gallery_view":
      return "viewed";
    case "gallery_download":
      return "downloaded";
    case "payment_received":
      return "payment";
    default:
      return "note";
  }
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function EditIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M2.695 14.763l-1.262 3.154a.5.5 0 0 0 .65.65l3.155-1.262a4 4 0 0 0 1.343-.885L17.5 5.5a2.121 2.121 0 0 0-3-3L3.58 13.42a4 4 0 0 0-.885 1.343Z" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function HomeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-3a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" clipRule="evenodd" />
    </svg>
  );
}
