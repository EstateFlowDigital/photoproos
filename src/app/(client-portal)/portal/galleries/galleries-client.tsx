"use client";

import { useState, useEffect } from "react";
import { GalleriesTab } from "../components/tabs/galleries-tab";
import { getGalleryZipDownload } from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import type { GalleryData } from "../components/types";

interface PortalGalleriesClientProps {
  galleries: GalleryData[];
  clientId: string;
}

export function PortalGalleriesClient({ galleries, clientId }: PortalGalleriesClientProps) {
  const { showToast } = useToast();
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);

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

  const handleToggleFavorite = (photoId: string) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(photoId)) {
        next.delete(photoId);
      } else {
        next.add(photoId);
      }
      return next;
    });
  };

  const handleDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    try {
      const result = await getGalleryZipDownload(galleryId);
      if (result.success && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
        showToast("Download started", "success");
      } else {
        showToast(result.error || "Download failed", "error");
      }
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloadingGallery(null);
    }
  };

  const handlePhotoDownload = (photo: { id: string; url: string; filename: string }) => {
    const link = document.createElement("a");
    link.href = photo.url;
    link.download = photo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-galleries-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">My Galleries</h1>
        <p className="mt-1 text-foreground-muted">
          View, favorite, and download your photo galleries
        </p>
      </div>

      <GalleriesTab
        galleries={galleries}
        downloadingGallery={downloadingGallery}
        onDownload={handleDownload}
        favorites={favorites}
        onToggleFavorite={handleToggleFavorite}
        onPhotoDownload={handlePhotoDownload}
      />
    </div>
  );
}
