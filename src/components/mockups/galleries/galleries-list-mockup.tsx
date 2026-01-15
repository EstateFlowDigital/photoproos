"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { getIndustryData } from "@/lib/mockups/industry-data";
import type { MockupProps } from "../types";
import { Plus, Search, Filter, MoreHorizontal, Eye, Download, Share2 } from "lucide-react";

export function GalleriesListMockup({
  data,
  theme,
  primaryColor,
  industry,
  className,
}: MockupProps) {
  const industryData = getIndustryData(industry);
  const galleryCount = (data.galleryCount as number) || industryData.metrics.activeGalleries;

  // Generate sample galleries based on industry
  const galleries = [
    {
      name: industryData.galleryName,
      client: industryData.clientName,
      photos: 48,
      views: 156,
      status: "delivered",
      date: "Jan 12, 2026",
    },
    {
      name: industry === "real_estate" ? "Sunset Hills Property" : "Spring Session",
      client: industry === "real_estate" ? "Coldwell Banker" : "Smith Family",
      photos: 32,
      views: 89,
      status: "pending",
      date: "Jan 10, 2026",
    },
    {
      name: industry === "real_estate" ? "Downtown Loft Shoot" : "Corporate Headshots",
      client: industry === "real_estate" ? "RE/MAX Elite" : "Tech Corp",
      photos: 24,
      views: 45,
      status: "draft",
      date: "Jan 8, 2026",
    },
  ];

  const primaryStyle = primaryColor
    ? ({ "--primary": primaryColor } as React.CSSProperties)
    : {};

  return (
    <div
      className={cn(
        "galleries-list-mockup rounded-xl border border-[var(--card-border)] bg-[var(--card)] overflow-hidden",
        theme === "light" && "bg-white border-gray-200",
        className
      )}
      style={primaryStyle}
    >
      {/* Header */}
      <div className="border-b border-[var(--card-border)] p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Galleries</h2>
            <p className="text-xs text-foreground-muted">{galleryCount} total galleries</p>
          </div>
          <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
            <Plus className="h-4 w-4" />
            New Gallery
          </button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search galleries..."
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--background)] py-2 pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
            />
          </div>
          <button className="flex items-center gap-2 rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-2 text-sm text-foreground-muted hover:bg-[var(--background-hover)]">
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-1 mt-4">
          {["All", "Delivered", "Pending", "Draft"].map((tab, i) => (
            <button
              key={tab}
              className={cn(
                "rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                i === 0
                  ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "text-foreground-muted hover:bg-[var(--background-hover)]"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Gallery list */}
      <div className="divide-y divide-[var(--card-border)]">
        {galleries.map((gallery, index) => (
          <div
            key={index}
            className="flex items-center gap-4 p-4 hover:bg-[var(--background-hover)] transition-colors"
          >
            {/* Thumbnail */}
            <div className="h-16 w-24 rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
              <span className="text-lg font-semibold text-[var(--primary)]">
                {gallery.photos}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-foreground truncate">{gallery.name}</h3>
              <p className="text-xs text-foreground-muted mt-0.5">{gallery.client}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-foreground-muted">{gallery.photos} photos</span>
                <span className="text-xs text-foreground-muted flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {gallery.views}
                </span>
              </div>
            </div>

            {/* Status */}
            <div
              className={cn(
                "rounded-full px-2.5 py-1 text-xs font-medium",
                gallery.status === "delivered" && "bg-[var(--success)]/10 text-[var(--success)]",
                gallery.status === "pending" && "bg-[var(--warning)]/10 text-[var(--warning)]",
                gallery.status === "draft" && "bg-foreground/10 text-foreground-muted"
              )}
            >
              {gallery.status.charAt(0).toUpperCase() + gallery.status.slice(1)}
            </div>

            {/* Date */}
            <span className="text-xs text-foreground-muted">{gallery.date}</span>

            {/* Actions */}
            <div className="flex items-center gap-1">
              <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                <Share2 className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                <Download className="h-4 w-4" />
              </button>
              <button className="rounded-lg p-2 text-foreground-muted hover:bg-[var(--background-elevated)] hover:text-foreground">
                <MoreHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
