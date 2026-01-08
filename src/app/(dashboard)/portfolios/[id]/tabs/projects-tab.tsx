"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { PortfolioWebsite, AvailableProject } from "../portfolio-editor-client";
import { updatePortfolioWebsiteProjects } from "@/lib/actions/portfolio-websites";

interface ProjectsTabProps {
  website: PortfolioWebsite;
  availableProjects: AvailableProject[];
  isPending: boolean;
  onSave?: () => void;
}

export function ProjectsTab({
  website,
  availableProjects,
  isPending: parentPending,
  onSave,
}: ProjectsTabProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedProjectIds, setSelectedProjectIds] = useState(() => {
    return new Set(website.projects.map((item) => item.projectId));
  });

  const loading = isPending || parentPending;

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) return availableProjects;

    const query = searchQuery.toLowerCase();
    return availableProjects.filter(
      (project) =>
        project.name.toLowerCase().includes(query) ||
        project.client?.fullName?.toLowerCase().includes(query) ||
        (project.client?.email || "").toLowerCase().includes(query)
    );
  }, [availableProjects, searchQuery]);

  const handleSaveProjects = () => {
    startTransition(async () => {
      const result = await updatePortfolioWebsiteProjects(
        website.id,
        Array.from(selectedProjectIds)
      );

      if (result.success) {
        showToast("Portfolio projects updated", "success");
        router.refresh();
        onSave?.();
      } else {
        showToast(result.error || "Failed to update projects", "error");
      }
    });
  };

  const handleSelectAll = () => {
    setSelectedProjectIds(new Set(availableProjects.map((p) => p.id)));
  };

  const handleDeselectAll = () => {
    setSelectedProjectIds(new Set());
  };

  const selectedCount = selectedProjectIds.size;
  const hasChanges =
    selectedCount !== website.projects.length ||
    !website.projects.every((p) => selectedProjectIds.has(p.projectId));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Portfolio Projects
          </h3>
          <p className="text-sm text-foreground-muted">
            Select which galleries appear on your portfolio website.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-foreground-muted">
            {selectedCount} of {availableProjects.length} selected
          </span>
        </div>
      </div>

      {/* Search and Bulk Actions */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full rounded-lg border border-[var(--card-border)] bg-[var(--background)] pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground-muted outline-none focus:border-[var(--primary)]"
          />
        </div>
        <button
          onClick={handleSelectAll}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Select All
        </button>
        <button
          onClick={handleDeselectAll}
          className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
        >
          Deselect All
        </button>
      </div>

      {/* Project Grid */}
      {filteredProjects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--background-secondary)] px-6 py-12 text-center">
          <ImagesIcon className="mx-auto h-10 w-10 text-foreground-muted" />
          <p className="mt-3 text-sm font-medium text-foreground">
            {searchQuery ? "No projects match your search" : "No projects yet"}
          </p>
          <p className="mt-1 text-sm text-foreground-muted">
            {searchQuery
              ? "Try a different search term"
              : "Create a project to add it to your portfolio"}
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => {
            const isSelected = selectedProjectIds.has(project.id);

            return (
              <button
                key={project.id}
                onClick={() => {
                  setSelectedProjectIds((prev) => {
                    const next = new Set(prev);
                    if (isSelected) {
                      next.delete(project.id);
                    } else {
                      next.add(project.id);
                    }
                    return next;
                  });
                }}
                className={cn(
                  "group relative flex flex-col overflow-hidden rounded-xl border-2 text-left transition-all",
                  isSelected
                    ? "border-[var(--primary)] bg-[var(--primary)]/5"
                    : "border-[var(--card-border)] hover:border-[var(--border-hover)]"
                )}
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] bg-[var(--background-secondary)]">
                  {project.coverImageUrl ? (
                    <img
                      src={project.coverImageUrl}
                      alt={project.name}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <ImageIcon className="h-8 w-8 text-foreground-muted" />
                    </div>
                  )}

                  {/* Selection indicator */}
                  <div
                    className={cn(
                      "absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full transition-all",
                      isSelected
                        ? "bg-[var(--primary)] text-white"
                        : "bg-black/40 text-white/60 group-hover:bg-black/60"
                    )}
                  >
                    {isSelected && <CheckIcon className="h-4 w-4" />}
                  </div>
                </div>

                {/* Project Info */}
                <div className="flex-1 p-3">
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="mt-0.5 text-sm text-foreground-muted">
                    {project.client?.fullName ||
                      project.client?.email ||
                      "No client"}
                  </p>
                  <span
                    className={cn(
                      "mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium",
                      project.status === "delivered"
                        ? "bg-green-500/10 text-green-400"
                        : project.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-400"
                        : "bg-[var(--background-secondary)] text-foreground-muted"
                    )}
                  >
                    {project.status.replace("_", " ")}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Save Button */}
      <div className="flex flex-col gap-3 border-t border-[var(--card-border)] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-foreground-muted">
          {hasChanges ? "You have unsaved changes" : "All changes saved"}
        </p>
        <button
          onClick={handleSaveProjects}
          disabled={loading || !hasChanges}
          className="rounded-lg bg-[var(--primary)] px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90 disabled:opacity-50"
        >
          {loading ? "Saving..." : "Save Projects"}
        </button>
      </div>
    </div>
  );
}

// Icons
function SearchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ImagesIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 22H4a2 2 0 0 1-2-2V6" />
      <path d="m22 13-1.296-1.296a2.41 2.41 0 0 0-3.408 0L11 18" />
      <circle cx="12" cy="8" r="2" />
      <rect width="16" height="16" x="6" y="2" rx="2" />
    </svg>
  );
}

function ImageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className}>
      <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z" clipRule="evenodd" />
    </svg>
  );
}
