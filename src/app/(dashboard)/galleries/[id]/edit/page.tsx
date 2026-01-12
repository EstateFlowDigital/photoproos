export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GalleryEditForm } from "./gallery-edit-form";
import { getGallery } from "@/lib/actions/galleries";
import { prisma } from "@/lib/db";
import { getAuthContext } from "@/lib/auth/clerk";
import type { DatabaseServiceType } from "@/components/dashboard/service-selector";

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

async function getOrganizationServices(organizationId: string): Promise<DatabaseServiceType[]> {
  try {
    const services = await prisma.service.findMany({
      where: {
        organizationId,
        isActive: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return services.map((service) => ({
      id: service.id,
      name: service.name,
      category: service.category,
      description: service.description,
      priceCents: service.priceCents,
      duration: service.duration,
      deliverables: service.deliverables,
      isActive: service.isActive,
      isDefault: service.isDefault,
    }));
  } catch (error) {
    console.warn("[EditGallery] Error fetching organization services:", error);
    return [];
  }
}

async function getClients(organizationId: string) {
  try {
    const clients = await prisma.client.findMany({
      where: { organizationId },
      select: {
        id: true,
        fullName: true,
        company: true,
        email: true,
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return clients.map((c) => ({
      id: c.id,
      name: c.company || c.fullName || "Unknown",
      email: c.email,
    }));
  } catch (error) {
    console.warn("[EditGallery] Error fetching clients:", error);
    return [];
  }
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  // Get authenticated user and organization
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/sign-in");
  }

  const { id } = await params;

  const [gallery, clients, services] = await Promise.all([
    getGallery(id),
    getClients(auth.organizationId),
    getOrganizationServices(auth.organizationId),
  ]);

  if (!gallery) {
    notFound();
  }

  // Map to the format expected by GalleryEditForm
  const mappedGallery = {
    id: gallery.id,
    name: gallery.name,
    description: gallery.description || "",
    clientId: gallery.client?.id || "",
    priceCents: gallery.priceCents,
    serviceId: gallery.service?.id,
    serviceDescription: gallery.service?.description || undefined,
    accessType: gallery.password ? ("password" as const) : ("public" as const),
    coverImageUrl: gallery.coverImageUrl,
    expiresAt: gallery.expiresAt,
    settings: {
      allowDownloads: gallery.allowDownloads,
      allowFavorites: gallery.allowFavorites ?? true,
      allowComments: gallery.allowComments ?? false,
      showWatermarks: gallery.showWatermark,
      emailNotifications: gallery.sendNotifications ?? true,
      downloadResolution: (gallery.downloadResolution as "full" | "web" | "both") || "both",
      downloadRequiresPayment: gallery.downloadRequiresPayment ?? true,
      reminderEnabled: gallery.reminderEnabled ?? true,
    },
    // Selection settings
    allowSelections: gallery.allowSelections ?? false,
    selectionLimit: gallery.selectionLimit ?? null,
    selectionRequired: gallery.selectionRequired ?? false,
  };

  return (
    <div className="space-y-6" data-element="galleries-edit-page">
      <PageHeader
        title="Edit Gallery"
        subtitle={`Editing: ${gallery.name}`}
        actions={
          <div className="flex items-center gap-3">
            <Link
              href={`/galleries/${id}`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
              Back to Gallery
            </Link>
          </div>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <GalleryEditForm gallery={mappedGallery} clients={clients} services={services} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gallery Links */}
          {gallery.deliverySlug && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Links</h2>
              <div className="space-y-4">
                {/* Branded Gallery Link */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <span className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Branded Gallery Link
                    </span>
                  </label>
                  <p className="text-xs text-foreground-muted mb-2">
                    Includes your branding and business logo
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${gallery.deliverySlug}`}
                      className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs text-foreground-muted truncate"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${gallery.deliverySlug}`)}
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Clean Gallery Link */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    <span className="flex items-center gap-2">
                      <LinkIcon className="h-4 w-4" />
                      Clean Gallery Link
                    </span>
                  </label>
                  <p className="text-xs text-foreground-muted mb-2">
                    Minimal view without business branding
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${gallery.deliverySlug}?clean=true`}
                      className="flex-1 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs text-foreground-muted truncate"
                    />
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_APP_URL || ''}/g/${gallery.deliverySlug}?clean=true`)}
                      className="rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-xs font-medium text-foreground hover:bg-[var(--background-hover)]"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Gallery Status */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Current Status</label>
                <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                  gallery.status === "delivered"
                    ? "bg-[var(--success)]/10 text-[var(--success)]"
                    : gallery.status === "pending"
                    ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                    : "bg-[var(--foreground-muted)]/10 text-foreground-muted"
                }`}>
                  {gallery.status === "delivered" ? "Delivered" : gallery.status === "pending" ? "Pending" : "Draft"}
                </div>
              </div>
              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-xs text-foreground-muted mb-3">Quick Actions</p>
                <div className="space-y-2">
                  {gallery.deliverySlug && (
                    <Link
                      href={`/g/${gallery.deliverySlug}`}
                      target="_blank"
                      className="flex w-full items-center justify-center rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                    >
                      Preview Gallery
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Stats</h2>
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Photos</span>
                <span className="text-sm font-medium text-foreground">{gallery.photos.length}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Views</span>
                <span className="text-sm font-medium text-foreground">{gallery.viewCount}</span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-sm text-foreground-muted">Downloads</span>
                <span className="text-sm font-medium text-foreground">{gallery.downloadCount}</span>
              </div>
              {gallery.deliveredAt && (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm text-foreground-muted">Delivered</span>
                  <span className="text-sm font-medium text-foreground">
                    {new Date(gallery.deliveredAt).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Recent Activity */}
          {gallery.activityLogs.length > 0 && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
              <div className="space-y-4">
                {gallery.activityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex gap-3">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shrink-0 ${getActivityStyle(log.type)}`}>
                      {getActivityIcon(log.type)}
                    </div>
                    <div>
                      <p className="text-sm text-foreground">{log.description}</p>
                      <p className="text-xs text-foreground-muted">
                        {formatRelativeTime(log.createdAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function getActivityStyle(type: string): string {
  switch (type) {
    case "gallery_delivered":
      return "bg-[var(--success)]/10 text-[var(--success)]";
    case "gallery_view":
      return "bg-[var(--primary)]/10 text-[var(--primary)]";
    case "gallery_download":
      return "bg-[var(--warning)]/10 text-[var(--warning)]";
    case "payment_received":
      return "bg-[var(--success)]/10 text-[var(--success)]";
    default:
      return "bg-[var(--foreground-muted)]/10 text-foreground-muted";
  }
}

function getActivityIcon(type: string) {
  switch (type) {
    case "gallery_delivered":
      return <CheckIcon className="h-4 w-4" />;
    case "gallery_view":
      return <EyeIcon className="h-4 w-4" />;
    case "gallery_download":
      return <DownloadIcon className="h-4 w-4" />;
    case "payment_received":
      return <DollarIcon className="h-4 w-4" />;
    default:
      return <NoteIcon className="h-4 w-4" />;
  }
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? "s" : ""} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
  return date.toLocaleDateString();
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M17 10a.75.75 0 0 1-.75.75H5.612l4.158 3.96a.75.75 0 1 1-1.04 1.08l-5.5-5.25a.75.75 0 0 1 0-1.08l5.5-5.25a.75.75 0 1 1 1.04 1.08L5.612 9.25H16.25A.75.75 0 0 1 17 10Z" clipRule="evenodd" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v8.614L6.295 8.235a.75.75 0 1 0-1.09 1.03l4.25 4.5a.75.75 0 0 0 1.09 0l4.25-4.5a.75.75 0 0 0-1.09-1.03l-2.955 3.129V2.75Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function DollarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10.75 8.5a.75.75 0 0 0-1.5 0v.5h-.25a.75.75 0 0 0 0 1.5h1v.5H8.75a.75.75 0 0 0 0 1.5h1v.5a.75.75 0 0 0 1.5 0v-.5h.25a.75.75 0 0 0 0-1.5h-1V10h1.25a.75.75 0 0 0 0-1.5h-1v-.5Z" />
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-1.5a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13Z" clipRule="evenodd" />
    </svg>
  );
}

function NoteIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M12.232 4.232a2.5 2.5 0 0 1 3.536 3.536l-1.225 1.224a.75.75 0 0 0 1.061 1.06l1.224-1.224a4 4 0 0 0-5.656-5.656l-3 3a4 4 0 0 0 .225 5.865.75.75 0 0 0 .977-1.138 2.5 2.5 0 0 1-.142-3.667l3-3Z" />
      <path d="M11.603 7.963a.75.75 0 0 0-.977 1.138 2.5 2.5 0 0 1 .142 3.667l-3 3a2.5 2.5 0 0 1-3.536-3.536l1.225-1.224a.75.75 0 0 0-1.061-1.06l-1.224 1.224a4 4 0 1 0 5.656 5.656l3-3a4 4 0 0 0-.225-5.865Z" />
    </svg>
  );
}
