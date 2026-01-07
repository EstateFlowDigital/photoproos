"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogBody,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  deletePropertyWebsite,
  duplicatePropertyWebsite,
  deletePropertyWebsites,
  publishPropertyWebsites
} from "@/lib/actions/property-websites";
import type { PropertyWebsiteWithRelations } from "@/lib/actions/property-websites";
import { VirtualList } from "@/components/ui/virtual-list";
import { PropertyCard } from "@/components/dashboard";
import {
  SearchIcon,
  PlusIcon,
  HomeIcon,
  CheckIcon,
  WarningIcon,
} from "@/components/ui/icons";

interface PropertiesClientProps {
  websites: PropertyWebsiteWithRelations[];
}

export function PropertiesClient({ websites }: PropertiesClientProps) {
  const router = useRouter();
  const { showToast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<PropertyWebsiteWithRelations | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showBatchDelete, setShowBatchDelete] = useState(false);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredWebsites.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredWebsites.map((w) => w.id)));
    }
  };

  const clearSelection = () => setSelectedIds(new Set());

  const filteredWebsites = websites.filter((website) => {
    // Filter by status
    if (filter === "published" && !website.isPublished) return false;
    if (filter === "draft" && website.isPublished) return false;

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        website.address.toLowerCase().includes(query) ||
        website.city.toLowerCase().includes(query) ||
        website.project.client?.fullName?.toLowerCase().includes(query) ||
        website.project.client?.company?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  const handleDelete = () => {
    if (!deleteTarget) return;

    startTransition(async () => {
      try {
        const result = await deletePropertyWebsite(deleteTarget.id);
        if (result.success) {
          showToast("Property website deleted", "success");
          setDeleteTarget(null);
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete property website", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  const handleDuplicate = (website: PropertyWebsiteWithRelations) => {
    startTransition(async () => {
      try {
        const result = await duplicatePropertyWebsite(website.id);
        if (result.success) {
          showToast("Property website duplicated", "success");
          router.refresh();
        } else {
          showToast(result.error || "Failed to duplicate", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  const handleBatchDelete = () => {
    startTransition(async () => {
      try {
        const result = await deletePropertyWebsites(Array.from(selectedIds));
        if (result.success) {
          showToast(`Deleted ${result.deleted} property websites`, "success");
          clearSelection();
          setShowBatchDelete(false);
          router.refresh();
        } else {
          showToast(result.error || "Failed to delete", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  const handleBatchPublish = (publish: boolean) => {
    startTransition(async () => {
      try {
        const result = await publishPropertyWebsites(Array.from(selectedIds), publish);
        if (result.success) {
          showToast(`${publish ? "Published" : "Unpublished"} ${result.updated} property websites`, "success");
          clearSelection();
          router.refresh();
        } else {
          showToast(result.error || "Failed to update", "error");
        }
      } catch {
        showToast("An error occurred", "error");
      }
    });
  };

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "all"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("published")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "published"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            Published
          </button>
          <button
            onClick={() => setFilter("draft")}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
              filter === "draft"
                ? "bg-foreground text-background"
                : "text-foreground-secondary hover:bg-[var(--background-hover)]"
            }`}
          >
            Drafts
          </button>
        </div>
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground-muted" />
          <input
            type="text"
            placeholder="Search properties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 w-full rounded-lg border border-[var(--card-border)] bg-[var(--card)] pl-10 pr-4 text-sm text-foreground placeholder:text-foreground-muted focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)] sm:w-64"
          />
        </div>
      </div>

      {/* Batch Action Toolbar */}
      {selectedIds.size > 0 && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2">
          <div className="flex w-[calc(100vw-2rem)] max-w-[900px] flex-wrap items-center justify-center gap-3 rounded-xl border border-[var(--card-border)] bg-[var(--card)] px-4 py-3 shadow-lg">
            <span className="text-sm font-medium text-foreground">
              {selectedIds.size} selected
            </span>
            <div className="h-4 w-px bg-[var(--card-border)]" />
            <button
              onClick={() => handleBatchPublish(true)}
              disabled={isPending}
              className="rounded-lg bg-[var(--success)]/20 px-3 py-1.5 text-sm font-medium text-[var(--success)] transition-colors hover:bg-[var(--success)]/30 disabled:opacity-50"
            >
              Publish
            </button>
            <button
              onClick={() => handleBatchPublish(false)}
              disabled={isPending}
              className="rounded-lg bg-foreground/10 px-3 py-1.5 text-sm font-medium text-foreground-secondary transition-colors hover:bg-foreground/20 disabled:opacity-50"
            >
              Unpublish
            </button>
            <button
              onClick={() => setShowBatchDelete(true)}
              disabled={isPending}
              className="rounded-lg bg-[var(--error)]/20 px-3 py-1.5 text-sm font-medium text-[var(--error)] transition-colors hover:bg-[var(--error)]/30 disabled:opacity-50"
            >
              Delete
            </button>
            <div className="h-4 w-px bg-[var(--card-border)]" />
            <button
              onClick={clearSelection}
              className="text-sm text-foreground-muted hover:text-foreground"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Property Grid */}
      {filteredWebsites.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--card-border)] bg-[var(--card)] p-12 text-center">
          <HomeIcon className="mx-auto h-12 w-12 text-foreground-muted" />
          <h3 className="mt-4 text-lg font-medium text-foreground">No property websites found</h3>
          <p className="mt-2 text-foreground-secondary">
            {searchQuery
              ? "Try adjusting your search query"
              : "Create your first property website to get started"}
          </p>
          {!searchQuery && (
            <Link
              href="/properties/new"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--primary)]/90"
            >
              <PlusIcon className="h-4 w-4" />
              Create Website
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* Select All */}
          <div className="flex items-center gap-2">
            <button
              onClick={toggleSelectAll}
              className="flex items-center gap-2 text-sm text-foreground-muted hover:text-foreground"
            >
              <div className={`flex h-5 w-5 items-center justify-center rounded border transition-colors ${
                selectedIds.size === filteredWebsites.length && filteredWebsites.length > 0
                  ? "border-[var(--primary)] bg-[var(--primary)]"
                  : "border-[var(--card-border)] bg-[var(--card)]"
              }`}>
                {selectedIds.size === filteredWebsites.length && filteredWebsites.length > 0 && (
                  <CheckIcon className="h-3 w-3 text-white" />
                )}
              </div>
              Select all
            </button>
          </div>
          <VirtualList
            className="max-h-[70vh]"
            items={useMemo(() => {
              const rows: PropertyWebsiteWithRelations[][] = [];
              const perRow = 3;
              for (let i = 0; i < filteredWebsites.length; i += perRow) {
                rows.push(filteredWebsites.slice(i, i + perRow));
              }
              return rows;
            }, [filteredWebsites])}
            getItemKey={(_, idx) => `row-${idx}`}
            estimateSize={() => 340}
            itemGap={16}
            renderItem={(row) => (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {row.map((website) => (
                  <PropertyCard
                    key={website.id}
                    website={website}
                    isSelected={selectedIds.has(website.id)}
                    onToggleSelect={() => toggleSelect(website.id)}
                    onDelete={(w) => setDeleteTarget(w)}
                    onDuplicate={() => handleDuplicate(website)}
                  />
                ))}
              </div>
            )}
          />
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="text-[var(--error)]">Delete Property Website</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="space-y-4">
              <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-4">
                <div className="flex items-start gap-3">
                  <WarningIcon className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
                  <div className="text-sm">
                    <p className="font-medium text-[var(--error)]">
                      You are about to delete this property website:
                    </p>
                    {deleteTarget && (
                      <div className="mt-2 text-foreground">
                        <p className="font-medium">{deleteTarget.address}</p>
                        <p className="text-foreground-muted">
                          {deleteTarget.city}, {deleteTarget.state} {deleteTarget.zipCode}
                        </p>
                      </div>
                    )}
                    <p className="mt-3 text-foreground-muted">
                      This will permanently delete the property website and all associated leads. The original gallery will not be affected.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setDeleteTarget(null)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                "Delete Property Website"
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Delete Confirmation Dialog */}
      <Dialog open={showBatchDelete} onOpenChange={setShowBatchDelete}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle className="text-[var(--error)]">Delete {selectedIds.size} Properties</DialogTitle>
            <DialogDescription>
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogBody>
            <div className="rounded-lg border border-[var(--error)]/30 bg-[var(--error)]/10 p-4">
              <div className="flex items-start gap-3">
                <WarningIcon className="h-5 w-5 text-[var(--error)] shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-[var(--error)]">
                    You are about to delete {selectedIds.size} property websites.
                  </p>
                  <p className="mt-2 text-foreground-muted">
                    This will permanently delete the property websites and all associated leads. The original galleries will not be affected.
                  </p>
                </div>
              </div>
            </div>
          </DialogBody>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowBatchDelete(false)}
              className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-[var(--background-hover)]"
            >
              Cancel
            </button>
            <button
              onClick={handleBatchDelete}
              disabled={isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--error)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--error)]/90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <>
                  <LoadingSpinner className="h-4 w-4" />
                  Deleting...
                </>
              ) : (
                `Delete ${selectedIds.size} Properties`
              )}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Loading spinner for delete confirmations
function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg className={`animate-spin ${className}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
    </svg>
  );
}
