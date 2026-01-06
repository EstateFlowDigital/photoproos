import type { PortalStatsData } from "./types";

interface PortalStatsProps {
  stats: PortalStatsData;
}

export function PortalStats({ stats }: PortalStatsProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--foreground-muted)]">Properties</p>
        <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.totalProperties}</p>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--foreground-muted)]">Total Views</p>
        <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.totalViews.toLocaleString()}</p>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--foreground-muted)]">Leads</p>
        <p className="mt-1 text-2xl font-bold text-[var(--primary)]">{stats.totalLeads}</p>
      </div>
      <div className="rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-4">
        <p className="text-sm text-[var(--foreground-muted)]">Photos</p>
        <p className="mt-1 text-2xl font-bold text-[var(--foreground)]">{stats.totalPhotos}</p>
      </div>
    </div>
  );
}
