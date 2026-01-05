"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { extendGalleryExpiration } from "@/lib/actions/gallery-expiration";

interface ExpiringGallery {
  id: string;
  name: string;
  clientEmail: string;
  clientName: string;
  expiresAt: Date;
  daysUntilExpiry: number;
  deliverySlug: string;
}

interface ExpiringGalleriesWidgetProps {
  galleries: ExpiringGallery[];
}

export function ExpiringGalleriesWidget({ galleries }: ExpiringGalleriesWidgetProps) {
  const [extendingId, setExtendingId] = useState<string | null>(null);

  if (galleries.length === 0) {
    return null;
  }

  const handleExtend = async (e: React.MouseEvent, galleryId: string, days: number) => {
    e.preventDefault();
    e.stopPropagation();

    setExtendingId(galleryId);
    try {
      await extendGalleryExpiration(galleryId, days);
    } catch (error) {
      console.error("Failed to extend expiration:", error);
    } finally {
      setExtendingId(null);
    }
  };

  return (
    <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="h-5 w-5 text-[var(--warning)]" />
        <h2 className="text-lg font-semibold text-foreground">Expiring Soon</h2>
      </div>

      <p className="text-sm text-foreground-muted mb-4">
        {galleries.length} {galleries.length === 1 ? "gallery" : "galleries"} expiring in the next 7 days
      </p>

      <div className="space-y-3">
        {galleries.map((gallery) => (
          <div
            key={gallery.id}
            className="rounded-lg border border-[var(--card-border)] p-4 hover:border-[var(--border-hover)] hover:bg-[var(--background-hover)] transition-colors"
          >
            <Link href={`/galleries/${gallery.id}`} className="block">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-foreground truncate">
                    {gallery.name}
                  </h3>
                  <p className="text-sm text-foreground-muted truncate">
                    {gallery.clientName}
                  </p>
                </div>
                <div
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-1 text-xs font-medium",
                    gallery.daysUntilExpiry <= 1
                      ? "bg-[var(--error)]/10 text-[var(--error)]"
                      : gallery.daysUntilExpiry <= 3
                      ? "bg-[var(--warning)]/10 text-[var(--warning)]"
                      : "bg-[var(--primary)]/10 text-[var(--primary)]"
                  )}
                >
                  {gallery.daysUntilExpiry === 0
                    ? "Expires today"
                    : gallery.daysUntilExpiry === 1
                    ? "1 day"
                    : `${gallery.daysUntilExpiry} days`}
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-foreground-muted mb-3">
                <Calendar className="h-3 w-3" />
                <span>
                  Expires {new Date(gallery.expiresAt).toLocaleDateString()}
                </span>
              </div>
            </Link>

            <div className="flex items-center gap-2 pt-2 border-t border-[var(--card-border)]">
              <button
                onClick={(e) => handleExtend(e, gallery.id, 7)}
                disabled={extendingId === gallery.id}
                className="flex items-center gap-1.5 rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="h-3 w-3" />
                {extendingId === gallery.id ? "Extending..." : "Extend +7 days"}
              </button>
              <button
                onClick={(e) => handleExtend(e, gallery.id, 30)}
                disabled={extendingId === gallery.id}
                className="flex items-center gap-1.5 rounded-md border border-[var(--card-border)] bg-[var(--background)] px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-[var(--background-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Clock className="h-3 w-3" />
                {extendingId === gallery.id ? "Extending..." : "Extend +30 days"}
              </button>
            </div>
          </div>
        ))}
      </div>

      <Link
        href="/galleries?filter=expiring"
        className="mt-4 block text-center text-sm text-[var(--primary)] hover:underline"
      >
        View all expiring galleries →
      </Link>
    </div>
  );
}
