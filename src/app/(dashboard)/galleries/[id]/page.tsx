export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { cn } from "@/lib/utils";

// Demo gallery data
const demoGalleries: Record<string, {
  id: string;
  name: string;
  description: string;
  client: { name: string; email: string };
  status: "delivered" | "pending" | "draft";
  priceCents: number;
  photos: { id: string; url: string; filename: string }[];
  deliveryLink: string | null;
  views: number;
  downloads: number;
  createdAt: string;
  deliveredAt: string | null;
}> = {
  "1": {
    id: "1",
    name: "Downtown Luxury Listing",
    description: "Beautiful downtown property with stunning city views. 3 bedroom, 2.5 bath luxury condo in the heart of the city.",
    client: { name: "Premier Realty", email: "contact@premierrealty.com" },
    status: "delivered",
    priceCents: 425000,
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", filename: "exterior-front.jpg" },
      { id: "p2", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", filename: "living-room.jpg" },
      { id: "p3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", filename: "kitchen.jpg" },
      { id: "p4", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", filename: "master-bedroom.jpg" },
      { id: "p5", url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop", filename: "bathroom.jpg" },
      { id: "p6", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", filename: "backyard.jpg" },
    ],
    deliveryLink: "https://gallery.photoproos.com/g/abc123",
    views: 147,
    downloads: 42,
    createdAt: "2024-12-15",
    deliveredAt: "2024-12-18",
  },
  "2": {
    id: "2",
    name: "Oceanfront Estate",
    description: "Stunning oceanfront property with panoramic views. 5 bedroom estate with private beach access.",
    client: { name: "Berkshire Properties", email: "listings@berkshire.com" },
    status: "delivered",
    priceCents: 580000,
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", filename: "ocean-view.jpg" },
      { id: "p2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", filename: "exterior.jpg" },
      { id: "p3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", filename: "interior.jpg" },
    ],
    deliveryLink: "https://gallery.photoproos.com/g/def456",
    views: 89,
    downloads: 28,
    createdAt: "2024-12-10",
    deliveredAt: "2024-12-14",
  },
  "3": {
    id: "3",
    name: "Corporate Headshots Q4",
    description: "Professional headshots for the Tech Solutions Inc team. Executive and staff photos.",
    client: { name: "Tech Solutions Inc", email: "admin@techsolutions.com" },
    status: "pending",
    priceCents: 218000,
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop", filename: "ceo-portrait.jpg" },
      { id: "p2", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop", filename: "cto-portrait.jpg" },
      { id: "p3", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=300&fit=crop", filename: "team-lead.jpg" },
    ],
    deliveryLink: null,
    views: 0,
    downloads: 0,
    createdAt: "2024-12-20",
    deliveredAt: null,
  },
  "5": {
    id: "5",
    name: "Modern Office Space",
    description: "Contemporary office design for Design Studio Pro. Showcasing their new workspace.",
    client: { name: "Design Studio Pro", email: "hello@designstudiopro.com" },
    status: "draft",
    priceCents: 0,
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop", filename: "reception.jpg" },
      { id: "p2", url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=400&h=300&fit=crop", filename: "workspace.jpg" },
    ],
    deliveryLink: null,
    views: 0,
    downloads: 0,
    createdAt: "2024-12-28",
    deliveredAt: null,
  },
};

// Default gallery for unknown IDs
const defaultGallery = {
  id: "0",
  name: "Sample Gallery",
  description: "This is a sample gallery for demonstration purposes.",
  client: { name: "Demo Client", email: "demo@example.com" },
  status: "draft" as const,
  priceCents: 0,
  photos: [],
  deliveryLink: null,
  views: 0,
  downloads: 0,
  createdAt: new Date().toISOString().split("T")[0],
  deliveredAt: null,
};

interface GalleryDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function GalleryDetailPage({ params }: GalleryDetailPageProps) {
  const { id } = await params;
  const gallery = demoGalleries[id] || { ...defaultGallery, id };

  const statusStyles = {
    delivered: "bg-[var(--success)]/10 text-[var(--success)]",
    pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
    draft: "bg-[var(--foreground-muted)]/10 text-foreground-muted",
  };

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(cents / 100);
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
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
              >
                <SendIcon className="h-4 w-4" />
                Deliver Gallery
              </button>
            )}
          </div>
        }
      />

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Viewing sample gallery data. Actions are disabled.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Status & Stats */}
          <div className="grid gap-4 sm:grid-cols-4">
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Status</p>
              <span className={cn("mt-2 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium", statusStyles[gallery.status])}>
                {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
              </span>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Revenue</p>
              <p className="mt-2 text-2xl font-bold text-foreground">
                {gallery.priceCents > 0 ? formatCurrency(gallery.priceCents) : "Free"}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Views</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{gallery.views}</p>
            </div>
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
              <p className="text-xs font-medium text-foreground-muted uppercase tracking-wider">Downloads</p>
              <p className="mt-2 text-2xl font-bold text-foreground">{gallery.downloads}</p>
            </div>
          </div>

          {/* Photo Grid */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-foreground">Photos</h2>
              <button className="inline-flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <UploadIcon className="h-4 w-4" />
                Add Photos
              </button>
            </div>

            {gallery.photos.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {gallery.photos.map((photo) => (
                  <div key={photo.id} className="group relative aspect-[4/3] overflow-hidden rounded-lg bg-[var(--background)]">
                    <img
                      src={photo.url}
                      alt={photo.filename}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="absolute bottom-0 left-0 right-0 p-3">
                        <p className="text-sm font-medium text-white truncate">{photo.filename}</p>
                      </div>
                    </div>
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="rounded-lg bg-black/50 p-1.5 text-white hover:bg-black/70">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="border-2 border-dashed border-[var(--card-border)] rounded-lg p-12 text-center">
                <PhotoIcon className="mx-auto h-12 w-12 text-foreground-muted" />
                <p className="mt-3 text-sm text-foreground">No photos yet</p>
                <p className="mt-1 text-xs text-foreground-muted">Upload photos to get started</p>
              </div>
            )}
          </div>

          {/* Description */}
          {gallery.description && (
            <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
              <h2 className="text-lg font-semibold text-foreground mb-3">Description</h2>
              <p className="text-sm text-foreground-secondary">{gallery.description}</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Client Info */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Client</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-semibold">
                {gallery.client.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{gallery.client.name}</p>
                <p className="text-xs text-foreground-muted">{gallery.client.email}</p>
              </div>
            </div>
            <Link
              href={`/clients/1`}
              className="mt-4 flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              View Client Profile
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>

          {/* Delivery Link */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Delivery Link</h2>
            {gallery.deliveryLink ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-[var(--background)] px-3 py-2 text-sm">
                  <LinkIcon className="h-4 w-4 text-foreground-muted shrink-0" />
                  <span className="truncate text-foreground-secondary">{gallery.deliveryLink}</span>
                </div>
                <div className="grid gap-2 grid-cols-2">
                  <button className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    <CopyIcon className="h-4 w-4" />
                    Copy
                  </button>
                  <a
                    href={gallery.deliveryLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
                  >
                    <ExternalLinkIcon className="h-4 w-4" />
                    Open
                  </a>
                </div>
                {gallery.deliveredAt && (
                  <p className="text-xs text-foreground-muted">
                    Delivered on {new Date(gallery.deliveredAt).toLocaleDateString()}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-4">
                <LinkIcon className="mx-auto h-8 w-8 text-foreground-muted" />
                <p className="mt-2 text-sm text-foreground-muted">No delivery link yet</p>
                <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                  Generate Link
                </button>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <DownloadIcon className="h-4 w-4 text-foreground-muted" />
                Download All Photos
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <EmailIcon className="h-4 w-4 text-foreground-muted" />
                Email Gallery to Client
              </button>
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-[var(--background-hover)]">
                <DuplicateIcon className="h-4 w-4 text-foreground-muted" />
                Duplicate Gallery
              </button>
              <hr className="border-[var(--card-border)]" />
              <button className="w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-[var(--error)] transition-colors hover:bg-[var(--error)]/10">
                <TrashIcon className="h-4 w-4" />
                Delete Gallery
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Icon Components
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
      <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
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

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M9.25 13.25a.75.75 0 0 0 1.5 0V4.636l2.955 3.129a.75.75 0 0 0 1.09-1.03l-4.25-4.5a.75.75 0 0 0-1.09 0l-4.25 4.5a.75.75 0 1 0 1.09 1.03L9.25 4.636v8.614Z" />
      <path d="M3.5 12.75a.75.75 0 0 0-1.5 0v2.5A2.75 2.75 0 0 0 4.75 18h10.5A2.75 2.75 0 0 0 18 15.25v-2.5a.75.75 0 0 0-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5Z" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
    </svg>
  );
}

function PhotoIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}

function ChevronRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.22 5.22a.75.75 0 0 1 1.06 0l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06-1.06L11.94 10 8.22 6.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
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

function CopyIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}

function ExternalLinkIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
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

function EmailIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3 4a2 2 0 0 0-2 2v1.161l8.441 4.221a1.25 1.25 0 0 0 1.118 0L19 7.162V6a2 2 0 0 0-2-2H3Z" />
      <path d="m19 8.839-7.77 3.885a2.75 2.75 0 0 1-2.46 0L1 8.839V14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.839Z" />
    </svg>
  );
}

function DuplicateIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M7 3.5A1.5 1.5 0 0 1 8.5 2h3.879a1.5 1.5 0 0 1 1.06.44l3.122 3.12A1.5 1.5 0 0 1 17 6.622V12.5a1.5 1.5 0 0 1-1.5 1.5h-1v-3.379a3 3 0 0 0-.879-2.121L10.5 5.379A3 3 0 0 0 8.379 4.5H7v-1Z" />
      <path d="M4.5 6A1.5 1.5 0 0 0 3 7.5v9A1.5 1.5 0 0 0 4.5 18h7a1.5 1.5 0 0 0 1.5-1.5v-5.879a1.5 1.5 0 0 0-.44-1.06L9.44 6.439A1.5 1.5 0 0 0 8.378 6H4.5Z" />
    </svg>
  );
}
