"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { Heart, Download, X, Grid, List } from "lucide-react";
import { getGalleryZipDownload } from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import type { GalleryData } from "../components/types";

const BLUR_DATA_URL = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFgABAQEAAAAAAAAAAAAAAAAAAAUH/8QAIhAAAgIBAwQDAAAAAAAAAAAAAQIDBAUABhEHEiExQVFh/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAYEQEBAQEBAAAAAAAAAAAAAAABAgADEf/aAAwDAQACEQMRAD8Ay7pxvLcO2axnrQrY7IvZkljRnCd6gcH1wNZ1u/fW4NyZGTIZrKWb1t1C+tPKXYKO0DknwOABrWtNPXxnJMP/2Q==";

interface PortalFavoritesClientProps {
  galleries: GalleryData[];
  clientId: string;
}

interface FavoritePhoto {
  id: string;
  url: string;
  thumbnailUrl: string | null;
  filename: string;
  galleryId: string;
  galleryName: string;
}

export function PortalFavoritesClient({ galleries, clientId }: PortalFavoritesClientProps) {
  const { showToast } = useToast();
  const [isDownloading, setIsDownloading] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Favorites state (persisted to localStorage)
  const [favorites, setFavorites] = useState<Set<string>>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(`portal_favorites_${clientId}`);
        if (stored) {
          const parsed = JSON.parse(stored);
          return Array.isArray(parsed) ? new Set(parsed) : new Set();
        }
      } catch {
        localStorage.removeItem(`portal_favorites_${clientId}`);
      }
    }
    return new Set();
  });

  // Persist favorites to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(`portal_favorites_${clientId}`, JSON.stringify([...favorites]));
    }
  }, [favorites, clientId]);

  // Get all favorited photos with gallery context
  const favoritedPhotos = useMemo(() => {
    const photos: FavoritePhoto[] = [];
    galleries.forEach((gallery) => {
      gallery.photos.forEach((photo) => {
        if (favorites.has(photo.id)) {
          photos.push({
            ...photo,
            galleryId: gallery.id,
            galleryName: gallery.name,
          });
        }
      });
    });
    return photos;
  }, [galleries, favorites]);

  // Group by gallery
  const photosByGallery = useMemo(() => {
    const grouped: Record<string, { galleryName: string; photos: FavoritePhoto[] }> = {};
    favoritedPhotos.forEach((photo) => {
      if (!grouped[photo.galleryId]) {
        grouped[photo.galleryId] = { galleryName: photo.galleryName, photos: [] };
      }
      grouped[photo.galleryId].photos.push(photo);
    });
    return grouped;
  }, [favoritedPhotos]);

  const handleRemoveFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      next.delete(photoId);
      return next;
    });
    showToast("Removed from favorites", "success");
  };

  const handleDownloadAll = async () => {
    setIsDownloading(true);
    try {
      // Download from each gallery that has favorites
      for (const galleryId of Object.keys(photosByGallery)) {
        const result = await getGalleryZipDownload(galleryId);
        if (result.success && result.data?.downloadUrl) {
          window.open(result.data.downloadUrl, "_blank");
        }
      }
      showToast("Downloads started", "success");
    } catch {
      showToast("Download failed", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handlePhotoDownload = (photo: FavoritePhoto) => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Download started", "success");
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-favorites-page">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Favorites</h1>
          <p className="mt-1 text-foreground-muted">
            {favoritedPhotos.length} photo{favoritedPhotos.length !== 1 ? "s" : ""} marked as favorites
          </p>
        </div>

        {favoritedPhotos.length > 0 && (
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex items-center rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "grid"
                    ? "bg-[var(--primary)] text-white"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <Grid className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`rounded-md p-1.5 transition-colors ${
                  viewMode === "list"
                    ? "bg-[var(--primary)] text-white"
                    : "text-foreground-muted hover:text-foreground"
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Download All Button */}
            <button
              onClick={handleDownloadAll}
              disabled={isDownloading}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
            >
              {isDownloading ? (
                <LoadingSpinner className="h-4 w-4" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download All
            </button>
          </div>
        )}
      </div>

      {favoritedPhotos.length === 0 ? (
        <EmptyState />
      ) : viewMode === "grid" ? (
        // Grid View - All photos together
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {favoritedPhotos.map((photo) => (
            <PhotoCard
              key={photo.id}
              photo={photo}
              onRemove={() => handleRemoveFavorite(photo.id)}
              onDownload={() => handlePhotoDownload(photo)}
            />
          ))}
        </div>
      ) : (
        // List View - Grouped by gallery
        <div className="space-y-8">
          {Object.entries(photosByGallery).map(([galleryId, { galleryName, photos }]) => (
            <div key={galleryId}>
              <h2 className="mb-4 text-lg font-semibold text-foreground">{galleryName}</h2>
              <div className="space-y-2">
                {photos.map((photo) => (
                  <PhotoListItem
                    key={photo.id}
                    photo={photo}
                    onRemove={() => handleRemoveFavorite(photo.id)}
                    onDownload={() => handlePhotoDownload(photo)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

interface PhotoCardProps {
  photo: FavoritePhoto;
  onRemove: () => void;
  onDownload: () => void;
}

function PhotoCard({ photo, onRemove, onDownload }: PhotoCardProps) {
  return (
    <div className="group relative aspect-square overflow-hidden rounded-xl border border-[var(--card-border)] bg-[var(--card)]">
      <Image
        src={photo.thumbnailUrl || photo.url}
        alt={photo.filename}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        placeholder="blur"
        blurDataURL={BLUR_DATA_URL}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      {/* Heart Icon */}
      <div className="absolute left-2 top-2">
        <Heart className="h-5 w-5 fill-red-500 text-red-500" />
      </div>

      {/* Actions */}
      <div className="absolute bottom-2 right-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <button
          onClick={onDownload}
          className="rounded-lg bg-white/90 p-2 text-gray-700 transition-colors hover:bg-white"
          title="Download"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="rounded-lg bg-white/90 p-2 text-gray-700 transition-colors hover:bg-white"
          title="Remove from favorites"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Gallery Name */}
      <div className="absolute bottom-2 left-2 opacity-0 transition-opacity group-hover:opacity-100">
        <span className="rounded-md bg-black/50 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
          {photo.galleryName}
        </span>
      </div>
    </div>
  );
}

function PhotoListItem({ photo, onRemove, onDownload }: PhotoCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-3">
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={photo.thumbnailUrl || photo.url}
          alt={photo.filename}
          fill
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
        />
        <div className="absolute left-1 top-1">
          <Heart className="h-3 w-3 fill-red-500 text-red-500" />
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="truncate font-medium text-foreground">{photo.filename}</p>
        <p className="text-sm text-foreground-muted">{photo.galleryName}</p>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={onDownload}
          className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--card-border)]"
        >
          <Download className="h-4 w-4" />
        </button>
        <button
          onClick={onRemove}
          className="flex items-center gap-2 rounded-lg border border-[var(--card-border)] bg-[var(--background-tertiary)] px-3 py-2 text-sm font-medium text-foreground-muted transition-colors hover:bg-[var(--error)]/10 hover:border-[var(--error)]/30 hover:text-[var(--error)]"
          title="Remove from favorites"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
      <div className="mx-auto flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[var(--error)]/10">
        <Heart className="h-8 w-8 text-[var(--error)]" />
      </div>
      <p className="mt-4 text-lg font-medium text-foreground">No favorites yet</p>
      <p className="mx-auto mt-2 max-w-sm text-sm text-foreground-muted">
        Browse your galleries and click the heart icon on photos you love. They&apos;ll appear here
        for easy access and download.
      </p>
      <a
        href="/portal/galleries"
        className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
      >
        Browse Galleries
      </a>
    </div>
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
