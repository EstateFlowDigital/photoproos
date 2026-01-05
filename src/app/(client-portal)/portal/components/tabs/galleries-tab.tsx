"use client";

import Image from "next/image";
import { ImageIcon, DownloadIcon, LoadingSpinner } from "../icons";
import { formatDate } from "../utils";
import type { GalleryData } from "../types";

interface GalleriesTabProps {
  galleries: GalleryData[];
  downloadingGallery: string | null;
  onDownload: (galleryId: string) => void;
}

export function GalleriesTab({ galleries, downloadingGallery, onDownload }: GalleriesTabProps) {
  if (galleries.length === 0) {
    return (
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
        <ImageIcon className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" />
        <p className="mt-4 text-lg font-medium text-white">No galleries yet</p>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          Your photo galleries will appear here once delivered
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {galleries.map((gallery) => (
        <GalleryCard
          key={gallery.id}
          gallery={gallery}
          isDownloading={downloadingGallery === gallery.id}
          onDownload={() => onDownload(gallery.id)}
        />
      ))}
    </div>
  );
}

interface GalleryCardProps {
  gallery: GalleryData;
  isDownloading: boolean;
  onDownload: () => void;
}

function GalleryCard({ gallery, isDownloading, onDownload }: GalleryCardProps) {
  return (
    <div className="overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center gap-4">
          {gallery.photos.length > 0 && gallery.photos[0].thumbnailUrl ? (
            <div className="relative h-14 w-14 overflow-hidden rounded-lg">
              <Image
                src={gallery.photos[0].thumbnailUrl}
                alt={gallery.name}
                fill
                className="object-cover"
              />
            </div>
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
          <div className="flex gap-2 overflow-x-auto">
            {gallery.photos.map((photo) => (
              <div
                key={photo.id}
                className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg"
              >
                <Image
                  src={photo.thumbnailUrl || photo.url}
                  alt={photo.filename}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
            {gallery.photoCount > gallery.photos.length && (
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-[var(--background-tertiary)] text-sm font-medium text-[var(--foreground-muted)]">
                +{gallery.photoCount - gallery.photos.length}
              </div>
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
