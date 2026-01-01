export const dynamic = "force-dynamic";
import { PageHeader } from "@/components/dashboard";
import Link from "next/link";
import { GalleryEditForm } from "./gallery-edit-form";

// Demo clients for the dropdown
const demoClients = [
  { id: "1", name: "Premier Realty", email: "contact@premierrealty.com" },
  { id: "2", name: "Tech Solutions Inc", email: "admin@techsolutions.com" },
  { id: "3", name: "Bella Cucina", email: "info@bellacucina.com" },
  { id: "4", name: "Design Studio Pro", email: "hello@designstudiopro.com" },
  { id: "5", name: "Sarah Mitchell", email: "sarah.m@email.com" },
  { id: "6", name: "Berkshire Properties", email: "listings@berkshire.com" },
  { id: "7", name: "Innovate Tech", email: "events@innovatetech.com" },
  { id: "8", name: "Luxury Living Realty", email: "info@luxuryliving.com" },
];

// Demo gallery data with service info
const demoGalleries: Record<string, {
  id: string;
  name: string;
  description: string;
  clientId: string;
  priceCents: number;
  serviceId?: string;
  serviceDescription?: string;
  accessType: "public" | "password";
  coverImageUrl: string | null;
  settings: {
    allowDownloads: boolean;
    allowFavorites: boolean;
    showWatermarks: boolean;
    emailNotifications: boolean;
  };
}> = {
  "1": {
    id: "1",
    name: "Downtown Luxury Listing",
    description: "Beautiful downtown property with stunning city views. 3 bedroom, 2.5 bath luxury condo in the heart of the city.",
    clientId: "1",
    priceCents: 45000,
    serviceId: "re-luxury",
    serviceDescription: "Premium photography package for high-end and luxury properties",
    accessType: "public",
    coverImageUrl: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=400&h=300&fit=crop",
    settings: {
      allowDownloads: true,
      allowFavorites: true,
      showWatermarks: false,
      emailNotifications: true,
    },
  },
  "2": {
    id: "2",
    name: "Oceanfront Estate",
    description: "Stunning oceanfront property with panoramic views. 5 bedroom estate with private beach access.",
    clientId: "6",
    priceCents: 58000,
    serviceId: "re-luxury",
    serviceDescription: "Premium photography package for high-end and luxury properties",
    accessType: "public",
    coverImageUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=400&h=300&fit=crop",
    settings: {
      allowDownloads: true,
      allowFavorites: true,
      showWatermarks: false,
      emailNotifications: true,
    },
  },
  "3": {
    id: "3",
    name: "Corporate Headshots Q4",
    description: "Professional headshots for the Tech Solutions Inc team. Executive and staff photos.",
    clientId: "2",
    priceCents: 50000,
    serviceId: "portrait-team",
    serviceDescription: "Consistent headshots for corporate teams and organizations",
    accessType: "password",
    coverImageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=300&fit=crop",
    settings: {
      allowDownloads: true,
      allowFavorites: false,
      showWatermarks: true,
      emailNotifications: true,
    },
  },
  "5": {
    id: "5",
    name: "Modern Office Space",
    description: "Contemporary office design for Design Studio Pro. Showcasing their new workspace.",
    clientId: "4",
    priceCents: 0,
    serviceId: undefined,
    serviceDescription: "Complimentary coverage for portfolio building",
    accessType: "public",
    coverImageUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=400&h=300&fit=crop",
    settings: {
      allowDownloads: true,
      allowFavorites: true,
      showWatermarks: false,
      emailNotifications: true,
    },
  },
};

const defaultGallery = {
  id: "0",
  name: "Sample Gallery",
  description: "This is a sample gallery for demonstration purposes.",
  clientId: "1",
  priceCents: 0,
  serviceId: undefined,
  serviceDescription: "",
  accessType: "public" as const,
  coverImageUrl: null,
  settings: {
    allowDownloads: true,
    allowFavorites: true,
    showWatermarks: false,
    emailNotifications: true,
  },
};

interface EditGalleryPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGalleryPage({ params }: EditGalleryPageProps) {
  const { id } = await params;
  const gallery = demoGalleries[id] || { ...defaultGallery, id };

  return (
    <div className="space-y-6">
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

      {/* Demo Mode Banner */}
      <div className="rounded-lg border border-[var(--primary)]/30 bg-[var(--primary)]/10 px-4 py-3">
        <p className="text-sm text-[var(--primary)]">
          <strong>Demo Mode:</strong> Form submissions are disabled. This is a preview of the gallery edit flow.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <GalleryEditForm gallery={gallery} clients={demoClients} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Gallery Status */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Gallery Status</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2.5 text-sm text-foreground">
                  <option value="draft">Draft</option>
                  <option value="pending">Pending Review</option>
                  <option value="delivered">Delivered</option>
                </select>
              </div>
              <div className="pt-4 border-t border-[var(--card-border)]">
                <p className="text-xs text-foreground-muted mb-3">Quick Actions</p>
                <div className="space-y-2">
                  <button className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]">
                    Preview Gallery
                  </button>
                  <button className="w-full rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90">
                    Deliver to Client
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Log */}
          <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h2>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--success)]/10 text-[var(--success)] shrink-0">
                  <CheckIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Gallery delivered</p>
                  <p className="text-xs text-foreground-muted">2 days ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--primary)]/10 text-[var(--primary)] shrink-0">
                  <EyeIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Client viewed gallery</p>
                  <p className="text-xs text-foreground-muted">2 days ago</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--warning)]/10 text-[var(--warning)] shrink-0">
                  <CreditCardIcon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm text-foreground">Payment received</p>
                  <p className="text-xs text-foreground-muted">1 day ago</p>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-xl border border-[var(--error)]/30 bg-[var(--error)]/5 p-6">
            <h2 className="text-lg font-semibold text-[var(--error)] mb-2">Danger Zone</h2>
            <p className="text-sm text-foreground-muted mb-4">
              Deleting this gallery will permanently remove all photos and cannot be undone.
            </p>
            <button
              type="button"
              className="w-full rounded-lg border border-[var(--error)] bg-transparent px-4 py-2 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/10"
            >
              Delete Gallery
            </button>
          </div>
        </div>
      </div>
    </div>
  );
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

function CreditCardIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2.5 4A1.5 1.5 0 0 0 1 5.5V6h18v-.5A1.5 1.5 0 0 0 17.5 4h-15ZM19 8.5H1v6A1.5 1.5 0 0 0 2.5 16h15a1.5 1.5 0 0 0 1.5-1.5v-6ZM3 13.25a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 0 1.5h-1.5a.75.75 0 0 1-.75-.75Zm4.75-.75a.75.75 0 0 0 0 1.5h3.5a.75.75 0 0 0 0-1.5h-3.5Z" clipRule="evenodd" />
    </svg>
  );
}
