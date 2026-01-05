"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface PhotoEngagement {
  id: string;
  filename: string;
  thumbnailUrl: string;
  views: number;
  downloads: number;
  favorites: number;
  comments: number;
  rating: number | null;
}

interface GalleryHeatMapProps {
  photos: PhotoEngagement[];
  metric?: "views" | "downloads" | "favorites" | "engagement";
  showLabels?: boolean;
  columns?: number;
}

export function GalleryHeatMap({
  photos,
  metric = "engagement",
  showLabels = true,
  columns = 5,
}: GalleryHeatMapProps) {
  // Calculate engagement score and heat levels
  const processedPhotos = useMemo(() => {
    // Calculate engagement score for each photo
    const withScores = photos.map((photo) => {
      let score: number;
      switch (metric) {
        case "views":
          score = photo.views;
          break;
        case "downloads":
          score = photo.downloads;
          break;
        case "favorites":
          score = photo.favorites;
          break;
        case "engagement":
        default:
          // Weighted engagement: views + downloads*2 + favorites*3 + comments*2
          score =
            photo.views +
            photo.downloads * 2 +
            photo.favorites * 3 +
            photo.comments * 2;
          break;
      }
      return { ...photo, score };
    });

    // Find max score for normalization
    const maxScore = Math.max(...withScores.map((p) => p.score), 1);

    // Assign heat levels (0-4, with 4 being hottest)
    return withScores.map((photo) => ({
      ...photo,
      heatLevel: Math.floor((photo.score / maxScore) * 4),
      percentage: Math.round((photo.score / maxScore) * 100),
    }));
  }, [photos, metric]);

  // Heat level colors
  const heatColors = {
    0: "ring-[var(--foreground-muted)]/20 bg-[var(--foreground-muted)]/5",
    1: "ring-blue-500/30 bg-blue-500/10",
    2: "ring-yellow-500/40 bg-yellow-500/15",
    3: "ring-orange-500/50 bg-orange-500/20",
    4: "ring-red-500/60 bg-red-500/25",
  };

  const heatLabels = {
    0: "Cold",
    1: "Cool",
    2: "Warm",
    3: "Hot",
    4: "Very Hot",
  };

  // Stats summary
  const stats = useMemo(() => {
    const totalViews = photos.reduce((sum, p) => sum + p.views, 0);
    const totalDownloads = photos.reduce((sum, p) => sum + p.downloads, 0);
    const totalFavorites = photos.reduce((sum, p) => sum + p.favorites, 0);
    const avgRating =
      photos.filter((p) => p.rating !== null).reduce((sum, p) => sum + (p.rating || 0), 0) /
        photos.filter((p) => p.rating !== null).length || 0;

    const hotPhotos = processedPhotos.filter((p) => p.heatLevel >= 3).length;
    const coldPhotos = processedPhotos.filter((p) => p.heatLevel === 0).length;

    return {
      totalViews,
      totalDownloads,
      totalFavorites,
      avgRating: avgRating.toFixed(1),
      hotPhotos,
      coldPhotos,
      photoCount: photos.length,
    };
  }, [photos, processedPhotos]);

  if (photos.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-8 text-center">
        <HeatIcon className="mx-auto h-10 w-10 text-foreground-muted" />
        <p className="mt-3 text-sm text-foreground-muted">
          No engagement data available yet
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
          <p className="text-xs text-foreground-muted">Total Views</p>
          <p className="text-lg font-bold text-foreground">{stats.totalViews.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
          <p className="text-xs text-foreground-muted">Downloads</p>
          <p className="text-lg font-bold text-foreground">{stats.totalDownloads.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
          <p className="text-xs text-foreground-muted">Favorites</p>
          <p className="text-lg font-bold text-foreground">{stats.totalFavorites.toLocaleString()}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] p-3">
          <p className="text-xs text-foreground-muted">Hot Photos</p>
          <p className="text-lg font-bold text-[var(--error)]">{stats.hotPhotos}</p>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-3 text-xs">
        <span className="text-foreground-muted">Engagement:</span>
        {([0, 1, 2, 3, 4] as const).map((level) => (
          <div key={level} className="flex items-center gap-1.5">
            <div
              className={cn(
                "h-3 w-3 rounded ring-2",
                heatColors[level]
              )}
            />
            <span className="text-foreground-muted">{heatLabels[level]}</span>
          </div>
        ))}
      </div>

      {/* Heat Map Grid */}
      <div
        className="grid gap-2"
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {processedPhotos.map((photo) => (
          <div
            key={photo.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-lg ring-2 transition-all hover:ring-4 hover:scale-105 cursor-pointer",
              heatColors[photo.heatLevel as keyof typeof heatColors]
            )}
            title={`${photo.filename}\n${photo.score} engagement score (${photo.percentage}%)`}
          >
            <img
              src={photo.thumbnailUrl}
              alt={photo.filename}
              className="h-full w-full object-cover"
            />

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <div className="text-center text-white">
                <p className="text-xs font-medium">{heatLabels[photo.heatLevel as keyof typeof heatLabels]}</p>
                <p className="text-lg font-bold">{photo.percentage}%</p>
              </div>
            </div>

            {/* Stats badge */}
            {showLabels && photo.heatLevel >= 3 && (
              <div className="absolute top-1 right-1 bg-[var(--error)] text-white text-[10px] px-1.5 py-0.5 rounded font-medium">
                🔥
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Top Performers */}
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <h4 className="text-sm font-semibold text-foreground mb-3">Top Performers</h4>
        <div className="space-y-2">
          {processedPhotos
            .sort((a, b) => b.score - a.score)
            .slice(0, 5)
            .map((photo, index) => (
              <div key={photo.id} className="flex items-center gap-3">
                <span
                  className={cn(
                    "flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold",
                    index === 0
                      ? "bg-[var(--warning)] text-white"
                      : index === 1
                      ? "bg-gray-400 text-white"
                      : index === 2
                      ? "bg-amber-700 text-white"
                      : "bg-[var(--background-secondary)] text-foreground-muted"
                  )}
                >
                  {index + 1}
                </span>
                <img
                  src={photo.thumbnailUrl}
                  alt={photo.filename}
                  className="h-8 w-8 rounded object-cover"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {photo.filename}
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs text-foreground-muted">
                  <span title="Views">👁 {photo.views}</span>
                  <span title="Downloads">⬇ {photo.downloads}</span>
                  <span title="Favorites">❤ {photo.favorites}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function HeatIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path
        fillRule="evenodd"
        d="M12.963 2.286a.75.75 0 0 0-1.071-.136 9.742 9.742 0 0 0-3.539 6.177A7.547 7.547 0 0 1 6.648 6.61a.75.75 0 0 0-1.152-.082A9 9 0 1 0 15.68 4.534a7.46 7.46 0 0 1-2.717-2.248ZM15.75 14.25a3.75 3.75 0 1 1-7.313-1.172c.628.465 1.35.81 2.133 1a5.99 5.99 0 0 1 1.925-3.545 3.75 3.75 0 0 1 3.255 3.717Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
