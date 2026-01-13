"use client";

import { useState, useEffect } from "react";
import { DownloadsTab, type DownloadType } from "../components/tabs/downloads-tab";
import {
  getGalleryZipDownload,
  getWebSizeDownload,
  getHighResDownload,
  getMarketingKitDownload,
} from "@/lib/actions/portal-downloads";
import { useToast } from "@/components/ui/toast";
import type { GalleryData } from "../components/types";

interface PortalDownloadsClientProps {
  galleries: GalleryData[];
  clientId: string;
  clientEmail: string;
}

export function PortalDownloadsClient({ galleries, clientId, clientEmail }: PortalDownloadsClientProps) {
  const { showToast } = useToast();
  const [downloadingGallery, setDownloadingGallery] = useState<string | null>(null);
  const [downloadType, setDownloadType] = useState<DownloadType>(null);

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

  const handleZipDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("zip");
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
      setDownloadType(null);
    }
  };

  const handleWebSizeDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("web");
    try {
      const result = await getWebSizeDownload(galleryId);
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
      setDownloadType(null);
    }
  };

  const handleHighResDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("highres");
    try {
      const result = await getHighResDownload(galleryId);
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
      setDownloadType(null);
    }
  };

  const handleMarketingKitDownload = async (galleryId: string) => {
    setDownloadingGallery(galleryId);
    setDownloadType("marketing");
    try {
      const result = await getMarketingKitDownload(galleryId);
      if (result.success && result.data?.downloadUrl) {
        window.open(result.data.downloadUrl, "_blank");
        showToast("Download started", "success");
      } else {
        showToast(result.error || "Marketing kit not available", "error");
      }
    } catch {
      showToast("Download failed", "error");
    } finally {
      setDownloadingGallery(null);
      setDownloadType(null);
    }
  };

  const handleSelectedDownload = async (galleryId: string, _photoIds: string[]) => {
    setDownloadingGallery(galleryId);
    setDownloadType("selected");
    try {
      // For now, download the full gallery - individual photo download can be added later
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
      setDownloadType(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6" data-element="portal-downloads-page">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Downloads</h1>
        <p className="mt-1 text-foreground-muted">
          Download your photos and marketing materials
        </p>
      </div>

      <DownloadsTab
        galleries={galleries}
        downloadingGallery={downloadingGallery}
        downloadType={downloadType}
        onZipDownload={handleZipDownload}
        onWebSizeDownload={handleWebSizeDownload}
        onHighResDownload={handleHighResDownload}
        onMarketingKitDownload={handleMarketingKitDownload}
        favorites={favorites}
        onSelectedDownload={handleSelectedDownload}
        clientEmail={clientEmail}
      />
    </div>
  );
}
