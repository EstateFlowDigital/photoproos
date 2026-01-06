"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, DownloadIcon, LoadingSpinner } from "../icons";
import { Lightbox } from "../lightbox";
import { EmptyState } from "../empty-state";
import { formatDate, BLUR_DATA_URL } from "../utils";
import { PhotoComparisonModal } from "@/components/gallery/photo-comparison-modal";
import type { GalleryData } from "../types";

interface Photo {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
}

interface GalleriesTabProps {
  galleries: GalleryData[];
  downloadingGallery: string | null;
  onDownload: (galleryId: string) => void;
  favorites?: Set<string>;
  onToggleFavorite?: (photoId: string) => void;
  onPhotoDownload?: (photo: { id: string; url: string; filename: string }) => void;
}

export function GalleriesTab({
  galleries,
  downloadingGallery,
  onDownload,
  favorites = new Set(),
  onToggleFavorite,
  onPhotoDownload,
}: GalleriesTabProps) {
  const [lightboxGallery, setLightboxGallery] = useState<GalleryData | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [comparisonPhotos, setComparisonPhotos] = useState<Photo[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  const openLightbox = (gallery: GalleryData, photoIndex: number) => {
    setLightboxGallery(gallery);
    setLightboxIndex(photoIndex);
  };

  const closeLightbox = () => {
    setLightboxGallery(null);
    setLightboxIndex(0);
  };

  const handleCompare = (photos: Photo[]) => {
    setComparisonPhotos(photos);
    setShowComparison(true);
    closeLightbox(); // Close lightbox when opening comparison
  };

  const closeComparison = () => {
    setShowComparison(false);
    setComparisonPhotos([]);
  };

  // Get all photos across all galleries for comparison swapping
  const allPhotos = galleries.flatMap((g) => g.photos);

  if (galleries.length === 0) {
    return (
      <EmptyState
        icon={<ImageIcon className="h-12 w-12" />}
        illustration="photos"
        title="No galleries yet"
        description="Your photo galleries will appear here once your photographer delivers them. You'll be able to view, favorite, and download your photos all in one place."
      />
    );
  }

  return (
    <>
      <div className="space-y-4">
        {galleries.map((gallery) => (
          <GalleryCard
            key={gallery.id}
            gallery={gallery}
            isDownloading={downloadingGallery === gallery.id}
            onDownload={() => onDownload(gallery.id)}
            onPhotoClick={(index) => openLightbox(gallery, index)}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightboxGallery && (
        <Lightbox
          photos={lightboxGallery.photos}
          initialIndex={lightboxIndex}
          isOpen={true}
          onClose={closeLightbox}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
          onDownload={onPhotoDownload}
          onCompare={handleCompare}
          galleryName={lightboxGallery.name}
        />
      )}

      {/* Photo Comparison Modal */}
      <PhotoComparisonModal
        photos={comparisonPhotos}
        isOpen={showComparison}
        onClose={closeComparison}
        allPhotos={allPhotos}
      />
    </>
  );
}

interface GalleryCardProps {
  gallery: GalleryData;
  isDownloading: boolean;
  onDownload: () => void;
  onPhotoClick: (index: number) => void;
  favorites: Set<string>;
  onToggleFavorite?: (photoId: string) => void;
}

function GalleryCard({
  gallery,
  isDownloading,
  onDownload,
  onPhotoClick,
  favorites,
  onToggleFavorite,
}: GalleryCardProps) {
  // Count favorites in this gallery
  const favoriteCount = gallery.photos.filter((p) => favorites.has(p.id)).length;

  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          {gallery.photos.length > 0 && gallery.photos[0].thumbnailUrl ? (
            <button
              onClick={() => onPhotoClick(0)}
              className="relative h-14 w-14 overflow-hidden rounded-lg transition-transform hover:scale-105"
            >
              <Image
                src={gallery.photos[0].thumbnailUrl}
                alt={gallery.name}
                fill
                className="object-cover"
                placeholder="blur"
                blurDataURL={BLUR_DATA_URL}
              />
            </button>
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-[var(--background-tertiary)]">
              <ImageIcon className="h-6 w-6 text-[var(--foreground-muted)]" />
            </div>
          )}
          <div>
            <h3 className="font-medium text-white">{gallery.name}</h3>
            <p className="text-sm text-[var(--foreground-muted)]">
              {gallery.photoCount} photos
              {gallery.serviceName && ` • ${gallery.serviceName}`}
              {gallery.deliveredAt && ` • Delivered ${formatDate(gallery.deliveredAt)}`}
            </p>
            {favoriteCount > 0 && (
              <p className="mt-0.5 text-xs text-[var(--error)]">
                <HeartIcon className="mr-1 inline h-3 w-3" />
                {favoriteCount} favorite{favoriteCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <GalleryStatusBadge status={gallery.status} />
          {gallery.downloadable && (
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isDownloading ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <DownloadIcon className="h-4 w-4" />
              )}
              {isDownloading ? "Downloading..." : "Download"}
            </button>
          )}
        </div>
      </div>
      {gallery.photos.length > 0 && (
        <div className="border-t border-[var(--card-border)] p-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {gallery.photos.map((photo, index) => (
              <button
                key={photo.id}
                onClick={() => onPhotoClick(index)}
                className="group relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-2 focus:ring-offset-[var(--card)]"
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  fill
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_DATA_URL}
                />
                {/* Favorite indicator */}
                {favorites.has(photo.id) && (
                  <div className="absolute right-0.5 top-0.5 rounded-full bg-black/50 p-0.5">
                    <HeartIcon className="h-3 w-3 text-red-500" filled />
                  </div>
                )}
                {/* Hover overlay with favorite button */}
                {onToggleFavorite && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition-all group-hover:bg-black/30 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleFavorite(photo.id);
                      }}
                      className="rounded-full bg-white/90 p-1.5 transition-transform hover:scale-110"
                    >
                      <HeartIcon
                        className={`h-4 w-4 ${favorites.has(photo.id) ? "text-red-500" : "text-gray-600"}`}
                        filled={favorites.has(photo.id)}
                      />
                    </button>
                  </div>
                )}
              </button>
            ))}
            {gallery.photoCount > gallery.photos.length && (
              <button
                onClick={() => onPhotoClick(gallery.photos.length - 1)}
                className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)] text-sm font-medium text-[var(--foreground-muted)] transition-colors hover:bg-[var(--card-border)]"
              >
                +{gallery.photoCount - gallery.photos.length}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function GalleryStatusBadge({ status }: { status: string }) {
  const statusStyles = {
    delivered: "bg-[var(--success)]/20 text-[var(--success)]",
    pending: "bg-[var(--warning)]/20 text-[var(--warning)]",
    default: "bg-[var(--foreground-muted)]/20 text-[var(--foreground-secondary)]",
  };

  const style = statusStyles[status as keyof typeof statusStyles] || statusStyles.default;

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}

function HeartIcon({ className, filled }: { className?: string; filled?: boolean }) {
  if (filled) {
    return (
      <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
      </svg>
    );
  }
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
      />
    </svg>
  );
}
