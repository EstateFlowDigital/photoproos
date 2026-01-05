"use client";

import { DownloadIcon, ImageIcon, FileIcon, DocumentIcon, LoadingSpinner } from "../icons";
import type { GalleryData } from "../types";

export type DownloadType = "zip" | "web" | "highres" | "marketing" | null;

interface DownloadsTabProps {
  galleries: GalleryData[];
  downloadingGallery: string | null;
  downloadType: DownloadType;
  onZipDownload: (galleryId: string) => void;
  onWebSizeDownload: (galleryId: string) => void;
  onHighResDownload: (galleryId: string) => void;
  onMarketingKitDownload: (galleryId: string) => void;
}

export function DownloadsTab({
  galleries,
  downloadingGallery,
  downloadType,
  onZipDownload,
  onWebSizeDownload,
  onHighResDownload,
  onMarketingKitDownload,
}: DownloadsTabProps) {
  const downloadableGalleries = galleries.filter((g) => g.downloadable);

  if (downloadableGalleries.length === 0) {
    return (
      <div className="space-y-6">
        <p className="text-[#a7a7a7]">Download all your photos and marketing materials</p>
        <div className="rounded-xl border border-[#262626] bg-[#141414] p-12 text-center">
          <DownloadIcon className="mx-auto h-12 w-12 text-[#7c7c7c]" />
          <p className="mt-4 text-lg font-medium text-white">No downloads available</p>
          <p className="mt-2 text-sm text-[#7c7c7c]">
            Downloads will be available once your galleries are delivered
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-[#a7a7a7]">Download all your photos and marketing materials</p>
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
        />
      ))}
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
}

function DownloadCard({
  gallery,
  downloadingGallery,
  downloadType,
  onZipDownload,
  onWebSizeDownload,
  onHighResDownload,
  onMarketingKitDownload,
}: DownloadCardProps) {
  const isDownloading = downloadingGallery === gallery.id;

  return (
    <div className="rounded-xl border border-[#262626] bg-[#141414] p-6">
      <h3 className="text-lg font-semibold text-white">{gallery.name}</h3>
      <p className="mt-1 text-sm text-[#7c7c7c]">{gallery.photoCount} photos available</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <DownloadButton
          label="All Photos (ZIP)"
          icon={<DownloadIcon className="h-4 w-4" />}
          isLoading={isDownloading && downloadType === "zip"}
          onClick={() => onZipDownload(gallery.id)}
        />
        <DownloadButton
          label="Web Size"
          icon={<ImageIcon className="h-4 w-4" />}
          isLoading={isDownloading && downloadType === "web"}
          onClick={() => onWebSizeDownload(gallery.id)}
        />
        <DownloadButton
          label="High-Res"
          icon={<FileIcon className="h-4 w-4" />}
          isLoading={isDownloading && downloadType === "highres"}
          onClick={() => onHighResDownload(gallery.id)}
        />
        <DownloadButton
          label="Marketing Kit"
          icon={<DocumentIcon className="h-4 w-4" />}
          isLoading={isDownloading && downloadType === "marketing"}
          onClick={() => onMarketingKitDownload(gallery.id)}
        />
      </div>
    </div>
  );
}

interface DownloadButtonProps {
  label: string;
  icon: React.ReactNode;
  isLoading: boolean;
  onClick: () => void;
}

function DownloadButton({ label, icon, isLoading, onClick }: DownloadButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className="flex items-center justify-center gap-2 rounded-lg border border-[#262626] bg-[#191919] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#262626] disabled:opacity-50"
    >
      {isLoading ? <LoadingSpinner className="h-4 w-4" /> : icon}
      {label}
    </button>
  );
}
