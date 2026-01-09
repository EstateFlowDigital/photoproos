"use client";

import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";

interface AvailableProject {
  id: string;
  name: string;
  coverImageUrl: string | null;
}

interface GalleryConfigFormProps {
  config: Record<string, unknown>;
  updateConfig: (updates: Record<string, unknown>) => void;
  availableProjects: AvailableProject[];
}

export function GalleryConfigForm({
  config,
  updateConfig,
  availableProjects,
}: GalleryConfigFormProps) {
  const projectIds = (config.projectIds as string[]) || [];
  const layout = (config.layout as string) || "grid";
  const columns = (config.columns as number) || 3;
  const showProjectNames = config.showProjectNames !== false;

  const toggleProject = (projectId: string) => {
    const newIds = projectIds.includes(projectId)
      ? projectIds.filter((id) => id !== projectId)
      : [...projectIds, projectId];
    updateConfig({ projectIds: newIds });
  };

  const selectAll = () => {
    updateConfig({ projectIds: availableProjects.map((p) => p.id) });
  };

  const deselectAll = () => {
    updateConfig({ projectIds: [] });
  };

  return (
    <div className="space-y-5">
      {/* Layout */}
      <div>
        <label className="text-sm font-medium text-foreground">
          Gallery Layout
        </label>
        <div className="mt-2 flex gap-2">
          {(["grid", "masonry", "carousel"] as const).map((layoutOption) => (
            <button
              key={layoutOption}
              type="button"
              onClick={() => updateConfig({ layout: layoutOption })}
              className={cn(
                "flex-1 rounded-lg border px-4 py-2 text-sm font-medium capitalize transition-colors",
                layout === layoutOption
                  ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]"
                  : "border-[var(--card-border)] text-foreground hover:bg-[var(--background-hover)]"
              )}
            >
              {layoutOption}
            </button>
          ))}
        </div>
      </div>

      {/* Columns */}
      <div>
        <label htmlFor="gallery-columns-slider" className="text-sm font-medium text-foreground">
          Columns ({columns})
        </label>
        <input
          id="gallery-columns-slider"
          type="range"
          min={1}
          max={6}
          value={columns}
          onChange={(e) => updateConfig({ columns: parseInt(e.target.value) })}
          className="mt-2 w-full"
        />
        <div className="mt-1 flex justify-between text-xs text-foreground-muted">
          <span>1</span>
          <span>6</span>
        </div>
      </div>

      {/* Show Project Names */}
      <div>
        <label className="flex items-center gap-3">
          <Checkbox
            checked={showProjectNames}
            onCheckedChange={(checked) => updateConfig({ showProjectNames: checked === true })}
          />
          <span className="text-sm text-foreground">
            Show project names below images
          </span>
        </label>
      </div>

      {/* Project Selection */}
      <div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <label className="text-sm font-medium text-foreground">
            Select Projects{" "}
            <span className="text-foreground-muted">
              ({projectIds.length} selected)
            </span>
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={selectAll}
              className="text-xs font-medium text-[var(--primary)] hover:underline"
            >
              Select All
            </button>
            <button
              type="button"
              onClick={deselectAll}
              className="text-xs font-medium text-foreground-muted hover:underline"
            >
              Deselect All
            </button>
          </div>
        </div>
        <p className="mt-1 text-xs text-foreground-muted">
          Leave empty to show all projects from Portfolio Projects tab
        </p>

        {availableProjects.length === 0 ? (
          <div className="mt-3 rounded-lg border border-dashed border-[var(--card-border)] bg-[var(--background)] py-6 text-center text-sm text-foreground-muted">
            No projects available. Add projects in the Projects tab.
          </div>
        ) : (
          <div className="mt-3 grid max-h-64 gap-2 overflow-y-auto sm:grid-cols-2">
            {availableProjects.map((project) => {
              const isSelected = projectIds.includes(project.id);
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => toggleProject(project.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg border p-2 text-left transition-colors",
                    isSelected
                      ? "border-[var(--primary)] bg-[var(--primary)]/5"
                      : "border-[var(--card-border)] hover:bg-[var(--background-hover)]"
                  )}
                >
                  <div className="h-10 w-10 shrink-0 overflow-hidden rounded bg-[var(--background-secondary)]">
                    {project.coverImageUrl ? (
                      <img
                        src={project.coverImageUrl}
                        alt={project.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-xs text-foreground-muted">
                        ?
                      </div>
                    )}
                  </div>
                  <span className="flex-1 truncate text-sm text-foreground">
                    {project.name}
                  </span>
                  {isSelected && (
                    <CheckIcon className="h-4 w-4 shrink-0 text-[var(--primary)]" />
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
