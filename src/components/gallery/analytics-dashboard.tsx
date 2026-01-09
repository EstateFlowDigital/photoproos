"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ui/toast";
import {
  getComprehensiveGalleryAnalytics,
  exportGalleryAnalyticsReport,
  type GalleryAnalyticsOverview,
  type PhotoEngagementData,
  type DownloadLogEntry,
} from "@/lib/actions/gallery-analytics";

// =============================================================================
// Types
// =============================================================================

interface AnalyticsDashboardProps {
  galleryId: string;
  galleryName: string;
  isDelivered: boolean;
  onDeliverClick?: () => void;
}

interface DownloadsByDay {
  date: string;
  count: number;
}

// =============================================================================
// Icons
// =============================================================================

function EyeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
      <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41ZM14 10a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z" clipRule="evenodd" />
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

function HeartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="m9.653 16.915-.005-.003-.019-.01a20.759 20.759 0 0 1-1.162-.682 22.045 22.045 0 0 1-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 0 1 8-2.828A4.5 4.5 0 0 1 18 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 0 1-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 0 1-.69.001l-.002-.001Z" />
    </svg>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M15.5 2A1.5 1.5 0 0 0 14 3.5v13a1.5 1.5 0 0 0 1.5 1.5h1a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 16.5 2h-1ZM9.5 6A1.5 1.5 0 0 0 8 7.5v9A1.5 1.5 0 0 0 9.5 18h1a1.5 1.5 0 0 0 1.5-1.5v-9A1.5 1.5 0 0 0 10.5 6h-1ZM3.5 10A1.5 1.5 0 0 0 2 11.5v5A1.5 1.5 0 0 0 3.5 18h1A1.5 1.5 0 0 0 6 16.5v-5A1.5 1.5 0 0 0 4.5 10h-1Z" />
    </svg>
  );
}

function ExportIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
    </svg>
  );
}

function GridIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 0 0 2 4.25v2.5A2.25 2.25 0 0 0 4.25 9h2.5A2.25 2.25 0 0 0 9 6.75v-2.5A2.25 2.25 0 0 0 6.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 2 13.25v2.5A2.25 2.25 0 0 0 4.25 18h2.5A2.25 2.25 0 0 0 9 15.75v-2.5A2.25 2.25 0 0 0 6.75 11h-2.5Zm9-9A2.25 2.25 0 0 0 11 4.25v2.5A2.25 2.25 0 0 0 13.25 9h2.5A2.25 2.25 0 0 0 18 6.75v-2.5A2.25 2.25 0 0 0 15.75 2h-2.5Zm0 9A2.25 2.25 0 0 0 11 13.25v2.5A2.25 2.25 0 0 0 13.25 18h2.5A2.25 2.25 0 0 0 18 15.75v-2.5A2.25 2.25 0 0 0 15.75 11h-2.5Z" clipRule="evenodd" />
    </svg>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M2 4.75A.75.75 0 0 1 2.75 4h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 4.75ZM2 10a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75A.75.75 0 0 1 2 10Zm0 5.25a.75.75 0 0 1 .75-.75h14.5a.75.75 0 0 1 0 1.5H2.75a.75.75 0 0 1-.75-.75Z" clipRule="evenodd" />
    </svg>
  );
}

function SendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path d="M3.105 2.288a.75.75 0 0 0-.826.95l1.414 4.926A1.5 1.5 0 0 0 5.135 9.25h6.115a.75.75 0 0 1 0 1.5H5.135a1.5 1.5 0 0 0-1.442 1.086l-1.414 4.926a.75.75 0 0 0 .826.95 28.897 28.897 0 0 0 15.293-7.155.75.75 0 0 0 0-1.114A28.897 28.897 0 0 0 3.105 2.288Z" />
    </svg>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm.75-13a.75.75 0 0 0-1.5 0v5c0 .414.336.75.75.75h4a.75.75 0 0 0 0-1.5h-3.25V5Z" clipRule="evenodd" />
    </svg>
  );
}

function RefreshIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M15.312 11.424a5.5 5.5 0 0 1-9.201 2.466l-.312-.311h2.433a.75.75 0 0 0 0-1.5H3.989a.75.75 0 0 0-.75.75v4.242a.75.75 0 0 0 1.5 0v-2.43l.31.31a7 7 0 0 0 11.712-3.138.75.75 0 0 0-1.449-.39Zm1.23-3.723a.75.75 0 0 0 .219-.53V2.929a.75.75 0 0 0-1.5 0V5.36l-.31-.31A7 7 0 0 0 3.239 8.188a.75.75 0 1 0 1.448.389A5.5 5.5 0 0 1 13.89 6.11l.311.31h-2.432a.75.75 0 0 0 0 1.5h4.243a.75.75 0 0 0 .53-.219Z" clipRule="evenodd" />
    </svg>
  );
}

// =============================================================================
// Heat Map Color Functions
// =============================================================================

function getHeatMapColor(score: number): string {
  // Score 0-100 mapped to colors from cool (blue) to hot (red/orange)
  if (score === 0) return "rgba(59, 130, 246, 0.1)"; // Very light blue
  if (score < 20) return "rgba(59, 130, 246, 0.3)"; // Light blue
  if (score < 40) return "rgba(34, 197, 94, 0.4)"; // Green
  if (score < 60) return "rgba(234, 179, 8, 0.5)"; // Yellow
  if (score < 80) return "rgba(249, 115, 22, 0.6)"; // Orange
  return "rgba(239, 68, 68, 0.7)"; // Red
}

function getHeatMapBorder(score: number): string {
  if (score === 0) return "border-blue-500/20";
  if (score < 20) return "border-blue-500/40";
  if (score < 40) return "border-green-500/50";
  if (score < 60) return "border-yellow-500/60";
  if (score < 80) return "border-orange-500/70";
  return "border-red-500/80";
}

// =============================================================================
// Component
// =============================================================================

export function AnalyticsDashboard({
  galleryId,
  galleryName,
  isDelivered,
  onDeliverClick,
}: AnalyticsDashboardProps) {
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<GalleryAnalyticsOverview | null>(null);
  const [photoEngagement, setPhotoEngagement] = useState<PhotoEngagementData[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadLogEntry[]>([]);
  const [downloadsByDay, setDownloadsByDay] = useState<DownloadsByDay[]>([]);
  const [downloadsByFormat, setDownloadsByFormat] = useState<Record<string, number>>({});
  const [photoCount, setPhotoCount] = useState(0);
  const [viewMode, setViewMode] = useState<"heatmap" | "list">("heatmap");
  const [isExporting, setIsExporting] = useState(false);

  // Load analytics data
  useEffect(() => {
    async function loadAnalytics() {
      if (!isDelivered) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const result = await getComprehensiveGalleryAnalytics(galleryId);
        if (result.success && result.data) {
          setOverview(result.data.overview);
          setPhotoEngagement(result.data.photoEngagement);
          setDownloadHistory(result.data.downloadHistory);
          setDownloadsByDay(result.data.downloadsByDay);
          setDownloadsByFormat(result.data.downloadsByFormat);
          setPhotoCount(result.data.photoCount);
        }
      } catch (error) {
        console.error("Error loading analytics:", error);
        showToast("Failed to load analytics", "error");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [galleryId, isDelivered, showToast]);

  // Export analytics
  const handleExport = async (format: "csv" | "json" | "pdf") => {
    setIsExporting(true);
    try {
      if (format === "pdf") {
        // PDF export via API route
        const response = await fetch(`/api/gallery/${galleryId}/analytics-report`);
        if (!response.ok) {
          const error = await response.json().catch(() => ({}));
          throw new Error(error.error || "Failed to generate PDF");
        }
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${galleryName}-analytics.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("Analytics PDF exported successfully", "success");
      } else {
        const result = await exportGalleryAnalyticsReport(galleryId, format);
        if (result.success && result.data && result.filename) {
          // Create download
          const blob = new Blob([result.data], {
            type: format === "csv" ? "text/csv" : "application/json",
          });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = result.filename;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          showToast("Analytics exported successfully", "success");
        } else {
          showToast("error" in result ? result.error : "Export failed", "error");
        }
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Export failed", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Refresh analytics
  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await getComprehensiveGalleryAnalytics(galleryId);
      if (result.success && result.data) {
        setOverview(result.data.overview);
        setPhotoEngagement(result.data.photoEngagement);
        setDownloadHistory(result.data.downloadHistory);
        setDownloadsByDay(result.data.downloadsByDay);
        setDownloadsByFormat(result.data.downloadsByFormat);
        setPhotoCount(result.data.photoCount);
        showToast("Analytics refreshed", "success");
      }
    } catch {
      showToast("Failed to refresh analytics", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // Show placeholder if not delivered
  if (!isDelivered) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] py-16 text-center">
        <ChartIcon className="mx-auto h-12 w-12 text-foreground-muted" />
        <h3 className="mt-4 text-lg font-medium text-foreground">
          Analytics Available After Delivery
        </h3>
        <p className="mt-2 text-sm text-foreground-muted max-w-sm mx-auto">
          Once you deliver this gallery to your client, you&apos;ll be able to track views,
          downloads, and engagement metrics.
        </p>
        {onDeliverClick && (
          <button
            onClick={onDeliverClick}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--primary)]/90"
          >
            <SendIcon className="h-4 w-4" />
            Deliver Gallery
          </button>
        )}
      </div>
    );
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton for key metrics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 animate-pulse"
            >
              <div className="h-8 w-8 rounded-lg bg-[var(--background)]" />
              <div className="mt-3 h-8 w-20 rounded bg-[var(--background)]" />
              <div className="mt-2 h-4 w-24 rounded bg-[var(--background)]" />
            </div>
          ))}
        </div>
        {/* Loading skeleton for heat map */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6 animate-pulse">
          <div className="h-6 w-48 rounded bg-[var(--background)] mb-4" />
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-square rounded-lg bg-[var(--background)]" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Gallery Performance</h2>
          <p className="text-sm text-foreground-muted">
            {overview?.deliveredAt
              ? `Tracking since ${new Date(overview.deliveredAt).toLocaleDateString()}`
              : "Analytics data"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
          >
            <RefreshIcon className={cn("h-4 w-4", isLoading && "animate-spin")} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={() => handleExport("csv")}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              title="Export as CSV"
            >
              <ExportIcon className="h-4 w-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50"
              title="Export as PDF Report"
            >
              <ExportIcon className="h-4 w-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
              <EyeIcon className="h-4 w-4 text-[var(--primary)]" />
            </div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Total Views
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">{overview?.totalViews || 0}</p>
          <p className="mt-1 text-xs text-foreground-muted">
            {overview?.uniqueVisitors || 0} unique visitors
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10">
              <DownloadIcon className="h-4 w-4 text-[var(--success)]" />
            </div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Downloads
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {overview?.totalDownloads || 0}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">
            {photoCount > 0
              ? `${Math.round(((overview?.totalDownloads || 0) / photoCount) * 100)}% of photos`
              : "No photos"}
          </p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--error)]/10">
              <HeartIcon className="h-4 w-4 text-[var(--error)]" />
            </div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Favorites
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {overview?.totalFavorites || 0}
          </p>
          <p className="mt-1 text-xs text-foreground-muted">client selections</p>
        </div>
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--ai)]/10">
              <ChartIcon className="h-4 w-4 text-[var(--ai)]" />
            </div>
            <span className="text-xs font-medium text-foreground-muted uppercase tracking-wider">
              Engagement
            </span>
          </div>
          <p className="mt-3 text-3xl font-bold text-foreground">
            {overview?.avgEngagementRate || 0}%
          </p>
          <p className="mt-1 text-xs text-foreground-muted">download rate</p>
        </div>
      </div>

      {/* Photo Engagement Heat Map */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Photo Engagement Heat Map</h3>
            <p className="text-xs text-foreground-muted mt-0.5">
              Warmer colors indicate higher engagement (downloads, favorites, ratings)
            </p>
          </div>
          <div className="flex items-center gap-1 rounded-lg border border-[var(--card-border)] p-0.5">
            <button
              onClick={() => setViewMode("heatmap")}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                viewMode === "heatmap"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <GridIcon className="h-3.5 w-3.5" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium transition-colors",
                viewMode === "list"
                  ? "bg-[var(--primary)] text-white"
                  : "text-foreground-muted hover:text-foreground"
              )}
            >
              <ListIcon className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Heat Map Legend */}
        <div className="flex items-center gap-2 mb-4 text-xs text-foreground-muted">
          <span>Low</span>
          <div className="flex-1 h-2 rounded-full bg-gradient-to-r from-blue-500/30 via-yellow-500/50 to-red-500/70" />
          <span>High</span>
        </div>

        {viewMode === "heatmap" ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3">
            {photoEngagement.map((photo) => (
              <div
                key={photo.id}
                className={cn(
                  "group relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:scale-105",
                  getHeatMapBorder(photo.engagementScore)
                )}
                style={{ backgroundColor: getHeatMapColor(photo.engagementScore) }}
              >
                <img
                  src={photo.thumbnailUrl || "/placeholder-image.svg"}
                  alt={photo.filename}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.currentTarget.src = "/placeholder-image.svg"; }}
                />
                {/* Overlay with stats on hover */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 text-white text-xs">
                  <p className="font-medium truncate w-full text-center">{photo.filename}</p>
                  <div className="mt-1.5 space-y-0.5">
                    <p className="flex items-center justify-center gap-1">
                      <DownloadIcon className="h-3 w-3" />
                      {photo.downloads}
                    </p>
                    <p className="flex items-center justify-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      {photo.favorites}
                    </p>
                    {photo.rating && (
                      <p className="flex items-center justify-center gap-1">
                        ⭐ {photo.rating.toFixed(1)}
                      </p>
                    )}
                  </div>
                  <p className="mt-2 text-[10px] text-white/70">
                    Score: {photo.engagementScore}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {photoEngagement.map((photo, index) => (
              <div
                key={photo.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-[var(--background)] hover:bg-[var(--background-hover)]"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--card)] text-xs font-medium text-foreground-muted">
                  {index + 1}
                </span>
                <img
                  src={photo.thumbnailUrl || "/placeholder-image.svg"}
                  alt={photo.filename}
                  className="h-10 w-14 rounded object-cover"
                  onError={(e) => { e.currentTarget.src = "/placeholder-image.svg"; }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{photo.filename}</p>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted">
                    <span className="flex items-center gap-1">
                      <DownloadIcon className="h-3 w-3" />
                      {photo.downloads}
                    </span>
                    <span className="flex items-center gap-1">
                      <HeartIcon className="h-3 w-3" />
                      {photo.favorites}
                    </span>
                    {photo.rating && (
                      <span className="flex items-center gap-1">⭐ {photo.rating.toFixed(1)}</span>
                    )}
                  </div>
                </div>
                <div
                  className={cn(
                    "px-2 py-1 rounded text-xs font-medium",
                    photo.engagementScore >= 80
                      ? "bg-red-500/20 text-red-400"
                      : photo.engagementScore >= 60
                        ? "bg-orange-500/20 text-orange-400"
                        : photo.engagementScore >= 40
                          ? "bg-yellow-500/20 text-yellow-400"
                          : photo.engagementScore >= 20
                            ? "bg-green-500/20 text-green-400"
                            : "bg-blue-500/20 text-blue-400"
                  )}
                >
                  {photo.engagementScore}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Downloads Chart & History */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Downloads Over Time */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Downloads Over Time</h3>
          {downloadsByDay.length > 0 ? (
            <div className="flex items-end gap-2 h-32">
              {downloadsByDay.slice(-14).map((day, i) => {
                const maxDownloads = Math.max(...downloadsByDay.map((d) => d.count), 1);
                const height = (day.count / maxDownloads) * 100;
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-[var(--success)] rounded-t transition-all hover:bg-[var(--success)]/80"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={`${day.count} downloads on ${day.date}`}
                    />
                    <span className="text-[10px] text-foreground-muted truncate w-full text-center">
                      {new Date(day.date).toLocaleDateString("en-US", { day: "numeric" })}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-foreground-muted">
              No download data yet
            </div>
          )}
        </div>

        {/* Download by Format */}
        <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
          <h3 className="text-sm font-semibold text-foreground mb-4">Downloads by Format</h3>
          {Object.keys(downloadsByFormat).length > 0 ? (
            <div className="space-y-3">
              {Object.entries(downloadsByFormat).map(([format, count]) => {
                const total = Object.values(downloadsByFormat).reduce((a, b) => a + b, 0);
                const percentage = Math.round((count / total) * 100);
                return (
                  <div key={format} className="space-y-1">
                    <div className="flex items-start justify-between gap-4 flex-wrap text-sm">
                      <span className="text-foreground capitalize">
                        {format.replace("_", " ")}
                      </span>
                      <span className="text-foreground-muted">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-[var(--background)]">
                      <div
                        className="h-full rounded-full bg-[var(--primary)]"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="h-32 flex items-center justify-center text-sm text-foreground-muted">
              No download data yet
            </div>
          )}
        </div>
      </div>

      {/* Download History */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recent Downloads</h3>
        {downloadHistory.length > 0 ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {downloadHistory.map((download) => (
              <div
                key={download.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-[var(--background)]"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[var(--success)]/10">
                  <DownloadIcon className="h-4 w-4 text-[var(--success)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {download.assetFilename || `Batch download (${download.fileCount} files)`}
                  </p>
                  <p className="text-xs text-foreground-muted">
                    {download.clientEmail || "Anonymous"} • {download.format.replace("_", " ")}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-xs text-foreground-muted">
                  <ClockIcon className="h-3 w-3" />
                  {new Date(download.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-sm text-foreground-muted">
            No downloads recorded yet
          </div>
        )}
      </div>
    </div>
  );
}
