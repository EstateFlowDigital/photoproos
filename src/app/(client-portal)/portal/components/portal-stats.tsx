import type { PortalStatsData } from "./types";

interface PortalStatsProps {
  stats: PortalStatsData;
}

export function PortalStats({ stats }: PortalStatsProps) {
  return (
    <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-sm text-[#7c7c7c]">Properties</p>
        <p className="mt-1 text-2xl font-bold text-white">{stats.totalProperties}</p>
      </div>
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-sm text-[#7c7c7c]">Total Views</p>
        <p className="mt-1 text-2xl font-bold text-white">{stats.totalViews.toLocaleString()}</p>
      </div>
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-sm text-[#7c7c7c]">Leads</p>
        <p className="mt-1 text-2xl font-bold text-[#3b82f6]">{stats.totalLeads}</p>
      </div>
      <div className="rounded-xl border border-[#262626] bg-[#141414] p-4">
        <p className="text-sm text-[#7c7c7c]">Photos</p>
        <p className="mt-1 text-2xl font-bold text-white">{stats.totalPhotos}</p>
      </div>
    </div>
  );
}
