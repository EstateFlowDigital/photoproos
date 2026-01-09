"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { X, Download, Image, Package, Clock } from "lucide-react";

interface DownloadRecord {
  id: string;
  type: "single" | "batch";
  filename: string;
  thumbnailUrl: string | null;
  format: string;
  fileCount: number;
  downloadedAt: string;
}

interface DownloadHistoryPanelProps {
  galleryId: string;
  sessionId: string | null;
  clientEmail: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export function DownloadHistoryPanel({
  galleryId,
  sessionId,
  clientEmail,
  isOpen,
  onClose,
}: DownloadHistoryPanelProps) {
  const [downloads, setDownloads] = useState<DownloadRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && (sessionId || clientEmail)) {
      fetchDownloadHistory();
    }
  }, [isOpen, galleryId, sessionId, clientEmail]);

  const fetchDownloadHistory = async () => {
    if (!sessionId && !clientEmail) return;

    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (sessionId) params.set("sessionId", sessionId);
      if (clientEmail) params.set("email", clientEmail);

      const response = await fetch(
        `/api/gallery/${galleryId}/download-history?${params.toString()}`
      );

      if (!response.ok) {
        throw new Error("Failed to fetch download history");
      }

      const data = await response.json();
      setDownloads(data.downloads || []);
    } catch (err) {
      setError("Could not load download history");
      console.error("[Download History]", err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} min ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 z-50 h-full w-full max-w-md",
          "bg-[#0a0a0a] border-l border-white/10 shadow-2xl",
          "flex flex-col",
          "transform transition-transform duration-300",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5">
              <Download className="h-5 w-5 text-white/60" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Download History</h2>
              <p className="text-sm text-white/50">Your downloaded photos</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-white/60 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
              <p className="mt-4 text-sm text-white/50">Loading history...</p>
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-center">
              <p className="text-sm text-red-400">{error}</p>
              <button
                onClick={fetchDownloadHistory}
                className="mt-3 text-sm text-white/60 hover:text-white"
              >
                Try again
              </button>
            </div>
          ) : downloads.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/5">
                <Download className="h-8 w-8 text-white/30" />
              </div>
              <h3 className="mt-4 text-lg font-medium text-white">No downloads yet</h3>
              <p className="mt-2 text-sm text-white/50 max-w-xs">
                Photos you download will appear here for your reference
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {downloads.map((download) => (
                <div
                  key={download.id}
                  className="flex items-center gap-4 rounded-lg border border-white/10 bg-white/5 p-4"
                >
                  {/* Thumbnail or icon */}
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                    {download.thumbnailUrl ? (
                      <img
                        src={download.thumbnailUrl}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    ) : download.type === "batch" ? (
                      <Package className="h-5 w-5 text-white/60" />
                    ) : (
                      <Image className="h-5 w-5 text-white/60" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">
                      {download.filename}
                    </p>
                    <div className="mt-1 flex items-center gap-3 text-xs text-white/50">
                      <span className="capitalize">{download.format}</span>
                      {download.type === "batch" && (
                        <span>{download.fileCount} photos</span>
                      )}
                    </div>
                  </div>

                  {/* Time */}
                  <div className="flex items-center gap-1.5 text-xs text-white/40">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(download.downloadedAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {downloads.length > 0 && (
          <div className="border-t border-white/10 px-6 py-4">
            <p className="text-xs text-white/40 text-center">
              Showing your {downloads.length} most recent download{downloads.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
