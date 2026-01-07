"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface MarketingAsset {
  id: string;
  type: string;
  name: string;
  fileUrl: string;
  thumbnailUrl: string | null;
}

interface MarketingKitModalProps {
  isOpen: boolean;
  onClose: () => void;
  galleryName: string;
  propertyAddress: string | null;
  assets: MarketingAsset[];
}

export function MarketingKitModal({
  isOpen,
  onClose,
  galleryName,
  propertyAddress,
  assets,
}: MarketingKitModalProps) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (asset: MarketingAsset) => {
    setDownloadingId(asset.id);
    try {
      // Fetch the file
      const response = await fetch(`/api/download/marketing-asset?id=${asset.id}`);

      if (!response.ok) {
        throw new Error("Download failed");
      }

      // Get filename from content-disposition header or generate one
      const contentDisposition = response.headers.get("content-disposition");
      let filename = asset.name;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) {
          filename = match[1];
        }
      }

      // Add extension if not present
      if (!filename.includes(".")) {
        const contentType = response.headers.get("content-type");
        if (contentType?.includes("pdf")) {
          filename += ".pdf";
        } else if (contentType?.includes("png")) {
          filename += ".png";
        } else if (contentType?.includes("jpeg") || contentType?.includes("jpg")) {
          filename += ".jpg";
        }
      }

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
    } finally {
      setDownloadingId(null);
    }
  };

  // Group assets by category
  const groupedAssets = assets.reduce(
    (acc, asset) => {
      const category = getAssetCategory(asset.type);
      if (!acc[category]) {
        acc[category] = [];
      }
      acc[category].push(asset);
      return acc;
    },
    {} as Record<string, MarketingAsset[]>
  );

  const categories = Object.keys(groupedAssets).sort();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent size="lg" className="max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Marketing Kit</DialogTitle>
          <p className="text-sm text-[var(--foreground-muted)]">
            {propertyAddress || galleryName} &bull; {assets.length} materials available
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto -mx-6 px-6">
          {assets.length === 0 ? (
            <div className="py-12 text-center">
              <div className="mx-auto h-12 w-12 rounded-full bg-[var(--background-tertiary)] flex items-center justify-center mb-4">
                <DocumentIcon className="h-6 w-6 text-[var(--foreground-muted)]" />
              </div>
              <p className="text-[var(--foreground-muted)]">
                No marketing materials available yet.
              </p>
            </div>
          ) : (
            <div className="space-y-6 pb-4">
              {categories.map((category) => (
                <div key={category}>
                  <h3 className="text-sm font-medium text-[var(--foreground-secondary)] mb-3">
                    {category}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {groupedAssets[category].map((asset) => (
                      <div
                        key={asset.id}
                        className="flex items-center gap-3 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] p-3"
                      >
                        {/* Thumbnail */}
                        <div className="h-12 w-12 shrink-0 rounded-md bg-[var(--card)] overflow-hidden">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center">
                              <DocumentIcon className="h-5 w-5 text-[var(--foreground-muted)]" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[var(--foreground)] truncate">
                            {asset.name}
                          </p>
                          <p className="text-xs text-[var(--foreground-muted)]">
                            {getAssetTypeLabel(asset.type)}
                          </p>
                        </div>

                        {/* Download Button */}
                        <button
                          onClick={() => handleDownload(asset)}
                          disabled={downloadingId === asset.id}
                          className="shrink-0 flex items-center justify-center h-8 w-8 rounded-md bg-[var(--primary)] text-white hover:bg-[var(--primary-hover)] disabled:opacity-50 transition-colors"
                        >
                          {downloadingId === asset.id ? (
                            <LoadingSpinner className="h-4 w-4" />
                          ) : (
                            <DownloadIcon className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function getAssetCategory(type: string): string {
  const categories: Record<string, string> = {
    // Social media
    social_square: "Social Media",
    social_landscape: "Social Media",
    social_story: "Social Media",
    social_pinterest: "Social Media",
    social_linkedin: "Social Media",
    social_twitter: "Social Media",
    // Tiles
    tile_just_listed: "Social Tiles",
    tile_just_sold: "Social Tiles",
    tile_open_house: "Social Tiles",
    tile_price_reduced: "Social Tiles",
    tile_coming_soon: "Social Tiles",
    tile_under_contract: "Social Tiles",
    tile_back_on_market: "Social Tiles",
    tile_new_price: "Social Tiles",
    tile_virtual_tour: "Social Tiles",
    tile_featured: "Social Tiles",
    // Print
    flyer_portrait: "Print Materials",
    flyer_landscape: "Print Materials",
    postcard_4x6: "Print Materials",
    postcard_5x7: "Print Materials",
    feature_sheet: "Print Materials",
    brochure: "Print Materials",
    window_sign: "Print Materials",
    yard_sign_rider: "Print Materials",
    door_hanger: "Print Materials",
    // Video
    video_slideshow: "Videos",
    video_reel: "Videos",
    video_tour_teaser: "Videos",
    video_neighborhood: "Videos",
    video_stats_animation: "Videos",
    // Email
    email_banner: "Email",
    email_template: "Email",
    // Other
    qr_code: "Other",
    virtual_tour_poster: "Print Materials",
  };

  return categories[type] || "Other";
}

function getAssetTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    flyer_portrait: "Portrait Flyer",
    flyer_landscape: "Landscape Flyer",
    postcard_4x6: "4x6 Postcard",
    postcard_5x7: "5x7 Postcard",
    feature_sheet: "Feature Sheet",
    brochure: "Brochure",
    window_sign: "Window Sign",
    yard_sign_rider: "Yard Sign Rider",
    door_hanger: "Door Hanger",
    social_square: "Square Post",
    social_landscape: "Landscape Post",
    social_pinterest: "Pinterest Pin",
    social_linkedin: "LinkedIn Post",
    social_twitter: "Twitter/X Post",
    social_story: "Story",
    tile_just_listed: "Just Listed",
    tile_just_sold: "Just Sold",
    tile_open_house: "Open House",
    tile_price_reduced: "Price Reduced",
    tile_coming_soon: "Coming Soon",
    tile_under_contract: "Under Contract",
    tile_back_on_market: "Back on Market",
    tile_new_price: "New Price",
    tile_virtual_tour: "Virtual Tour",
    tile_featured: "Featured",
    video_slideshow: "Slideshow",
    video_reel: "Reel",
    video_tour_teaser: "Tour Teaser",
    video_neighborhood: "Neighborhood",
    video_stats_animation: "Stats",
    email_banner: "Banner",
    email_template: "Template",
    qr_code: "QR Code",
    virtual_tour_poster: "Tour Poster",
  };

  return labels[type] || type.replace(/_/g, " ");
}

// Icons
function DocumentIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
    </svg>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
