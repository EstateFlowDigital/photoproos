export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GalleryDetailClient } from "./gallery-detail-client";
import { getGallery, deliverGallery } from "@/lib/actions/galleries";

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;

  const gallery = await getGallery(id);

  if (!gallery) {
    notFound();
  }

  // Map to the format expected by GalleryDetailClient
  const mappedGallery = {
    id: gallery.id,
    name: gallery.name,
    description: gallery.description || "",
    client: {
      name: gallery.client?.company || gallery.client?.fullName || "No client",
      email: gallery.client?.email || "",
    },
    status: gallery.status as "delivered" | "pending" | "draft",
    priceCents: gallery.priceCents,
    serviceId: gallery.service?.id,
    serviceDescription: gallery.service?.description || undefined,
    photos: gallery.photos.map((photo) => ({
      id: photo.id,
      url: photo.thumbnailUrl || photo.url,
      filename: photo.filename,
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
      downloadResolution: "full" as const,
      expirationDate: gallery.expiresAt?.toISOString() || null,
      passwordProtected: !!gallery.password,
      allowFavorites: true, // Default to true, can be configured via schema update later
      allowComments: true,
    },
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={gallery.name}
        subtitle={`${gallery.photos.length} photos • Created ${new Date(gallery.createdAt).toLocaleDateString()}`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href="/galleries"
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back
            </Link>
            <Link
              href={`/galleries/${id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <EditIcon className="h-4 w-4" />
              Edit
            </Link>
            {gallery.status !== "delivered" && (
              <form
                action={async () => {
                  "use server";
                  await deliverGallery(id);
                }}
              >
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
                >
                  <SendIcon className="h-4 w-4" />
                  Deliver Gallery
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
