import { cn } from "@/lib/utils";
import Link from "next/link";

// Demo gallery data
const demoGalleries: Record<string, {
  id: string;
  name: string;
  description: string;
  photographer: { name: string; logoUrl: string | null };
  status: "delivered" | "pending";
  price: number;
  isPaid: boolean;
  allowDownload: boolean;
  allowFavorites: boolean;
  photos: { id: string; url: string; filename: string; width: number; height: number }[];
  primaryColor: string;
  theme: "dark" | "light";
}> = {
  "abc123": {
    id: "1",
    name: "Downtown Luxury Listing",
    description: "Beautiful downtown property with stunning city views. Professional photography by Thompson Photography.",
    photographer: { name: "Thompson Photography", logoUrl: null },
    status: "delivered",
    price: 42500,
    isPaid: true,
    allowDownload: true,
    allowFavorites: true,
    primaryColor: "#3b82f6",
    theme: "dark",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", filename: "exterior-front.jpg", width: 4, height: 3 },
      { id: "p2", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", filename: "living-room.jpg", width: 4, height: 3 },
      { id: "p3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", filename: "kitchen.jpg", width: 4, height: 3 },
      { id: "p4", url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800", filename: "master-bedroom.jpg", width: 4, height: 3 },
      { id: "p5", url: "https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800", filename: "bathroom.jpg", width: 3, height: 4 },
      { id: "p6", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", filename: "backyard.jpg", width: 4, height: 3 },
      { id: "p7", url: "https://images.unsplash.com/photo-1600573472591-ee6c563ded48?w=800", filename: "dining-room.jpg", width: 4, height: 3 },
      { id: "p8", url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800", filename: "office.jpg", width: 4, height: 3 },
    ],
  },
  "def456": {
    id: "2",
    name: "Oceanfront Estate",
    description: "Stunning oceanfront property with panoramic views. 5 bedroom estate with private beach access.",
    photographer: { name: "Thompson Photography", logoUrl: null },
    status: "delivered",
    price: 58000,
    isPaid: false,
    allowDownload: true,
    allowFavorites: true,
    primaryColor: "#3b82f6",
    theme: "dark",
    photos: [
      { id: "p1", url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", filename: "ocean-view.jpg", width: 4, height: 3 },
      { id: "p2", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", filename: "exterior.jpg", width: 4, height: 3 },
      { id: "p3", url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800", filename: "interior.jpg", width: 4, height: 3 },
      { id: "p4", url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", filename: "pool.jpg", width: 4, height: 3 },
    ],
  },
};

const defaultGallery = {
  id: "0",
  name: "Sample Gallery",
  description: "This gallery does not exist or the link has expired.",
  photographer: { name: "PhotoProOS", logoUrl: null },
  status: "pending" as const,
  price: 0,
  isPaid: false,
  allowDownload: false,
  allowFavorites: false,
  primaryColor: "#3b82f6",
  theme: "dark" as const,
  photos: [],
};

interface PublicGalleryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicGalleryPage({ params }: PublicGalleryPageProps) {
  const { slug } = await params;
  const gallery = demoGalleries[slug] || defaultGallery;

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  const bgColor = gallery.theme === "dark" ? "#0a0a0a" : "#ffffff";
  const textColor = gallery.theme === "dark" ? "#ffffff" : "#0a0a0a";
  const mutedColor = gallery.theme === "dark" ? "#a7a7a7" : "#6b7280";
  const cardBg = gallery.theme === "dark" ? "#141414" : "#f3f4f6";

  if (gallery.photos.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center mb-6">
            <ExclamationIcon className="h-8 w-8 text-[var(--error)]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Gallery Not Found</h1>
          <p style={{ color: mutedColor }}>
            This gallery does not exist or the link has expired. Please contact your photographer for assistance.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: gallery.primaryColor }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
      {/* Header */}
      <header
        className="sticky top-0 z-50 border-b"
        style={{ backgroundColor: bgColor, borderColor: gallery.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Photographer */}
            <div className="flex items-center gap-3">
              {gallery.photographer.logoUrl ? (
                <img src={gallery.photographer.logoUrl} alt={gallery.photographer.name} className="h-8" />
              ) : (
                <span className="text-lg font-semibold">{gallery.photographer.name}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {gallery.allowFavorites && (
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{ backgroundColor: cardBg }}
                >
                  <HeartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                  <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ backgroundColor: gallery.primaryColor, color: "#fff" }}>
                    0
                  </span>
                </button>
              )}
              {gallery.isPaid && gallery.allowDownload ? (
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: gallery.primaryColor }}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download All
                </button>
              ) : !gallery.isPaid && gallery.price > 0 ? (
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: gallery.primaryColor }}
                >
                  <LockIcon className="h-4 w-4" />
                  Unlock for {formatCurrency(gallery.price)}
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Info */}
      <div className="border-b" style={{ borderColor: gallery.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">{gallery.name}</h1>
          <p style={{ color: mutedColor }}>{gallery.description}</p>
          <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: mutedColor }}>
            <span className="flex items-center gap-1">
              <PhotoIcon className="h-4 w-4" />
              {gallery.photos.length} photos
            </span>
            {gallery.isPaid ? (
              <span className="flex items-center gap-1 text-green-500">
                <CheckIcon className="h-4 w-4" />
                Paid - Downloads enabled
              </span>
            ) : gallery.price > 0 ? (
              <span className="flex items-center gap-1">
                <LockIcon className="h-4 w-4" />
                {formatCurrency(gallery.price)} to unlock downloads
              </span>
            ) : (
              <span className="flex items-center gap-1 text-green-500">
                <CheckIcon className="h-4 w-4" />
                Free - Downloads enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Payment Banner (if not paid) */}
      {!gallery.isPaid && gallery.price > 0 && (
        <div
          className="border-b"
          style={{
            backgroundColor: `${gallery.primaryColor}15`,
            borderColor: `${gallery.primaryColor}30`,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: gallery.primaryColor }}>
                  Unlock this gallery to download your photos
                </p>
                <p className="text-sm" style={{ color: mutedColor }}>
                  One-time payment of {formatCurrency(gallery.price)} for full access
                </p>
              </div>
              <button
                className="flex items-center gap-2 rounded-lg px-6 py-2.5 text-sm font-medium text-white transition-colors"
                style={{ backgroundColor: gallery.primaryColor }}
              >
                Pay {formatCurrency(gallery.price)}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {gallery.photos.map((photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              style={{ backgroundColor: cardBg }}
            >
              <img
                src={photo.url}
                alt={photo.filename}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  !gallery.isPaid && gallery.price > 0 && "blur-sm"
                )}
              />

              {/* Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <p className="text-sm font-medium text-white truncate">{photo.filename}</p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {gallery.allowFavorites && (
                  <button className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                    <HeartIcon className="h-4 w-4" />
                  </button>
                )}
                {gallery.isPaid && gallery.allowDownload && (
                  <button className="rounded-full bg-black/50 p-2 text-white hover:bg-black/70 transition-colors">
                    <DownloadIcon className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Lock Icon for unpaid */}
              {!gallery.isPaid && gallery.price > 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="rounded-full bg-black/50 p-3">
                    <LockIcon className="h-6 w-6 text-white" />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer
        className="border-t py-8"
        style={{ borderColor: gallery.theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: mutedColor }}>
              Photos by {gallery.photographer.name}
            </p>
            <p className="text-sm" style={{ color: mutedColor }}>
              Powered by{" "}
              <Link href="/" className="hover:underline" style={{ color: gallery.primaryColor }}>
                PhotoProOS
              </Link>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Icons
function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
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

function LockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 1a4.5 4.5 0 0 0-4.5 4.5V9H5a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2h-.5V5.5A4.5 4.5 0 0 0 10 1Zm3 8V5.5a3 3 0 1 0-6 0V9h6Z" clipRule="evenodd" />
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

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}

function ExclamationIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}
