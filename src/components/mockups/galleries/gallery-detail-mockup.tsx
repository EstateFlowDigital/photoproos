"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import {
  ArrowLeft,
  Share2,
  Download,
  Settings,
  Eye,
  Heart,
  MoreHorizontal,
  CheckCircle,
} from "lucide-react";

export function GalleryDetailMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);
  const galleryName = (data.galleryName as string) || industryData.galleryName;
  const photoCount = (data.photoCount as number) || 48;
  const clientName = (data.clientName as string) || industryData.contactName;

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  // Generate photo placeholders
  const photos = Array.from({ length: 12 }, (_, i) => ({
    id: i + 1,
    selected: i < 3,
    favorited: i === 1 || i === 5,
  }));

  return (
    <div
      className={cn(
        "gallery-detail-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <h2 className="text-base font-semibold text-foreground">{galleryName}</h2>
              <p className="text-xs text-foreground-muted">
                {clientName} • {photoCount} photos
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-lg border border-[var(--border)] p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <Share2 className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-[var(--border)] p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <Download className="h-4 w-4" />
            </button>
            <button className="rounded-lg border border-[var(--border)] p-2 text-foreground-muted hover:bg-[var(--background-hover)]">
              <Settings className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <Eye className="h-4 w-4" />
            <span>156 views</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <Heart className="h-4 w-4" />
            <span>12 favorites</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-foreground-muted">
            <Download className="h-4 w-4" />
            <span>8 downloads</span>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-full bg-[var(--success)]/10 px-2.5 py-1 text-xs font-medium text-[var(--success)]">
              Delivered
            </span>
          </div>
        </div>
      </div>

      {/* Photo grid */}
      <div className="p-4">
        <div className="grid grid-cols-4 gap-2">
          {photos.map((photo) => (
            <div
              key={photo.id}
              className={cn(
                "group relative aspect-[4/3] rounded-lg overflow-hidden cursor-pointer",
                "bg-gradient-to-br from-[var(--primary)]/20 via-[var(--primary)]/10 to-[var(--primary)]/5"
              )}
            >
              {/* Selection indicator */}
              {photo.selected && (
                <div className="absolute top-2 left-2 z-10">
                  <div className="rounded-full bg-[var(--primary)] p-1">
                    <CheckCircle className="h-3 w-3 text-white" />
                  </div>
                </div>
              )}

              {/* Favorite indicator */}
              {photo.favorited && (
                <div className="absolute top-2 right-2 z-10">
                  <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                </div>
              )}

              {/* Hover overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                <button className="rounded-full bg-white/90 p-2">
                  <MoreHorizontal className="h-4 w-4 text-gray-900" />
                </button>
              </div>

              {/* Photo number placeholder */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-sm font-medium text-[var(--primary)]/40">
                  {String(photo.id).padStart(2, "0")}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
