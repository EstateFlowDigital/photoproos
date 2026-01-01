export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { GalleryDetailClient } from "./gallery-detail-client";

// Demo gallery data
const demoGalleries: Record<string, {
  id: string;
  name: string;
  description: string;
  client: { name: string; email: string };
  status: "delivered" | "pending" | "draft";
  priceCents: number;
  serviceId?: string;
  serviceDescription?: string;
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
    description: "Beautiful downtown property with stunning city views. 3 bedroom, 2.5 bath luxury condo in the heart of the city. This comprehensive photography package includes interior shots, exterior views, and twilight photography to showcase the property's best features.",
    client: { name: "Premier Realty", email: "contact@premierrealty.com" },
    status: "delivered",
    priceCents: 45000,
    serviceId: "re-luxury",
    serviceDescription: "Premium photography package for high-end and luxury properties",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop", filename: "exterior-front.jpg" },
      { id: "p2", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop", filename: "living-room.jpg" },
      { id: "p3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=400&h=300&fit=crop", filename: "kitchen.jpg" },
      { id: "p4", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop", filename: "master-bedroom.jpg" },
      { id: "p5", url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=400&h=300&fit=crop", filename: "bathroom.jpg" },
      { id: "p6", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&h=300&fit=crop", filename: "backyard.jpg" },
      { id: "p7", url: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=400&h=300&fit=crop", filename: "dining-room.jpg" },
      { id: "p8", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=400&h=300&fit=crop", filename: "office.jpg" },
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
    priceCents: 58000,
    serviceId: "re-luxury",
    serviceDescription: "Premium photography package for high-end and luxury properties",
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
    priceCents: 50000,
    serviceId: "portrait-team",
    serviceDescription: "Consistent headshots for corporate teams and organizations",
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
    serviceId: undefined,
    serviceDescription: "Complimentary coverage for portfolio building",
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
  serviceId: undefined,
  serviceDescription: "",
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
          <strong>Demo Mode:</strong> Viewing sample gallery data. Actions show toast notifications for demonstration.
        </p>
      </div>

      <GalleryDetailClient gallery={gallery} />
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
