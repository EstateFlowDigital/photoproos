import { cn } from "@/lib/utils";
import { getGalleryThemeColors, getThemedLogoUrl, type ResolvedTheme } from "@/lib/theme";
import Link from "next/link";
import { cookies } from "next/headers";
import { getPublicGallery, recordGalleryView } from "@/lib/actions/galleries";
import { PayButton } from "./pay-button";
import { GalleryClient } from "./gallery-client";
import { PasswordGate } from "./password-gate";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl?: string | null;
  mediumUrl?: string | null;
  originalUrl: string;
  filename: string;
  width: number;
  height: number;
}

interface PublicGalleryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ preview?: string }>;
}

export default async function PublicGalleryPage({ params, searchParams }: PublicGalleryPageProps) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const isPreview = preview === "true";
  const gallery = await getPublicGallery(slug, isPreview);

  // Record the view (fire and forget) - skip in preview mode
  if (gallery && !isPreview) {
    recordGalleryView(slug).catch(() => {
      // Silently ignore view recording errors
    });
  }

  // Check if gallery is password protected and user is authenticated
  if (gallery && gallery.isPasswordProtected && !isPreview) {
    const cookieStore = await cookies();
    const authCookie = cookieStore.get(`gallery_auth_${gallery.id}`);

    if (!authCookie || authCookie.value !== "authenticated") {
      // Show password gate
      const theme = gallery.theme === "auto" ? "dark" : gallery.theme || "dark";
      return (
        <PasswordGate
          galleryId={gallery.id}
          galleryName={gallery.name}
          photographerName={gallery.photographer.name}
          logoUrl={theme === "light" ? gallery.photographer.logoLightUrl : gallery.photographer.logoUrl}
          primaryColor={gallery.primaryColor || "#3b82f6"}
          theme={theme}
        />
      );
    }
  }

  const formatCurrency = (cents: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
    }).format(cents / 100);
  };

  // Default theme settings
  const theme = gallery?.theme || "dark";
  const primaryColor = gallery?.primaryColor || "#3b82f6";
  const accentColor = gallery?.accentColor || "#22c55e";
  const hidePlatformBranding = gallery?.hidePlatformBranding || false;

  // For "auto" theme, we render client component that detects system preference
  // For explicit dark/light, we render appropriate colors
  const resolvedTheme: ResolvedTheme = theme === "auto" ? "dark" : theme;
  const colors = getGalleryThemeColors(resolvedTheme);

  // Gallery not found or not available
  if (!gallery || gallery.photos.length === 0) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8"
        style={{ backgroundColor: colors.bgColor, color: colors.textColor }}
      >
        <div className="text-center max-w-md">
          <div className="mx-auto h-16 w-16 rounded-full bg-[var(--error)]/10 flex items-center justify-center mb-6">
            <ExclamationIcon className="h-8 w-8 text-[var(--error)]" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Gallery Not Found</h1>
          <p style={{ color: colors.mutedColor }}>
            This gallery does not exist, has not been delivered yet, or the link has expired. Please contact your photographer for assistance.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  }

  // For auto theme, use client component
  if (theme === "auto") {
    return (
      <GalleryClient
        gallery={gallery}
        isPreview={isPreview}
        formatCurrency={formatCurrency}
      />
    );
  }

  // Get the appropriate logo based on theme
  const logoUrl = getThemedLogoUrl(
    resolvedTheme,
    gallery.photographer.logoUrl,
    gallery.photographer.logoLightUrl
  );

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bgColor, color: colors.textColor }}>
      {/* Preview Mode Banner */}
      {isPreview && (
        <div className="sticky top-0 z-[60] bg-amber-500 text-black px-4 py-2 text-center text-sm font-medium">
          <span className="inline-flex items-center gap-2">
            <EyeIcon className="h-4 w-4" />
            Preview Mode - This gallery has not been delivered to the client yet
          </span>
        </div>
      )}

      {/* Header */}
      <header
        className={cn("sticky z-50 border-b", isPreview ? "top-[36px]" : "top-0")}
        style={{ backgroundColor: colors.bgColor, borderColor: colors.borderColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo / Photographer */}
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt={gallery.photographer.name} className="h-8" />
              ) : (
                <span className="text-lg font-semibold">{gallery.photographer.name}</span>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3">
              {gallery.allowFavorites && (
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors"
                  style={{ backgroundColor: colors.cardBg }}
                >
                  <HeartIcon className="h-4 w-4" />
                  <span className="hidden sm:inline">Favorites</span>
                  <span className="rounded-full px-1.5 py-0.5 text-xs" style={{ backgroundColor: primaryColor, color: "#fff" }}>
                    0
                  </span>
                </button>
              )}
              {gallery.isPaid && gallery.allowDownload ? (
                <button
                  className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
                  style={{ backgroundColor: accentColor }}
                >
                  <DownloadIcon className="h-4 w-4" />
                  Download All
                </button>
              ) : !gallery.isPaid && gallery.price > 0 ? (
                <PayButton
                  galleryId={gallery.id}
                  price={gallery.price}
                  primaryColor={accentColor}
                  variant="header"
                />
              ) : null}
            </div>
          </div>
        </div>
      </header>

      {/* Gallery Info */}
      <div className="border-b" style={{ borderColor: colors.borderColor }}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold mb-2">{gallery.name}</h1>
          {gallery.description && <p style={{ color: colors.mutedColor }}>{gallery.description}</p>}
          <div className="mt-4 flex items-center gap-4 text-sm" style={{ color: colors.mutedColor }}>
            <span className="flex items-center gap-1">
              <PhotoIcon className="h-4 w-4" />
              {gallery.photos.length} photos
            </span>
            {gallery.isPaid ? (
              <span className="flex items-center gap-1" style={{ color: accentColor }}>
                <CheckIcon className="h-4 w-4" />
                Paid - Downloads enabled
              </span>
            ) : gallery.price > 0 ? (
              <span className="flex items-center gap-1">
                <LockIcon className="h-4 w-4" />
                {formatCurrency(gallery.price)} to unlock downloads
              </span>
            ) : (
              <span className="flex items-center gap-1" style={{ color: accentColor }}>
                <CheckIcon className="h-4 w-4" />
                Free - Downloads enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Outstanding Balance Banner */}
      {gallery.hasOutstandingBalance && (
        <div
          className="border-b"
          style={{
            backgroundColor: "rgba(239, 68, 68, 0.1)",
            borderColor: "rgba(239, 68, 68, 0.3)",
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-start gap-3">
                <AlertIcon className="h-5 w-5 text-[#ef4444] shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-[#ef4444]">
                    Outstanding Balance: {formatCurrency(gallery.outstandingBalance)}
                  </p>
                  <p className="text-sm" style={{ color: colors.mutedColor }}>
                    You have unpaid invoices. Please view your invoices for details.
                  </p>
                </div>
              </div>
              <Link
                href="/portal/invoices"
                className="inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors shrink-0"
                style={{ backgroundColor: "#ef4444" }}
              >
                <ReceiptIcon className="h-4 w-4" />
                View Invoices
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Expiration Warning Banner */}
      {(() => {
        if (!gallery.expiresAt) return null;
        const expiresDate = new Date(gallery.expiresAt);
        const now = new Date();
        const daysRemaining = Math.ceil((expiresDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

        // Only show if expiring within 14 days
        if (daysRemaining > 14 || daysRemaining < 0) return null;

        const isUrgent = daysRemaining <= 3;
        const warningColor = isUrgent ? "#ef4444" : "#f97316"; // red for urgent, orange for warning

        return (
          <div
            className="border-b"
            style={{
              backgroundColor: `${warningColor}15`,
              borderColor: `${warningColor}30`,
            }}
          >
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center gap-3">
                <ClockIcon className="h-5 w-5 shrink-0" style={{ color: warningColor }} />
                <div>
                  <p className="font-medium" style={{ color: warningColor }}>
                    {daysRemaining === 0
                      ? "This gallery expires today!"
                      : daysRemaining === 1
                        ? "This gallery expires tomorrow!"
                        : `This gallery expires in ${daysRemaining} days`}
                  </p>
                  <p className="text-sm" style={{ color: colors.mutedColor }}>
                    {gallery.allowDownload && gallery.isPaid
                      ? "Download your photos before they're no longer available."
                      : "Please contact your photographer if you need more time."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Payment Banner (if not paid) */}
      {!gallery.isPaid && gallery.price > 0 && (
        <div
          className="border-b"
          style={{
            backgroundColor: `${primaryColor}15`,
            borderColor: `${primaryColor}30`,
          }}
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium" style={{ color: primaryColor }}>
                  Unlock this gallery to download your photos
                </p>
                <p className="text-sm" style={{ color: colors.mutedColor }}>
                  One-time payment of {formatCurrency(gallery.price)} for full access
                </p>
              </div>
              <PayButton
                galleryId={gallery.id}
                price={gallery.price}
                primaryColor={accentColor}
                variant="banner"
              />
            </div>
          </div>
        </div>
      )}

      {/* Photo Grid */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
          {gallery.photos.map((photo: Photo) => (
            <div
              key={photo.id}
              className="group relative aspect-[4/3] overflow-hidden rounded-lg cursor-pointer"
              style={{ backgroundColor: colors.cardBg }}
            >
              <img
                src={photo.thumbnailUrl || photo.url}
                alt={photo.filename}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-300 group-hover:scale-105",
                  !gallery.isPaid && gallery.price > 0 && gallery.showWatermark && "blur-sm"
                )}
              />

              {/* Overlay - Always visible on mobile for filename visibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                <div className="absolute bottom-0 left-0 right-0 p-3 md:p-4">
                  <p className="text-xs md:text-sm font-medium text-white truncate">{photo.filename}</p>
                </div>
              </div>

              {/* Action Buttons - Always visible on mobile, hover on desktop */}
              <div className="absolute top-3 right-3 flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                {gallery.allowFavorites && (
                  <button className="rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <HeartIcon className="h-5 w-5" />
                  </button>
                )}
                {gallery.isPaid && gallery.allowDownload && (
                  <button className="rounded-full bg-black/50 p-2.5 text-white hover:bg-black/70 transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center">
                    <DownloadIcon className="h-5 w-5" />
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
        style={{ borderColor: colors.borderColor }}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <p className="text-sm" style={{ color: colors.mutedColor }}>
              Photos by {gallery.photographer.name}
            </p>
            {!hidePlatformBranding && (
              <p className="text-sm" style={{ color: colors.mutedColor }}>
                Powered by{" "}
                <Link href="/" className="hover:underline" style={{ color: primaryColor }}>
                  PhotoProOS
                </Link>
              </p>
            )}
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

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
    </svg>
  );
}

function AlertIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495ZM10 5a.75.75 0 0 1 .75.75v3.5a.75.75 0 0 1-1.5 0v-3.5A.75.75 0 0 1 10 5Zm0 9a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
    </svg>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13.227a.5.5 0 0 0 .824.384l2.51-2.09 2.833 2.09a.5.5 0 0 0 .594 0l2.833-2.09 2.51 2.09a.5.5 0 0 0 .824-.384V3.5A1.5 1.5 0 0 0 14.5 2h-10ZM6 6a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H6Zm0 3.5a.75.75 0 0 0 0 1.5h8a.75.75 0 0 0 0-1.5H6Z" clipRule="evenodd" />
    </svg>
  );
}

function ClockIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className} style={style}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}
