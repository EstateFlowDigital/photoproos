import { cn } from "@/lib/utils";
import Link from "next/link";

type GalleryStatus = "delivered" | "pending" | "draft";

interface GalleryCardProps {
  id: string;
  title: string;
  client: string;
  photos: number;
  status: GalleryStatus;
  revenue?: string;
  thumbnailUrl?: string;
}

const statusColors: Record<GalleryStatus, string> = {
  delivered: "bg-[var(--success)]/10 text-[var(--success)]",
  pending: "bg-[var(--warning)]/10 text-[var(--warning)]",
  draft: "bg-[var(--background-secondary)] text-foreground-muted",
};

const statusLabels: Record<GalleryStatus, string> = {
  delivered: "Delivered",
  pending: "Pending",
  draft: "Draft",
};

export function GalleryCard({ id, title, client, photos, status, revenue, thumbnailUrl }: GalleryCardProps) {
  return (
    <Link
      href={`/galleries/${id}`}
      className="group block rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4 transition-all duration-200 hover:border-[var(--border-hover)] hover:shadow-lg hover:shadow-black/10"
    >
      {/* Thumbnail */}
      <div className="mb-3 aspect-video overflow-hidden rounded-lg bg-gradient-to-br from-[var(--primary)]/20 to-[var(--ai)]/20">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <GalleryPlaceholderIcon className="h-8 w-8 text-foreground-muted/50" />
          </div>
        )}
      </div>

      {/* Content */}
      <h4 className="truncate text-sm font-semibold text-foreground">{title}</h4>
      <p className="mt-0.5 truncate text-xs text-foreground-muted">{client}</p>

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xs text-foreground-muted">{photos} photos</span>
        <span className={cn(
          "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase",
          statusColors[status]
        )}>
          {statusLabels[status]}
        </span>
      </div>

      {/* Revenue */}
      {revenue && (
        <p className="mt-2 text-sm font-semibold text-[var(--success)]">{revenue}</p>
      )}
    </Link>
  );
}

function GalleryPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 0 1 3.25 3h13.5A2.25 2.25 0 0 1 19 5.25v9.5A2.25 2.25 0 0 1 16.75 17H3.25A2.25 2.25 0 0 1 1 14.75v-9.5Zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 0 0 .75-.75v-2.69l-2.22-2.219a.75.75 0 0 0-1.06 0l-1.91 1.909.47.47a.75.75 0 1 1-1.06 1.06L6.53 8.091a.75.75 0 0 0-1.06 0l-2.97 2.97ZM12 7a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z" clipRule="evenodd" />
    </svg>
  );
}
