"use client";

import { useState } from "react";
import Image from "next/image";
import { DownloadIcon, ImageIcon, FileIcon, DocumentIcon, LoadingSpinner, ClockIcon } from "../icons";
import { BLUR_DATA_URL } from "../utils";
import { DownloadHistoryPanel } from "@/components/gallery/download-history-panel";
import type { GalleryData } from "../types";

export type DownloadType = "zip" | "web" | "highres" | "marketing" | "selected" | null;

interface DownloadsTabProps {
  galleries: GalleryData[];
  downloadingGallery: string | null;
  downloadType: DownloadType;
  onZipDownload: (galleryId: string) => void;
  onWebSizeDownload: (galleryId: string) => void;
  onHighResDownload: (galleryId: string) => void;
  onMarketingKitDownload: (galleryId: string) => void;
  favorites?: Set<string>;
  onSelectedDownload?: (galleryId: string, photoIds: string[]) => void;
  clientEmail?: string;
}

export function DownloadsTab({
  galleries,
  downloadingGallery,
  downloadType,
  onZipDownload,
  onWebSizeDownload,
  onHighResDownload,
  onMarketingKitDownload,
  favorites = new Set(),
  onSelectedDownload,
  clientEmail,
}: DownloadsTabProps) {
  const [showHistory, setShowHistory] = useState(false);
  const [historyGalleryId, setHistoryGalleryId] = useState<string | null>(null);
  const downloadableGalleries = galleries.filter((g) => g.downloadable);

  // Get all favorited photos across galleries
  const favoritedPhotos = galleries.flatMap((g) =>
    g.photos.filter((p) => favorites.has(p.id)).map((p) => ({ ...p, galleryName: g.name, galleryId: g.id }))
  );

  const openHistory = (galleryId: string) => {
    setHistoryGalleryId(galleryId);
    setShowHistory(true);
  };

  const closeHistory = () => {
    setShowHistory(false);
    setHistoryGalleryId(null);
  };

  if (downloadableGalleries.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-[var(--foreground-secondary)]">Download all your photos and marketing materials</p>
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--background-tertiary)]">
            <DownloadIcon className="h-8 w-8 text-[var(--foreground-muted)]" />
          </div>
          <p className="mt-4 text-lg font-medium text-[var(--foreground)]">No downloads available yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-[var(--foreground-muted)]">
            Your photo downloads will appear here once your galleries are delivered and ready for download.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <p className="text-[var(--foreground-secondary)]">Download all your photos and marketing materials</p>
          {clientEmail && downloadableGalleries.length > 0 && (
            <button
              onClick={() => openHistory(downloadableGalleries[0].id)}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
            >
              <ClockIcon className="h-4 w-4" />
              Download History
            </button>
          )}
        </div>

        {/* Favorites Section */}
        {favoritedPhotos.length > 0 && (
          <FavoritesSection
            photos={favoritedPhotos}
            downloadingGallery={downloadingGallery}
            downloadType={downloadType}
            onDownload={onSelectedDownload}
          />
        )}

        {/* Gallery Downloads */}
        <div className="space-y-6">
          <h3 className="text-sm font-medium uppercase tracking-wider text-[var(--foreground-muted)]">
            All Galleries
          </h3>
          {downloadableGalleries.map((gallery) => (
            <DownloadCard
              key={gallery.id}
              gallery={gallery}
              downloadingGallery={downloadingGallery}
              downloadType={downloadType}
              onZipDownload={onZipDownload}
              onWebSizeDownload={onWebSizeDownload}
              onHighResDownload={onHighResDownload}
              onMarketingKitDownload={onMarketingKitDownload}
              onSelectedDownload={onSelectedDownload}
              favorites={favorites}
              onViewHistory={() => openHistory(gallery.id)}
              showHistoryButton={!!clientEmail}
            />
          ))}
        </div>
      </div>

      {/* Download History Panel */}
      {historyGalleryId && (
        <DownloadHistoryPanel
          galleryId={historyGalleryId}
          sessionId={null}
          clientEmail={clientEmail || null}
          isOpen={showHistory}
          onClose={closeHistory}
        />
      )}
    </>
  );
}

// Favorites Section Component
interface FavoritePhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  galleryName: string;
  galleryId: string;
}

interface FavoritesSectionProps {
  photos: FavoritePhoto[];
  downloadingGallery: string | null;
  downloadType: DownloadType;
  onDownload?: (galleryId: string, photoIds: string[]) => void;
}

function FavoritesSection({ photos, downloadingGallery: _downloadingGallery, downloadType: _downloadType, onDownload }: FavoritesSectionProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadAll = async () => {
    if (!onDownload) return;
    setIsDownloading(true);
    // Group by gallery and download
    const byGallery = photos.reduce(
      (acc, photo) => {
        if (!acc[photo.galleryId]) acc[photo.galleryId] = [];
        acc[photo.galleryId].push(photo.id);
        return acc;
      },
      {} as Record<string, string[]>
    );

    for (const [galleryId, photoIds] of Object.entries(byGallery)) {
      await onDownload(galleryId, photoIds);
    }
    setIsDownloading(false);
  };

  return (
    <div className="rounded-xl border border-[var(--error)]/20 bg-gradient-to-br from-[var(--error)]/5 to-transparent p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--error)]/10">
            <HeartIcon className="h-5 w-5 text-[var(--error)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)]">Your Favorites</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {photos.length} photo{photos.length !== 1 ? "s" : ""} marked as favorites
            </p>
          </div>
        </div>
        {onDownload && (
          <button
            onClick={handleDownloadAll}
            disabled={isDownloading}
            className="flex items-center justify-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50"
          >
            {isDownloading ? (
              <LoadingSpinner className="h-4 w-4" />
            ) : (
              <DownloadIcon className="h-4 w-4" />
            )}
            Download All Favorites
          </button>
        )}
      </div>

      {/* Thumbnail Preview */}
      <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
        {photos.slice(0, 10).map((photo) => (
          <div
            key={photo.id}
            className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg ring-2 ring-[var(--error)]/30"
          >
            <Image
              src={photo.thumbnailUrl || photo.url}
              alt={photo.filename}
              fill
              className="object-cover"
              placeholder="blur"
              blurDataURL={BLUR_DATA_URL}
            />
          </div>
        ))}
        {photos.length > 10 && (
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)] text-sm font-medium text-[var(--foreground-muted)]">
            +{photos.length - 10}
          </div>
        )}
      </div>
    </div>
  );
}

interface DownloadCardProps {
  gallery: GalleryData;
  downloadingGallery: string | null;
  downloadType: DownloadType;
  onZipDownload: (galleryId: string) => void;
  onWebSizeDownload: (galleryId: string) => void;
  onHighResDownload: (galleryId: string) => void;
  onMarketingKitDownload: (galleryId: string) => void;
  onSelectedDownload?: (galleryId: string, photoIds: string[]) => void;
  favorites: Set<string>;
  onViewHistory?: () => void;
  showHistoryButton?: boolean;
}

function DownloadCard({
  gallery,
  downloadingGallery,
  downloadType,
  onZipDownload,
  onWebSizeDownload,
  onHighResDownload,
  onMarketingKitDownload,
  onSelectedDownload,
  favorites,
  onViewHistory,
  showHistoryButton,
}: DownloadCardProps) {
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [showPhotoSelector, setShowPhotoSelector] = useState(false);
  const isDownloading = downloadingGallery === gallery.id;

  const togglePhoto = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const selectAll = () => {
    setSelectedPhotos(new Set(gallery.photos.map((p) => p.id)));
  };

  const clearSelection = () => {
    setSelectedPhotos(new Set());
  };

  const handleDownloadSelected = () => {
    if (onSelectedDownload && selectedPhotos.size > 0) {
      onSelectedDownload(gallery.id, Array.from(selectedPhotos));
    }
  };

  // Count favorites in this gallery
  const favoriteCount = gallery.photos.filter((p) => favorites.has(p.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-[var(--foreground)]">{gallery.name}</h3>
            <div className="mt-1 flex flex-wrap items-center gap-3 text-sm text-[var(--foreground-muted)]">
              <span>{gallery.photoCount} photos</span>
              {favoriteCount > 0 && (
                <span className="flex items-center gap-1 text-[var(--error)]">
                  <HeartIcon className="h-3.5 w-3.5" />
                  {favoriteCount} favorite{favoriteCount !== 1 ? "s" : ""}
                </span>
              )}
              {gallery.serviceName && (
                <span className="rounded-full bg-[var(--primary)]/10 px-2 py-0.5 text-xs font-medium text-[var(--primary)]">
                  {gallery.serviceName}
                </span>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {showHistoryButton && onViewHistory && (
              <button
                onClick={onViewHistory}
                className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
                title="View download history"
              >
                <ClockIcon className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={() => setShowPhotoSelector(!showPhotoSelector)}
              className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] px-3 py-2 text-sm font-medium text-[var(--foreground-secondary)] transition-colors hover:bg-[var(--background-tertiary)] hover:text-[var(--foreground)]"
            >
              <CheckboxIcon className="h-4 w-4" />
              {showPhotoSelector ? "Hide Selection" : "Select Photos"}
            </button>
          </div>
        </div>
      </div>

      {/* Photo Selector */}
      {showPhotoSelector && (
        <div className="border-b border-[var(--card-border)] bg-[var(--background-tertiary)] p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={selectAll}
                className="text-sm font-medium text-[var(--primary)] hover:text-[var(--primary)]/80"
              >
                Select All
              </button>
              <span className="text-[var(--foreground-muted)]">•</span>
              <button
                onClick={clearSelection}
                className="text-sm font-medium text-[var(--foreground-muted)] hover:text-[var(--foreground-secondary)]"
              >
                Clear
              </button>
            </div>
            {selectedPhotos.size > 0 && (
              <button
                onClick={handleDownloadSelected}
                disabled={isDownloading && downloadType === "selected"}
                className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
              >
                {isDownloading && downloadType === "selected" ? (
                  <LoadingSpinner className="h-4 w-4" />
                ) : (
                  <DownloadIcon className="h-4 w-4" />
                )}
                Download {selectedPhotos.size} Selected
              </button>
            )}
          </div>
          <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
            {gallery.photos.map((photo) => (
              <button
                key={photo.id}
                onClick={() => togglePhoto(photo.id)}
                className={`group relative aspect-square overflow-hidden rounded-lg transition-all ${
                  selectedPhotos.has(photo.id)
                    ? "ring-2 ring-[var(--primary)] ring-offset-2 ring-offset-[var(--background-tertiary)]"
                    : "hover:ring-2 hover:ring-[var(--foreground-muted)]/50"
                }`}
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
                {/* Selection Indicator */}
                <div
                  className={`absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity ${
                    selectedPhotos.has(photo.id) ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                  }`}
                >
                  <div
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                      selectedPhotos.has(photo.id)
                        ? "border-[var(--primary)] bg-[var(--primary)]"
                        : "border-white bg-transparent"
                    }`}
                  >
                    {selectedPhotos.has(photo.id) && <CheckIcon className="h-4 w-4 text-white" />}
                  </div>
                </div>
                {/* Favorite indicator */}
                {favorites.has(photo.id) && (
                  <div className="absolute right-1 top-1">
                    <HeartIcon className="h-4 w-4 text-[var(--error)] drop-shadow-md" filled />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quick Download Buttons */}
      <div className="p-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <DownloadButton
            label="All Photos (ZIP)"
            description="Original quality"
            icon={<DownloadIcon className="h-5 w-5" />}
            isLoading={isDownloading && downloadType === "zip"}
            onClick={() => onZipDownload(gallery.id)}
          />
          <DownloadButton
            label="Web Size"
            description="Optimized for web"
            icon={<ImageIcon className="h-5 w-5" />}
            isLoading={isDownloading && downloadType === "web"}
            onClick={() => onWebSizeDownload(gallery.id)}
          />
          <DownloadButton
            label="High-Res"
            description="Full resolution"
            icon={<FileIcon className="h-5 w-5" />}
            isLoading={isDownloading && downloadType === "highres"}
            onClick={() => onHighResDownload(gallery.id)}
          />
          <DownloadButton
            label="Marketing Kit"
            description="Flyers & materials"
            icon={<DocumentIcon className="h-5 w-5" />}
            isLoading={isDownloading && downloadType === "marketing"}
            onClick={() => onMarketingKitDownload(gallery.id)}
          />
        </div>
      </div>
    </div>
  );
}

interface DownloadButtonProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
  comingSoon?: boolean;
}

function DownloadButton({ label, description, icon, isLoading, onClick, comingSoon }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading || comingSoon}
      className="group relative flex flex-col items-center justify-center gap-2 rounded-xl border border-[var(--card-border)] bg-[var(--background-tertiary)] p-4 text-center transition-all hover:border-[var(--primary)]/50 hover:bg-[var(--primary)]/5 disabled:cursor-not-allowed disabled:opacity-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--card)] text-[var(--foreground-secondary)] transition-colors group-hover:bg-[var(--primary)]/10 group-hover:text-[var(--primary)]">
        {isLoading ? <LoadingSpinner className="h-5 w-5" /> : icon}
      </div>
      <div>
        <span className="text-sm font-medium text-[var(--foreground)]">{label}</span>
        {description && (
          <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">{description}</p>
        )}
      </div>
      {comingSoon && (
        <span className="absolute right-2 top-2 rounded-full bg-[var(--warning)]/10 px-2 py-0.5 text-[10px] font-medium text-[var(--warning)]">
          Soon
        </span>
      )}
    </button>
  );
}

// Icons
function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}

function CheckboxIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}
