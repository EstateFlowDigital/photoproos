"use client";

import type { ServiceTerritory } from "@/lib/actions/territories";

interface TerritoriesClientProps {
  initialTerritories: ServiceTerritory[];
  services: { id: string; name: string }[];
}

export function TerritoriesClient({ initialTerritories, services }: TerritoriesClientProps): JSX.Element {
  return (
    <div className="space-y-4 rounded-xl border border-[var(--card-border)] bg-[var(--card)] p-6">
      <h1 className="text-xl font-semibold text-foreground">Service Territories</h1>
      <p className="text-sm text-foreground-muted">
        Territory management (zone-based pricing, travel rules, and per-service overrides) is coming soon.
      </p>
      <div className="auto-grid grid-min-200 grid-gap-3">
        <div className="rounded-lg border border-[var(--card-border)] bg-background p-4">
          <p className="text-xs uppercase text-foreground-muted">Territories</p>
          <p className="text-2xl font-semibold text-foreground">{initialTerritories.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-background p-4">
          <p className="text-xs uppercase text-foreground-muted">Services</p>
          <p className="text-2xl font-semibold text-foreground">{services.length}</p>
        </div>
        <div className="rounded-lg border border-[var(--card-border)] bg-background p-4">
          <p className="text-xs uppercase text-foreground-muted">Status</p>
          <p className="text-2xl font-semibold text-foreground">Draft</p>
        </div>
      </div>
      <p className="text-xs text-foreground-muted">
        This stub keeps the route compiling while we finish the full territory editor. No data is modified.
      </p>
    </div>
  );
}
